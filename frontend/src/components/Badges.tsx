'use client';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    TODO: 'bg-surface-100 text-surface-600',
    IN_PROGRESS: 'bg-amber-50 text-amber-700',
    DONE: 'bg-emerald-50 text-emerald-700',
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    ARCHIVED: 'bg-surface-100 text-surface-500',
    COMPLETED: 'bg-blue-50 text-blue-700',
  };

  const labels: Record<string, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
    ACTIVE: 'Active',
    ARCHIVED: 'Archived',
    COMPLETED: 'Completed',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[status] || 'bg-surface-100 text-surface-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'TODO' ? 'bg-surface-400' :
        status === 'IN_PROGRESS' ? 'bg-amber-500' :
        status === 'DONE' ? 'bg-emerald-500' :
        status === 'ACTIVE' ? 'bg-emerald-500' :
        status === 'ARCHIVED' ? 'bg-surface-400' :
        status === 'COMPLETED' ? 'bg-blue-500' : 'bg-surface-400'
      }`} />
      {labels[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: 'bg-surface-100 text-surface-500',
    MEDIUM: 'bg-blue-50 text-blue-600',
    HIGH: 'bg-orange-50 text-orange-600',
    URGENT: 'bg-red-50 text-red-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[priority] || 'bg-surface-100 text-surface-500'}`}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}
