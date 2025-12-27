import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Users, ClipboardList } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Task {
    id: string;
    maintenance_request_id: string;
    equipment_name: string;
    department: string;
    due_date: string;
    status: string;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [department, setDepartment] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            window.location.href = '/';
        }
    }, [user]);

    useEffect(() => {
        fetchMaintenanceRequests();
    }, []);

    const fetchMaintenanceRequests = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/maintenance-requests`);
            setMaintenanceRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch maintenance requests:', error);
        }
    };

    const assignTask = async () => {
        try {
            const token = localStorage.getItem('gearguard_token');
            await axios.post(
                `${API_URL}/api/auth/admin/assign-task`,
                {
                    maintenance_request_id: selectedRequest,
                    assigned_to_user_id: selectedUser,
                    department,
                    due_date: dueDate,
                    notes,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('Task assigned successfully!');
            setShowAssignModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to assign task:', error);
            alert('Failed to assign task');
        }
    };

    const resetForm = () => {
        setSelectedRequest('');
        setSelectedUser('');
        setDepartment('');
        setDueDate('');
        setNotes('');
    };

    return (
        <>
            <Head>
                <title>Admin Dashboard | GearGuard</title>
            </Head>

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
                        <p className="text-slate-500">Manage users, assign tasks, and oversee operations.</p>
                    </div>
                    <Button onClick={() => setShowAssignModal(true)}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Assign Task
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Users</p>
                                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <ClipboardList className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Active Tasks</p>
                                <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <UserPlus className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Pending Requests</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {maintenanceRequests.filter(r => r.status === 'open').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maintenance Requests Table */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Maintenance Requests</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Equipment</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Priority</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenanceRequests.slice(0, 10).map((request) => (
                                    <tr key={request.id} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm">{request.id}</td>
                                        <td className="py-3 px-4 text-sm">{request.equipment_name || 'N/A'}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                request.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm capitalize">{request.status}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedRequest(request.id);
                                                    setShowAssignModal(true);
                                                }}
                                            >
                                                Assign
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Assign Task Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h2 className="text-xl font-bold mb-4">Assign Task</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Maintenance Request</label>
                                    <select
                                        value={selectedRequest}
                                        onChange={(e) => setSelectedRequest(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="">Select Request</option>
                                        {maintenanceRequests.map((req) => (
                                            <option key={req.id} value={req.id}>
                                                {req.id} - {req.equipment_name || 'Unknown'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Assign To User ID</label>
                                    <Input
                                        type="text"
                                        placeholder="Enter user ID"
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Department</label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., Mechanical"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Due Date</label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                                    <textarea
                                        className="w-full border rounded px-3 py-2"
                                        rows={3}
                                        placeholder="Additional instructions..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={assignTask} className="flex-1">Assign</Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAssignModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
