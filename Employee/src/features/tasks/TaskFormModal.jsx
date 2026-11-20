import { useMemo } from 'react';
import FormModal from '../../components/FormModal';
import { api } from '../../api/client';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../../data/constants';
import { useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { employeeOption, idOf, toOptions } from '../../utils/format';

/** Create or edit a task. Employees create tasks for themselves, so they get no assignee picker. */
export default function TaskFormModal({ open, onClose, task, canAssign, onSaved, defaults }) {
  const toast = useToast();
  const { projects = [], employees = [] } = useLookups(open ? ['projects', canAssign && 'employees'] : null);

  const fields = useMemo(
    () => [
      { name: 'title', label: 'Title', required: true, span: 2 },
      { name: 'project', label: 'Project', type: 'select', required: true, options: toOptions(projects) },
      { name: 'category', label: 'Category', type: 'select', options: TASK_CATEGORIES },
      { name: 'priority', label: 'Priority', type: 'select', required: true, options: TASK_PRIORITIES },
      { name: 'startDate', label: 'Start date', type: 'date' },
      {
        name: 'dueDate',
        label: 'Due date',
        type: 'date',
        validate: (value, values) => (values.startDate && value < values.startDate ? 'Due date can’t be before the start date.' : null),
      },
      { name: 'startTime', label: 'Start time', type: 'time', hint: 'Optional. Places the task on the calendar’s hourly view.' },
      {
        name: 'endTime',
        label: 'End time',
        type: 'time',
        validate: (value, values) => (!values.startTime ? 'Add a start time too.' : value <= values.startTime ? 'End time must be after the start time.' : null),
      },
      ...(canAssign ? [{ name: 'assignedTo', label: 'Assign to', type: 'multiselect', options: toOptions(employees, employeeOption) }] : []),
      { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
    ],
    [projects, employees, canAssign],
  );

  const initialValues = task
    ? { ...task, project: idOf(task.project), assignedTo: (task.assignedTo ?? []).map(idOf) }
    : { priority: 'Medium', assignedTo: [], ...defaults };

  const submit = async (values) => {
    const { item } = task ? await api.put(`/tasks/${task._id}`, values) : await api.post('/tasks', values);
    toast.success(task ? 'Task updated' : 'Task created', item.taskId);
    onClose();
    onSaved?.(item);
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={task ? 'Edit task' : 'Add task'}
      fields={fields}
      initialValues={initialValues}
      onSubmit={submit}
      submitLabel={task ? 'Save changes' : 'Create task'}
    />
  );
}
