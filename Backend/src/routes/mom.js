import { Router } from 'express';
import mongoose from 'mongoose';
import { Mom, Client, Project, Employee } from '../models/index.js';
import { uploader, fileRecord } from '../middleware/upload.js';
import { badRequest, notFound } from '../utils/http.js';
import { requireModule } from '../middleware/auth.js';

const router = Router();
const upload = uploader('mom');

// Normalize MOM doc to have both client & clientName, project & projectName for full compatibility
function normalizeMom(doc) {
  const obj = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (obj.client) {
    obj.clientName = obj.client;
  }
  if (obj.project) {
    obj.projectName = obj.project;
  }
  return obj;
}

const populateFields = [
  { path: 'client', select: 'client_name company_name email phone_number' },
  { path: 'project', select: 'name startDate endDate status' },
  { path: 'attendees', select: 'name employeeId photo department role' },
  { path: 'createdBy', select: 'name' },
];

/**
 * GET MOM list
 * Supports: /api/mom and /api/mom/get-mom
 */
const getMomList = async (req, res, next) => {
  try {
    const filter = {};
    const { client, clientId, project, from, to, q } = req.query;

    const targetClient = client || clientId;
    if (targetClient && mongoose.isValidObjectId(targetClient)) {
      filter.client = targetClient;
    }
    if (project && mongoose.isValidObjectId(project)) {
      filter.project = project;
    }
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = String(from);
      if (to) filter.date.$lte = String(to);
    }
    if (q) {
      filter.$or = [
        { title: { $regex: String(q).trim(), $options: 'i' } },
        { description: { $regex: String(q).trim(), $options: 'i' } },
      ];
    }

    const docs = await Mom.find(filter)
      .populate(populateFields)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const normalized = docs.map(normalizeMom);

    res.json({
      success: true,
      items: normalized,
      data: normalized,
      total: normalized.length,
    });
  } catch (err) {
    next(err);
  }
};

router.get('/', getMomList);
router.get('/get-mom', getMomList);

/**
 * GET single MOM
 * Supports: /api/mom/:id and /api/mom/get-mom/:id
 */
const getSingleMom = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw notFound('MOM not found');

    const doc = await Mom.findById(id).populate(populateFields).lean();
    if (!doc) throw notFound('MOM not found');

    const item = normalizeMom(doc);
    res.json({
      success: true,
      item,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

router.get('/:id', getSingleMom);
router.get('/get-mom/:id', getSingleMom);

/**
 * Helper to extract attendees array from req.body
 */
function parseAttendees(body) {
  let raw = body.attendees || body['attendees[]'];
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Comma-separated or single id string
      return raw.split(',').map((s) => s.trim()).filter((s) => mongoose.isValidObjectId(s));
    }
    return [raw].filter((s) => mongoose.isValidObjectId(s));
  }
  if (Array.isArray(raw)) {
    return raw.map((item) => (typeof item === 'object' && item?._id ? item._id : item)).filter((s) => mongoose.isValidObjectId(s));
  }
  return [];
}

/**
 * CREATE MOM
 * Supports: /api/mom and /api/mom/create-mom
 */
const createMomHandler = async (req, res, next) => {
  try {
    const { date, title, description } = req.body;
    const client = req.body.client || req.body.clientName;
    const project = req.body.project || req.body.projectName;

    if (!date) throw badRequest('Meeting date is required.');
    if (!client) throw badRequest('Client is required.');
    if (!project) throw badRequest('Project is required.');
    if (!description || !String(description).trim()) throw badRequest('Description is required.');

    const attendees = parseAttendees(req.body);
    if (!attendees.length) throw badRequest('At least one attendee is required.');

    const uploadedFiles = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        uploadedFiles.push({
          name: file.originalname,
          originalName: file.originalname,
          filepath: file.filename,
          url: `/uploads/mom/${file.filename}`,
          size: file.size,
        });
      });
    }

    const newMom = new Mom({
      date,
      client,
      project,
      attendees,
      title: title || '',
      description,
      documents: uploadedFiles,
      createdBy: req.auth?.id || null,
    });

    const saved = await newMom.save();
    const populated = await Mom.findById(saved._id).populate(populateFields).lean();
    const item = normalizeMom(populated);

    res.status(201).json({
      success: true,
      message: 'MOM created successfully',
      item,
      mom: item,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

router.post('/', upload.any(), createMomHandler);
router.post('/create-mom', upload.any(), createMomHandler);

/**
 * UPDATE MOM
 * Supports: /api/mom/:id and /api/mom/update-mom/:id
 */
const updateMomHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw notFound('MOM not found');

    const existing = await Mom.findById(id);
    if (!existing) throw notFound('MOM not found');

    const { date, title, description } = req.body;
    const client = req.body.client || req.body.clientName;
    const project = req.body.project || req.body.projectName;

    if (date) existing.date = date;
    if (client) existing.client = client;
    if (project) existing.project = project;
    if (title !== undefined) existing.title = title;
    if (description) existing.description = description;

    const attendees = parseAttendees(req.body);
    if (attendees.length > 0) {
      existing.attendees = attendees;
    }

    // Process new uploaded files
    const newDocs = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        newDocs.push({
          name: file.originalname,
          originalName: file.originalname,
          filepath: file.filename,
          url: `/uploads/mom/${file.filename}`,
          size: file.size,
        });
      });
    }

    // Existing documents that user kept (can be passed as retainedDocuments JSON string)
    let retainedDocs = existing.documents || [];
    if (req.body.retainedDocuments) {
      try {
        const parsed = JSON.parse(req.body.retainedDocuments);
        if (Array.isArray(parsed)) {
          retainedDocs = parsed;
        }
      } catch {
        // keep existing if parse error
      }
    }

    existing.documents = [...retainedDocs, ...newDocs];
    await existing.save();

    const populated = await Mom.findById(existing._id).populate(populateFields).lean();
    const item = normalizeMom(populated);

    res.json({
      success: true,
      message: 'MOM updated successfully',
      item,
      mom: item,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

router.put('/:id', upload.any(), updateMomHandler);
router.put('/update-mom/:id', upload.any(), updateMomHandler);

/**
 * DELETE MOM
 * Supports: /api/mom/:id and /api/mom/delete-mom/:id
 */
const deleteMomHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw notFound('MOM not found');

    const deleted = await Mom.findByIdAndDelete(id);
    if (!deleted) throw notFound('MOM not found');

    res.json({
      success: true,
      message: 'MOM deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

router.delete('/:id', deleteMomHandler);
router.delete('/delete-mom/:id', deleteMomHandler);

export default router;
