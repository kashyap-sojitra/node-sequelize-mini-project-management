'use client';

import { Draggable } from '@hello-pangea/dnd';
import { PriorityBadge } from '@/components/Badges';
import type { Task } from '@/types';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCalendar,
} from 'react-icons/hi';
import Link from 'next/link';

interface KanbanCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  showProject?: boolean;
}

export default function KanbanCard({ task, index, onEdit, onDelete, showProject = false }: KanbanCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card bg-white rounded-xl p-4 border transition-all duration-200 group ${
            snapshot.isDragging
              ? 'border-primary-300 shadow-xl shadow-primary-600/10 rotate-[2deg] scale-[1.02]'
              : 'border-surface-100 hover:shadow-md hover:border-surface-200'
          }`}
        >
          {/* Header: Title + Actions */}
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-surface-900 flex-1 pr-2 leading-snug">
              {task.title}
            </h4>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer"
              >
                <HiOutlinePencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="p-1 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <HiOutlineTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-surface-400 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {/* Project link (for global tasks page) */}
          {showProject && task.project && (
            <Link
              href={`/projects/${task.project_id}`}
              className="inline-flex items-center text-[11px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md mb-3 hover:bg-primary-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {task.project.name}
            </Link>
          )}

          {/* Footer: Priority, Due Date, Assignee */}
          <div className="flex items-center justify-between">
            <PriorityBadge priority={task.priority} />
            <div className="flex items-center gap-2">
              {task.due_date && (
                <span className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-red-500 font-medium' : 'text-surface-400'
                }`}>
                  <HiOutlineCalendar className="w-3 h-3" />
                  {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {task.assignee && (
                <div
                  className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center"
                  title={task.assignee.name}
                >
                  <span className="text-[10px] font-bold">
                    {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
