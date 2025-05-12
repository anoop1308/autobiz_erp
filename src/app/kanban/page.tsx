import { KanbanBoard } from '@/components/kanban/kanban-board';

export default function KanbanPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>
      <KanbanBoard />
    </div>
  );
}