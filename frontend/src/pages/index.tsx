import Head from 'next/head';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, Calendar, Wrench, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useMyTasks } from '@/hooks/use-my-tasks';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, isLoading } = useMyTasks();

  return (
    <>
      <Head>
        <title>Dashboard | GearGuard</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.full_name || 'User'}
          </h1>
          <p className="text-slate-500 mt-2">Here's what's happening in your facility today.</p>
        </div>

        {/* Quick Stats Row - Placeholder for real metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : tasks.length}</div>
              <p className="text-xs text-slate-500">Assigned to you</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Equipment</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-slate-500">98% Operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-slate-500">For today</p>
            </CardContent>
          </Card>
        </div>

        {/* My Tasks Section */}
        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tasks</CardTitle>
              <CardDescription>Tasks assigned to you by admin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{task.equipment_name || `Request #${task.maintenance_request_id}`}</p>
                      <p className="text-xs text-slate-500">Department: {task.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/kanban" className="block group">
            <Card className="h-full border-l-4 border-l-blue-500 transition-transform group-hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Maintenance Board <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>Drag & drop repair requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-blue-50 rounded-md flex items-center justify-center border border-blue-100">
                  <Wrench className="w-8 h-8 text-blue-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calendar" className="block group">
            <Card className="h-full border-l-4 border-l-green-500 transition-transform group-hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Schedule <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>View preventive maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-green-50 rounded-md flex items-center justify-center border border-green-100">
                  <Calendar className="w-8 h-8 text-green-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/equipment" className="block group">
            <Card className="h-full border-l-4 border-l-orange-500 transition-transform group-hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Equipment Inventory <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>Monitor asset health scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-orange-50 rounded-md flex items-center justify-center border border-orange-100">
                  <Activity className="w-8 h-8 text-orange-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
