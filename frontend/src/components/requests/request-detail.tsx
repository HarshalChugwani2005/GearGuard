import { MaintenanceRequest } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface RequestDetailProps {
    request: MaintenanceRequest;
}

const RequestDetail = ({ request }: RequestDetailProps) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Badge variant={request.status === 'New' ? 'default' : 'secondary'}>
                    {request.status}
                </Badge>
                {request.priority >= 4 && (
                    <Badge variant="destructive" className="items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Critical Priority
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Equipment</h4>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{request.equipment?.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{request.equipment?.serial_number}</p>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Technician</h4>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">John Technician</span>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Scheduled</h4>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                            {request.scheduled_date
                                ? format(new Date(request.scheduled_date), "PPP p")
                                : "Not scheduled"
                            }
                        </span>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Duration</h4>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                            {request.duration_hours ? `${request.duration_hours} hours` : "--"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                    {request.description || "No description provided."}
                </p>
            </div>
        </div>
    );
};

export default RequestDetail;
