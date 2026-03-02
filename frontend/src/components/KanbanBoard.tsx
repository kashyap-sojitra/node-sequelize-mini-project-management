'use client';

import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import type { Task } from '@/types';

const STATUS_COLUMNS = [
  { key: 'TODO', label: 'To Do', color: 'bg-surface-400' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-500' },
  { key: 'DONE', label: 'Done', color: 'bg-emerald-500' },
] as const;

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: number, newStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  showProject?: boolean;
}

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  showProject = false,
}: KanbanBoardProps) {
  const tasksByStatus = STATUS_COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.key),
  }));

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Status changed — fire the callback
    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    if (source.droppableId !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board grid grid-cols-1 md:grid-cols-3 gap-5">
        {tasksByStatus.map((column) => (
          <KanbanColumn
            key={column.key}
            columnId={column.key}
            title={column.label}
            color={column.color}
            tasks={column.tasks}
            onEdit={onEdit}
            onDelete={onDelete}
            showProject={showProject}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
