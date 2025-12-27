import Head from 'next/head';
import MaintenanceCalendar from '@/components/calendar/maintenance-calendar';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

export default function CalendarPage() {
    return (
        <>
            <Head>
                <title>Schedule | GearGuard</title>
            </Head>

            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maintenance Schedule</h1>
                        <p className="text-slate-500">Plan and view upcoming preventive maintenance.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter Team
                        </Button>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule Maintenance
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    <MaintenanceCalendar />
                </div>
            </div>
        </>
    );
}
