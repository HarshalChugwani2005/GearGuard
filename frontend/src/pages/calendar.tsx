import Head from 'next/head';
import { useState } from 'react';
import MaintenanceCalendar from '@/components/calendar/maintenance-calendar';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Calendar, Download } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
    const [view, setView] = useState<ViewType>('month');
    const [showReportModal, setShowReportModal] = useState(false);
    const [failureReport, setFailureReport] = useState<any[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const generateReport = async () => {
        try {
            const token = localStorage.getItem('gearguard_token');
            const params: any = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const response = await axios.get(`${API_URL}/api/auth/reports/failures`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setFailureReport(response.data);
            setShowReportModal(true);
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate report. Please log in first.');
        }
    };

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
                        <Button variant="outline" onClick={() => generateReport()}>
                            <Download className="mr-2 h-4 w-4" />
                            Equipment Failure Report
                        </Button>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule Maintenance
                        </Button>
                    </div>
                </div>

                {/* View Filter */}
                <div className="flex gap-2 items-center">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <Button
                        variant={view === 'month' ? 'default' : 'outline'}
                        onClick={() => setView('month')}
                        size="sm"
                    >
                        Month
                    </Button>
                    <Button
                        variant={view === 'week' ? 'default' : 'outline'}
                        onClick={() => setView('week')}
                        size="sm"
                    >
                        Week
                    </Button>
                    <Button
                        variant={view === 'day' ? 'default' : 'outline'}
                        onClick={() => setView('day')}
                        size="sm"
                    >
                        Day
                    </Button>

                    <div className="ml-4 flex gap-2 items-center">
                        <label className="text-sm text-slate-600">Filter Date Range:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1">
                    <MaintenanceCalendar />
                </div>

                {/* Failure Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Equipment Failure Report</h2>
                                <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                                    ✕
                                </button>
                            </div>

                            {failureReport.length === 0 ? (
                                <p className="text-slate-500">No failures recorded in the selected period.</p>
                            ) : (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="border p-2 text-left">Equipment ID</th>
                                            <th className="border p-2 text-left">Equipment Name</th>
                                            <th className="border p-2 text-right">Failure Count</th>
                                            <th className="border p-2 text-right">Total Downtime (hrs)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {failureReport.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="border p-2">{item.equipment_id}</td>
                                                <td className="border p-2">{item.equipment_name}</td>
                                                <td className="border p-2 text-right">{item.failure_count}</td>
                                                <td className="border p-2 text-right">{item.total_downtime_hours}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
