import { MaintenanceRequest } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Draggable } from "@hello-pangea/dnd";
import { Clock, AlertTriangle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RequestCardProps {
    request: MaintenanceRequest;
    index: number;
    onClick: (request: MaintenanceRequest) => void;
}

const RequestCard = ({ request, index, onClick }: RequestCardProps) => {
    // Logic for Overdue: If scheduled date is past and not repaired
    const isOverdue = request.scheduled_date &&
        new Date(request.scheduled_date) < new Date() &&
        request.status !== 'Repaired' &&
        request.status !== 'Scrap';

    const priorityColor = {
        1: 'bg-green-500',
        2: 'bg-blue-500',
        3: 'bg-yellow-500',
        4: 'bg-orange-500',
        5: 'bg-red-500'
    }[request.priority] || 'bg-slate-500';

    return (
        <Draggable draggableId={request.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3"
                    onClick={() => onClick(request)}
                >
                    <Card
                        className={cn(
                            "cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative overflow-hidden",
                            snapshot.isDragging && "shadow-xl rotate-1",
                            isOverdue && "border-l-4 border-l-red-500"
                        )}
                    >
                        <CardHeader className="p-3 pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <Badge
                                    variant={request.request_type === 'Corrective' ? 'destructive' : 'secondary'}
                                    className="rounded-md"
                                >
                                    {request.request_type}
                                </Badge>
                                <div className={cn("h-2 w-2 rounded-full", priorityColor)} title={`Priority: ${request.priority}`} />
                            </div>
                            <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
                                {request.subject}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                            <p className="text-xs text-slate-500 font-medium mb-3">
                                {request.equipment?.name || `Equipment #${request.equipment_id}`}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <User className="w-3 h-3" />
                                    <span>Unassigned</span>
                                </div>

                                {isOverdue && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Overdue</span>
                                    </div>
                                )}

                                {/* Show scheduled date for preventive */}
                                {!isOverdue && request.scheduled_date && (
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{format(new Date(request.scheduled_date), 'MMM d')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );
};

export default RequestCard;
