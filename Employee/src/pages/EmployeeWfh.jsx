import MyRequestsPage from '../features/leave/MyRequestsPage';

export default function EmployeeWfh() {
  return <MyRequestsPage category="WFH" title="Work From Home" description="Request to work from home. Once approved, checking in that day counts as WFH." applyLabel="Apply for WFH" />;
}
