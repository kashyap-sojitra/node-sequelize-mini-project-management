'use client';

import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import type { Task } from '@/types';
import { HiOutlineClipboardList } from 'react-icons/hi';

interface KanbanColumnProps {
  columnId: string;
  title: string;
  color: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  showProject?: boolean;
}

export default function KanbanColumn({
  columnId,
  title,
  color,
  tasks,
  onEdit,
  onDelete,
  showProject = false,
}: KanbanColumnProps) {
  return (
    <div className="kanban-column bg-surface-50 rounded-2xl p-4 min-h-[300px] flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <h3 className="text-sm font-semibold text-surface-700">{title}</h3>
          <span className="text-xs text-surface-400 bg-surface-200 px-2 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 rounded-xl transition-colors duration-200 min-h-[100px] ${
              snapshot.isDraggingOver
                ? 'bg-primary-50/50 ring-2 ring-primary-200 ring-dashed p-2 -m-2'
                : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver ? (
              <div className="text-center py-8">
                <HiOutlineClipboardList className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                <p className="text-xs text-surface-400">No tasks</p>
                <p className="text-[11px] text-surface-300 mt-1">Drop tasks here</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showProject={showProject}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
