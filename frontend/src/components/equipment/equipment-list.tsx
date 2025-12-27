import { EquipmentWithHealth } from "@/hooks/use-equipment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HealthScoreGauge from "./health-score-gauge";
import { Wrench } from "lucide-react";
import { useRouter } from "next/router";

interface EquipmentListCardProps {
    equipment: EquipmentWithHealth;
}

const EquipmentListCard = ({ equipment }: EquipmentListCardProps) => {
    const router = useRouter();

    return (
        <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex flex-col md:flex-row items-center gap-6">
                {/* Gauge Section */}
                <div className="flex-shrink-0">
                    <HealthScoreGauge score={equipment.health_score} size={140} showDetails={true} />
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">{equipment.name}</h3>
                    <p className="text-sm text-slate-500">SN: <span className="font-mono">{equipment.serial_number}</span></p>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-3">
                        <div>
                            <span className="text-xs text-slate-400 uppercase">Category</span>
                            <p className="text-sm font-medium">{equipment.category}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 uppercase">Department</span>
                            <p className="text-sm font-medium">{equipment.department}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button
                        // className="w-full"
                        onClick={() => router.push(`/equipment/${equipment.id}`)}
                        variant="outline"
                    >
                        View Profile
                    </Button>
                    {equipment.open_requests_count !== undefined && equipment.open_requests_count > 0 && (
                        <Button
                            variant="ghost"
                            className="justify-start text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                            onClick={() => router.push(`/kanban?equipment=${equipment.id}`)}
                        >
                            <Wrench className="w-4 h-4 mr-2" />
                            {equipment.open_requests_count} Active Req.
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EquipmentListCard;
