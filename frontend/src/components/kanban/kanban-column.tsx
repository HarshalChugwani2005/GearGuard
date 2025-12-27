import { MaintenanceRequest } from "@/types";
import { Droppable } from "@hello-pangea/dnd";
import RequestCard from "./request-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    id: string; // Status ID (New, In Progress, etc.)
    title: string;
    count: number;
    requests: MaintenanceRequest[];
    onCardClick: (request: MaintenanceRequest) => void;
}

const KanbanColumn = ({ id, title, count, requests, onCardClick }: KanbanColumnProps) => {
    // Status color mapping for header
    const statusColors: Record<string, string> = {
        'New': 'bg-blue-500',
        'In Progress': 'bg-yellow-500',
        'Repaired': 'bg-green-500',
        'Scrap': 'bg-red-500'
    };

    return (
        <div className="flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200 min-w-[280px] w-full max-w-sm">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", statusColors[id] || 'bg-slate-500')} />
                    {title}
                </h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md border border-slate-200">
                    {count}
                </span>
            </div>

            {/* Droppable Area */}
            <div className="flex-1 p-3 overflow-y-auto min-h-[150px]">
                <Droppable droppableId={id}>
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={cn(
                                "h-full transition-colors rounded-lg",
                                snapshot.isDraggingOver ? "bg-slate-100 shadow-inner" : ""
                            )}
                        >
                            {requests.map((request, index) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    index={index}
                                    onClick={onCardClick}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </div>
    );
};

export default KanbanColumn;
