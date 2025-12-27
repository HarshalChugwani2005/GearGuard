import { useState, useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./kanban-column";
import { useMaintenanceRequests } from "@/hooks/use-maintenance-requests";
import { MaintenanceRequest } from "@/types";
import { Modal } from "@/components/ui/modal";

const STATUS_COLUMNS = [
    { id: 'New', title: 'New Requests' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Repaired', title: 'Repaired' },
    { id: 'Scrap', title: 'Scrap' }
];

const KanbanBoard = () => {
    const { data: requests, isLoading } = useMaintenanceRequests();
    const [selectedCard, setSelectedCard] = useState<MaintenanceRequest | null>(null);

    // State for requests to support local drag-and-drop updates
    const [localRequests, setLocalRequests] = useState<MaintenanceRequest[]>([]);

    // Sync local requests with fetched data whenever it changes
    useMemo(() => {
        if (requests && requests.length > 0) {
            setLocalRequests(requests);
        }
    }, [requests])

    // Group requests by status
    const columns = useMemo(() => {
        const groups: Record<string, MaintenanceRequest[]> = {
            'New': [], 'In Progress': [], 'Repaired': [], 'Scrap': []
        };

        // Use localRequests instead of prop
        localRequests.forEach(req => {
            if (groups[req.status]) {
                groups[req.status].push(req);
            }
        });

        return groups;
    }, [localRequests]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Identify the card
        const card = localRequests.find(r => r.id.toString() === draggableId);
        if (!card) return;

        // Optimistically update status
        const newStatus = destination.droppableId as any; // Cast to status type

        // Create new array
        const newRequests = localRequests.map(req =>
            req.id === card.id ? { ...req, status: newStatus } : req
        );

        setLocalRequests(newRequests);

        // Logs for debugging
        console.log(`Moved card ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-slate-500">Loading Kanban...</div>;
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                <p className="text-lg">No maintenance requests found</p>
                <p className="text-sm">Create a new request to get started</p>
            </div>
        );
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start">
                    {STATUS_COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            count={columns[col.id].length}
                            requests={columns[col.id]}
                            onCardClick={setSelectedCard}
                        />
                    ))}
                </div>
            </DragDropContext>

            <Modal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                title={selectedCard?.subject || 'Request Details'}
            >
                {selectedCard && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-slate-500">Status</h4>
                                <p className="text-sm">{selectedCard.status}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500">Equipment</h4>
                                <p className="text-sm">{selectedCard.equipment?.name}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-500">Description</h4>
                            <p className="text-sm text-slate-700 mt-1">
                                {selectedCard.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default KanbanBoard;
