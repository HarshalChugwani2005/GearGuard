import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEquipment, EquipmentWithHealth } from '@/hooks/use-equipment';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import HealthScoreGauge from '@/components/equipment/health-score-gauge';
import { ArrowLeft, Calendar, User, Wrench } from 'lucide-react';

export default function EquipmentDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    // @ts-ignore
    const { data: equipment, isLoading } = useEquipment(id ? Number(id) : undefined);
    const eq = equipment as EquipmentWithHealth | undefined;

    if (isLoading || !eq) return <div className="p-8">Loading profile...</div>;

    return (
        <>
            <Head>
                <title>{eq.name} | GearGuard</title>
            </Head>

            <div className="max-w-5xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 hover:bg-transparent hover:text-primary-600">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
                </Button>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Main Info Card */}
                    <Card className="flex-1">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-slate-900">{eq.name}</h1>
                                    {!eq.is_functional && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">SCRAPPED</span>}
                                </div>
                                <p className="text-slate-500 text-sm">Serial: {eq.serial_number}</p>
                            </div>

                            {/* SMART BUTTON */}
                            <Button
                                className="shadow-lg shadow-primary-500/20"
                                onClick={() => router.push(`/kanban?equipment=${eq.id}`)}
                            >
                                <Wrench className="mr-2 h-4 w-4" />
                                Maintenance Requests
                                <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">
                                    {eq.open_requests_count || 0}
                                </span>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-6">
                                <div>
                                    <span className="text-slate-400 text-xs uppercase font-bold">Category</span>
                                    <p className="text-lg font-medium">{eq.category}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase font-bold">Department</span>
                                    <p className="text-lg font-medium">{eq.department}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase font-bold">Assigned Team (ID)</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <p className="font-medium">Team #{eq.team_id}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs uppercase font-bold">Next Maintenance</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <p className="font-medium text-primary-700">{eq.next_maintenance}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Technical Specifications</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Specification data not available in prototype. In production, this section would contain technical manuals, voltage ratings, and installation dates.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health Score Sidebar */}
                    <div className="w-full md:w-80 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Predictive Health</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <HealthScoreGauge score={eq.health_score} size={220} />

                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">MTTR (Avg)</span>
                                        <span className="font-mono font-medium">{eq.mttr} hrs</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Breakdowns (30d)</span>
                                        <span className="font-mono font-medium">3</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
