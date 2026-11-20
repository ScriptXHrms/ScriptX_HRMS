import { Router } from 'express';
import mongoose from 'mongoose';
import { badRequest, escapeRegex, notFound, pageParams } from './http.js';

const applyPopulate = (query, populate) => (populate ? [populate].flat().reduce((q, p) => q.populate(p), query) : query);

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw notFound();
}

/**
 * Standard list / read / create / update / delete routes for a Mongoose model.
 *
 * searchFields  string fields matched by ?q=
 * filterFields  exact-match query params (?status=Active). A "from"/"to" pair filters `dateField`.
 * writable      whitelist of body fields; anything else is ignored
 * guard         [viewMiddleware, writeMiddleware] applied per method
 * sanitize      (data, req) => data, runs on create and update
 * summarize     async (filter) => object, merged into the list response as `summary`
 */
export function crudRouter(Model, options) {
  const {
    searchFields = [],
    filterFields = [],
    dateField,
    populate,
    sort = { createdAt: -1 },
    writable,
    guard = [],
    sanitize = (data) => data,
    summarize,
    beforeDelete,
    afterCreate,
    afterUpdate,
    afterDelete,
  } = options;
  const [canView = [], canWrite = []] = guard;
  const router = Router();

  const pick = (body) => {
    const data = {};
    writable.forEach((key) => {
      if (body[key] !== undefined) data[key] = body[key] === '' && Model.schema.path(key)?.instance === 'ObjectId' ? null : body[key];
    });
    return data;
  };

  const buildFilter = (query) => {
    const filter = {};
    filterFields.forEach((field) => {
      const value = query[field];
      if (value !== undefined && value !== '' && typeof value === 'string') filter[field] = value;
    });
    if (dateField && (query.from || query.to)) {
      filter[dateField] = {};
      if (query.from) filter[dateField].$gte = String(query.from);
      if (query.to) filter[dateField].$lte = String(query.to);
    }
    if (query.q && searchFields.length) {
      const pattern = new RegExp(escapeRegex(query.q), 'i');
      filter.$or = searchFields.map((field) => ({ [field]: pattern }));
    }
    return filter;
  };

  router.get('/', canView, async (req, res) => {
    const filter = buildFilter(req.query);
    const { page, limit, skip } = pageParams(req.query, 500, 2000);
    const [items, total, summary] = await Promise.all([
      applyPopulate(Model.find(filter).sort(sort).skip(skip).limit(limit), populate).lean(),
      Model.countDocuments(filter),
      summarize ? summarize(filter, req) : undefined,
    ]);
    res.json({ items, total, page, limit, summary });
  });

  router.get('/:id', canView, async (req, res) => {
    assertId(req.params.id);
    const item = await applyPopulate(Model.findById(req.params.id), populate).lean();
    if (!item) throw notFound();
    res.json({ item });
  });

  router.post('/', canWrite, async (req, res) => {
    const created = await Model.create(sanitize(pick(req.body), req));
    await afterCreate?.(created, req);
    const item = await applyPopulate(Model.findById(created._id), populate).lean();
    res.status(201).json({ item });
  });

  router.put('/:id', canWrite, async (req, res) => {
    assertId(req.params.id);
    const doc = await Model.findById(req.params.id);
    if (!doc) throw notFound();
    doc.set(sanitize(pick(req.body), req, doc));
    await doc.save();
    await afterUpdate?.(doc, req);
    const item = await applyPopulate(Model.findById(doc._id), populate).lean();
    res.json({ item });
  });

  router.delete('/:id', canWrite, async (req, res) => {
    assertId(req.params.id);
    const doc = await Model.findById(req.params.id);
    if (!doc) throw notFound();
    await beforeDelete?.(doc, req);
    await doc.deleteOne();
    await afterDelete?.(doc, req);
    res.json({ ok: true });
  });

  return router;
}

export function requireFields(data, fields) {
  const missing = fields.filter(([key]) => data[key] === undefined || data[key] === null || data[key] === '');
  if (missing.length) throw badRequest(`${missing.map(([, label]) => label).join(', ')} required.`);
}
