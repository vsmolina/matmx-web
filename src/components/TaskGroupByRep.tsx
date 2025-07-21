'use client'

import TaskTable from './TaskTable'
import { User } from 'lucide-react'

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
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-3 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {rep.rep_name}'s Tasks
          </h2>
        </div>
      </div>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
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
    </div>
  )
}
