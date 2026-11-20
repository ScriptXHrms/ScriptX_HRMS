import { Notification } from '../models/index.js';

/** Notifications never block the action that raised them. */
async function save(docs) {
  try {
    await Notification.insertMany(docs);
  } catch (error) {
    console.error('Could not save notification:', error.message);
  }
}

export const notifyAdmins = (notification) => save([{ ...notification, audience: 'admin' }]);

export const notifyEmployees = (employeeIds, notification) =>
  save(employeeIds.filter(Boolean).map((employee) => ({ ...notification, audience: 'employee', employee })));
