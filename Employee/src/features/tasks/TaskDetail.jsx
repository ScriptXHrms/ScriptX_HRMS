import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FileText, Hourglass, Paperclip, Pause, Pencil, Play, Plus, RotateCcw, Send, Trash2, X } from 'lucide-react';
import TaskFormModal from './TaskFormModal';
import { assigneeNames, employeeCanMove, isClockRunning, isOverdue, taskClient, taskPath, workedMs } from './taskUtils';
import Avatar from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import FormModal from '../../components/FormModal';
import PageLoader from '../../components/PageLoader';
import SectionCard from '../../components/SectionCard';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import { api, fileUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EMPLOYEE_TASK_STATUSES, TASK_PRIORITIES, TASK_STATUSES, TESTER_STATUSES } from '../../data/constants';
import { useAction } from '../../hooks/useAction';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatElapsed, formatTime, relativeDueLabel, timeAgo } from '../../utils/dateUtils';
import { employeeOption, toOptions } from '../../utils/format';
import { cx } from '../../utils/cx';

const minutesSince = (date) => Math.max(0, Math.round((Date.now() - new Date(date)) / 60000));

function Meta({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}

/** HH:MM:SS worked, ticking every second while the clock runs (In Progress or In Review, not paused). */
function WorkedTime({ task }) {
  const running = isClockRunning(task);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTick((tick) => tick + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return (
    <span className="inline-flex items-center gap-2 tabular-nums">
      {running && <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" title="Clock running" aria-hidden="true" />}
      {formatElapsed(workedMs(task))}
      {running && <span className="sr-only">, clock running</span>}
    </span>
  );
}

// Matches what the API accepts for uploads.
const ATTACHABLE = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.txt', '.zip'];
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const IMAGE_FILE = /\.(png|jpe?g|webp|gif)$/i;
const LINK = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const POLL_MS = 10000;

const extensionOf = (name) => name.slice(name.lastIndexOf('.')).toLowerCase();

function fileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Comment text with web links made clickable. Links open in a new tab. */
function Linkified({ text }) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    // A full stop or bracket right after a link is part of the sentence, not the address.
    const url = match[0].replace(/[.,!?;:)\]]+$/, '');
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a
        key={match.index}
        href={url.startsWith('www.') ? `https://${url}` : url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium break-all text-brand-700 underline underline-offset-2 hover:text-brand-800"
      >
        {url}
      </a>,
    );
    last = match.index + url.length;
  }
  parts.push(text.slice(last));
  return parts;
}

/** Images as thumbnails, everything else as a file chip. All open in a new tab. */
function Attachments({ files }) {
  if (!files?.length) return null;
  const images = files.filter((f) => IMAGE_FILE.test(f.url));
  const others = files.filter((f) => !IMAGE_FILE.test(f.url));
  return (
    <div className="mt-2 space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((f) => (
            <a key={f._id} href={fileUrl(f.url)} target="_blank" rel="noopener noreferrer" title={`Open ${f.name}`} className="block overflow-hidden rounded-lg bg-white ring-1 ring-line transition hover:ring-brand-300">
              <img src={fileUrl(f.url)} alt={f.name} loading="lazy" className="h-28 w-auto max-w-[220px] object-cover" />
            </a>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {others.map((f) => (
            <a
              key={f._id}
              href={fileUrl(f.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-200 hover:text-brand-700"
            >
              <FileText size={14} className="shrink-0 text-brand-600" aria-hidden="true" />
              <span className="truncate">{f.name}</span>
              {f.size > 0 && <span className="shrink-0 font-normal text-muted">{fileSize(f.size)}</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** A file picked for the next comment, with a preview for images. */
function PendingFile({ file, onRemove }) {
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file.type.startsWith('image/')) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <li className="flex max-w-full items-center gap-2 rounded-lg border border-line bg-white py-1 pr-1 pl-1.5 text-xs">
      {preview ? <img src={preview} alt="" className="h-8 w-8 rounded object-cover" /> : <FileText size={16} className="mx-1 shrink-0 text-brand-600" aria-hidden="true" />}
      <span className="min-w-0 truncate font-semibold text-ink">{file.name}</span>
      <span className="shrink-0 text-muted">{fileSize(file.size)}</span>
      <button type="button" className="icon-btn h-7 w-7 shrink-0 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${file.name}`} onClick={onRemove}>
        <X size={14} aria-hidden="true" />
      </button>
    </li>
  );
}

function Comments({ taskId, comments, onAdded }) {
  const toast = useToast();
  const { user } = useAuth();
  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const listRef = useRef(null);
  // Follow new messages while the reader is at the bottom; leave them alone once they scroll up to read.
  const followRef = useRef(true);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const { busy, run } = useAction();

  // Any growth (a new comment, an image finishing loading) keeps the latest message in view.
  useEffect(() => {
    const box = scrollRef.current;
    const observer = new ResizeObserver(() => {
      if (followRef.current) box.scrollTop = box.scrollHeight;
    });
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  const pick = (event) => {
    const picked = [...event.target.files];
    event.target.value = '';
    const wrongType = picked.filter((f) => !ATTACHABLE.includes(extensionOf(f.name)));
    const tooBig = picked.filter((f) => ATTACHABLE.includes(extensionOf(f.name)) && f.size > MAX_FILE_BYTES);
    const ok = picked.filter((f) => !wrongType.includes(f) && !tooBig.includes(f));
    if (wrongType.length) toast.warning('File type not allowed', wrongType.map((f) => f.name).join(', '));
    if (tooBig.length) toast.warning('File is too large (10 MB maximum)', tooBig.map((f) => f.name).join(', '));
    setFiles((prev) => {
      const next = [...prev, ...ok];
      if (next.length > MAX_FILES) toast.warning(`Up to ${MAX_FILES} files per comment`, 'The extra files were left out.');
      return next.slice(0, MAX_FILES);
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!message.trim() && files.length === 0) {
      toast.warning('Nothing to post', 'Write a comment or attach a file.');
      return;
    }
    const form = new FormData();
    form.append('message', message);
    files.forEach((f) => form.append('files', f));
    const done = await run(() => api.post(`/tasks/${taskId}/comments`, form), { errorTitle: 'Couldn’t post your comment' });
    if (done) {
      setMessage('');
      setFiles([]);
      followRef.current = true;
      onAdded();
    }
  };

  return (
    <div>
      {comments.length === 0 && <p className="py-6 text-center text-sm text-muted">No comments yet. Start the conversation below.</p>}
      {/* About four messages tall; older ones scroll. Focusable so the keyboard can scroll it too. */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const box = e.currentTarget;
          followRef.current = box.scrollHeight - box.scrollTop - box.clientHeight < 48;
        }}
        tabIndex={comments.length ? 0 : -1}
        role="region"
        aria-label="Comment thread"
        className="scroll-thin -mr-2 max-h-[400px] overflow-y-auto overscroll-contain rounded-xl pr-2"
      >
        <ul ref={listRef} className="space-y-4">
          {comments.map((comment) => {
            const mine = String(comment.author?.id) === String(user?.id);
            return (
              <li key={comment._id} className="flex gap-3">
                <Avatar name={comment.author?.name} size="sm" />
                <div className={cx('min-w-0 flex-1 rounded-xl px-3.5 py-2.5', mine ? 'bg-brand-50' : 'bg-canvas')}>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-ink">{comment.author?.name}</span>
                    <span className={cx('rounded-full px-1.5 py-px text-[10px] font-bold tracking-wide uppercase', comment.author?.kind === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-sky-100 text-sky-700')}>
                      {comment.author?.kind === 'admin' ? 'Admin' : 'Employee'}
                    </span>
                    <span className="text-xs text-muted" title={new Date(comment.createdAt).toLocaleString()}>
                      {timeAgo(minutesSince(comment.createdAt))}
                    </span>
                  </p>
                  {comment.message && (
                    <p className="mt-1 text-sm break-words whitespace-pre-wrap text-ink">
                      <Linkified text={comment.message} />
                    </p>
                  )}
                  <Attachments files={comment.files} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <form onSubmit={submit} className="mt-5 space-y-2">
        <label htmlFor="task-comment" className="sr-only">
          Add a comment
        </label>
        <textarea
          id="task-comment"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e);
          }}
          placeholder="Add a comment… Paste a link, or attach images and files."
          className="input"
        />
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Files to send">
            {files.map((f, index) => (
              <PendingFile key={`${f.name}-${f.size}-${f.lastModified}`} file={f} onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))} />
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <input ref={fileRef} id="task-comment-files" type="file" multiple accept={ATTACHABLE.join(',')} onChange={pick} className="sr-only" tabIndex={-1} aria-hidden="true" />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={files.length >= MAX_FILES}>
            <Paperclip size={14} aria-hidden="true" />
            Attach files
          </button>
          <span className="hidden text-xs text-muted sm:inline">Ctrl + Enter to send</span>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? <Spinner size={14} /> : <Send size={14} aria-hidden="true" />}
            Post comment
          </button>
        </div>
      </form>
    </div>
  );
}

function SubTasks({ task, subtasks, canEdit, employees, onChanged }) {
  const [formOpen, setFormOpen] = useState(false);
  const { run } = useAction();
  const base = `/tasks/${task._id}/subtasks`;

  const fields = [
    { name: 'title', label: 'Title', required: true, span: 2 },
    { name: 'assignedTo', label: 'Assign to', type: 'select', options: toOptions(employees, employeeOption) },
    { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES },
    { name: 'dueDate', label: 'Due date', type: 'date' },
  ];

  const setStatus = async (subtask, status) => {
    const body = { title: subtask.title, assignedTo: subtask.assignedTo?._id, priority: subtask.priority, dueDate: subtask.dueDate, status };
    if (await run(() => api.put(`${base}/${subtask._id}`, body))) onChanged();
  };

  return (
    <div>
      {subtasks.length === 0 && <p className="py-4 text-center text-sm text-muted">No sub tasks yet.</p>}
      <ul className="divide-y divide-line">
        {subtasks.map((subtask) => (
          <li key={subtask._id} className="flex flex-wrap items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className={cx('truncate text-sm font-semibold', subtask.status === 'Done' ? 'text-muted line-through' : 'text-ink')}>{subtask.title}</p>
              <p className="truncate text-xs text-muted">{subtask.assignedTo?.name ?? 'Not assigned'}</p>
            </div>
            {canEdit ? (
              <label>
                <span className="sr-only">Status of {subtask.title}</span>
                <select value={subtask.status} onChange={(e) => setStatus(subtask, e.target.value)} className="input select w-36 py-1.5 text-xs">
                  {TASK_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            ) : (
              <StatusBadge value={subtask.status} />
            )}
            {canEdit && (
              <button type="button" className="icon-btn h-8 w-8 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${subtask.title}`} onClick={async () => (await run(() => api.del(`${base}/${subtask._id}`))) && onChanged()}>
                <Trash2 size={15} aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setFormOpen(true)}>
          <Plus size={14} aria-hidden="true" />
          Add sub task
        </button>
      )}
      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add sub task"
        fields={fields}
        initialValues={{ priority: 'Medium' }}
        onSubmit={async (values) => {
          await api.post(base, values);
          setFormOpen(false);
          onChanged();
        }}
        submitLabel="Add sub task"
      />
    </div>
  );
}

/** Full task view: details, status, sub tasks, comments, files and activity. */
export default function TaskDetail() {
  const { id } = useParams();
  const { role, can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';
  const canManage = isAdmin ? can('projects', 'manage') : true;
  const { data, loading, error, reload } = useApi(`/tasks/${id}`);
  const thread = useApi(`/tasks/${id}/comments`);
  const reloadThread = thread.reload;
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reloadThread();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [reloadThread]);
  const { employees = [] } = useLookups(isAdmin ? 'employees' : null);
  const [tab, setTab] = useState('comments');
  const [editOpen, setEditOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { busy, run } = useAction();

  if (loading && !data) return <PageLoader />;
  if (error) {
    return (
      <div className="card">
        <EmptyState title="Task unavailable" description={error.message} action={<Link to={isAdmin ? '/admin/task-board' : taskPath(role)} className="btn btn-secondary">Back to tasks</Link>} />
      </div>
    );
  }

  const { item: task, subtasks, logs } = data;
  const comments = thread.data?.items ?? data.comments;
  const backTo = isAdmin ? '/admin/task-board' : taskPath(role);
  const overdue = isOverdue(task);

  const changeStatus = async (status) => {
    if (await run(() => api.put(`/tasks/${id}/status`, { status }), { success: `Moved to ${status}` })) reload();
  };

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    if (await run(() => api.post(`/tasks/${id}/documents`, form), { success: 'File attached' })) reload();
  };

  const remove = async () => {
    if (await run(() => api.del(`/tasks/${id}`), { success: 'Task deleted' })) navigate(backTo);
  };

  return (
    <div>
      <Link to={backTo} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to tasks
      </Link>

      <section className="card mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">{task.taskId}</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">{task.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge value={task.status} />
              <StatusBadge kind="priority" value={task.priority} />
              {task.paused && <StatusBadge value="Paused" tone="orange" />}
              {overdue && <StatusBadge value="Overdue" />}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canManage && (isAdmin || employeeCanMove(task)) && (
              <label>
                <span className="sr-only">Task status</span>
                <select value={task.status} onChange={(e) => changeStatus(e.target.value)} disabled={busy} className="input select h-[42px] w-40 py-2">
                  {(isAdmin ? TASK_STATUSES : EMPLOYEE_TASK_STATUSES).map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            )}
            {isAdmin && canManage && task.status === 'In Review' && (
              <>
                <button type="button" className="btn bg-green-600 text-white shadow-sm hover:bg-green-700" disabled={busy} onClick={() => changeStatus('Done')}>
                  <Check size={16} aria-hidden="true" />
                  Mark Done
                </button>
                <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => changeStatus('To Do')}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Back to To Do
                </button>
              </>
            )}
            {!isAdmin && task.status === 'In Review' && (
              <p className="flex min-h-[42px] items-center gap-2 rounded-xl bg-amber-50 px-3.5 text-sm font-semibold text-amber-700">
                <Hourglass size={16} aria-hidden="true" />
                Waiting for admin review
              </p>
            )}
            {canManage && task.status === 'In Progress' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  if (!task.paused) setPauseOpen(true);
                  else if (await run(() => api.put(`/tasks/${id}/pause`, { paused: false }), { success: 'Task resumed' })) reload();
                }}
              >
                {task.paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                {task.paused ? 'Resume' : 'Pause'}
              </button>
            )}
            {isAdmin && canManage && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setEditOpen(true)}>
                  <Pencil size={16} aria-hidden="true" />
                  Edit
                </button>
                <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" aria-label="Delete task" onClick={() => setDeleteOpen(true)}>
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
        {task.paused && task.pauseComment && <p className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-sm text-orange-800">Paused: {task.pauseComment}</p>}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <SectionCard title="Description">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{task.description || 'No description added.'}</p>
          </SectionCard>

          {isAdmin && (
            <SectionCard title="Sub tasks" description={`${subtasks.filter((s) => s.status === 'Done').length} of ${subtasks.length} done`}>
              <SubTasks task={task} subtasks={subtasks} canEdit={canManage} employees={employees} onChanged={reload} />
            </SectionCard>
          )}

          <SectionCard
            title={tab === 'comments' ? 'Comments' : 'Activity'}
            action={<Tabs label="Task activity" active={tab} onChange={setTab} tabs={[{ id: 'comments', label: `Comments (${comments.length})` }, { id: 'activity', label: 'Activity' }]} />}
          >
            {tab === 'comments' ? (
              <Comments taskId={id} comments={comments} onAdded={reloadThread} />
            ) : (
              <ul className="space-y-3">
                {logs.map((entry) => (
                  <li key={entry._id} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-ink">{entry.action}</span>
                      {entry.detail && <span className="text-muted"> · {entry.detail}</span>}
                      <span className="block text-xs text-muted">
                        {entry.actor?.name} · {timeAgo(minutesSince(entry.createdAt))}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Tester status">
            {isAdmin && canManage ? (
              <label>
                <span className="sr-only">Tester status</span>
                <select
                  value={task.testerStatus}
                  onChange={async (e) => {
                    const testerStatus = e.target.value;
                    if (await run(() => api.put(`/tasks/${id}/tester`, { testerStatus }), { success: 'Tester status updated' })) reload();
                  }}
                  className="input select"
                >
                  {TESTER_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            ) : (
              <StatusBadge value={task.testerStatus} />
            )}
          </SectionCard>

          <SectionCard title="Details">
            <dl className="divide-y divide-line">
              <Meta label="Project">{task.project?.name ?? '—'}</Meta>
              <Meta label="Client">{taskClient(task)}</Meta>
              <Meta label="Category">{task.category || '—'}</Meta>
              <Meta label="Assigned to">{assigneeNames(task)}</Meta>
              <Meta label="Start date">{formatDate(task.startDate)}</Meta>
              <Meta label="Due date">
                <span className={overdue ? 'text-red-600' : undefined}>{task.dueDate ? `${formatDate(task.dueDate)}` : '—'}</span>
              </Meta>
              {task.startTime && <Meta label="Time">{task.endTime ? `${formatTime(task.startTime)} – ${formatTime(task.endTime)}` : formatTime(task.startTime)}</Meta>}
              {task.dueDate && task.status !== 'Done' && <Meta label="Deadline">{relativeDueLabel(task.dueDate)}</Meta>}
              <Meta label="Time worked">
                <WorkedTime task={task} />
              </Meta>
              <Meta label="Created by">{task.createdBy?.name ?? '—'}</Meta>
            </dl>
          </SectionCard>

          <SectionCard
            title="Files"
            action={
              canManage && (
                <label className="btn btn-secondary btn-sm cursor-pointer">
                  <Paperclip size={14} aria-hidden="true" />
                  Attach
                  <input type="file" className="sr-only" onChange={uploadFile} />
                </label>
              )
            }
          >
            {task.documents.length === 0 ? (
              <p className="text-sm text-muted">No files attached.</p>
            ) : (
              <ul className="space-y-1.5">
                {task.documents.map((file) => (
                  <li key={file._id} className="flex items-center justify-between gap-2">
                    <a href={fileUrl(file.url)} target="_blank" rel="noreferrer" className="min-w-0 truncate text-sm font-semibold text-brand-700 hover:underline">
                      {file.name}
                    </a>
                    {canManage && (
                      <button
                        type="button"
                        className="icon-btn h-8 w-8 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${file.name}`}
                        onClick={async () => {
                          if (await run(() => api.del(`/tasks/${id}/documents/${file._id}`), { success: 'File removed' })) reload();
                        }}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      <TaskFormModal open={editOpen} onClose={() => setEditOpen(false)} task={task} canAssign={isAdmin} onSaved={reload} />
      <FormModal
        open={pauseOpen}
        onClose={() => setPauseOpen(false)}
        title="Pause this task"
        size="sm"
        fields={[{ name: 'comment', label: 'Reason', type: 'textarea', required: true }]}
        initialValues={{}}
        submitLabel="Pause task"
        onSubmit={async ({ comment }) => {
          await api.put(`/tasks/${id}/pause`, { paused: true, comment });
          toast.info('Task paused');
          setPauseOpen(false);
          reload();
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete this task?"
        message="Its sub tasks, comments and activity will be deleted too. This can’t be undone."
        confirmLabel="Delete"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
