import Head from 'next/head';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Wrench } from 'lucide-react';

const MOCK_TEAMS = [
    { id: 1, name: "Mechanical Maintenance", members: 4, open_requests: 3, leader: "John Doe" },
    { id: 2, name: "Electrical Systems", members: 3, open_requests: 1, leader: "Jane Smith" },
    { id: 3, name: "Facility Services", members: 5, open_requests: 0, leader: "Mike Johnson" },
];

export default function TeamsPage() {
    return (
        <>
            <Head>
                <title>Maintenance Teams | GearGuard</title>
            </Head>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maintenance Teams</h1>
                        <p className="text-slate-500">Manage your workforce groups and assignments.</p>
                    </div>
                    <Button className="shadow-lg shadow-primary-500/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Team
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_TEAMS.map((team) => (
                        <Card key={team.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    {team.open_requests > 0 && (
                                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                                            {team.open_requests} Active
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="mt-4">{team.name}</CardTitle>
                                <CardDescription>Lead: {team.leader}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm text-slate-500">
                                    <span>{team.members} Technicians</span>
                                    <span className="flex items-center gap-1">
                                        <Wrench className="w-3 h-3" /> {team.open_requests} Jobs
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="outline" className="w-full">Manage Team</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
