import { forbidden } from '../utils/http.js';

export { employeePortal, requireModule } from './auth.js';

/** Inline module check, for routes whose module depends on the record or query. */
export function forbiddenUnless(req, key, level = 'view') {
  if (req.auth.portal !== 'admin') throw forbidden('Admin access is required.');
  const granted = req.auth.modules[key];
  if (!granted || (level === 'manage' && granted !== 'manage')) throw forbidden();
}
