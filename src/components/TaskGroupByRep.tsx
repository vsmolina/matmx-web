'use client'

import TaskTable from './TaskTable'

export default function TaskGroupByRep({
  rep,
  currentUserId,
  isSuperAdmin,
  onCreateTask,
  onTaskUpdate
}: {
  rep: {
    rep_id: number;
    rep_name: string;
    customers: {
      customer_id: number;
      customer_name: string;
      tasks: any[];
    }[];
  };
  currentUserId: number;
  isSuperAdmin: boolean;
  onCreateTask: (customerId: number) => void;
  onTaskUpdate?: () => void;
}) {
  // Reps only see their own section unless super admin
  if (!isSuperAdmin && rep.rep_id !== currentUserId) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {rep.rep_name}'s Tasks
      </h2>

      {rep.customers.map((cust) => (
        <TaskTable
          key={cust.customer_id}
          customer={{ id: cust.customer_id, name: cust.customer_name }}
          tasks={cust.tasks}
          currentUserId={currentUserId}
          canCreate={isSuperAdmin || rep.rep_id === currentUserId}
          onCreate={onCreateTask}
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  )
}
