import LeaveQueue from '../../features/leave/LeaveQueue';

export default function AdminLeaveRequests() {
  return <LeaveQueue category="Leave" module="leave" title="Leaves" description="Approve or reject leave and permission requests." subCategoryFilter />;
}
