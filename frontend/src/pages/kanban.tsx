import Head from 'next/head';
import KanbanBoard from '@/components/kanban/kanban-board';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import CreateRequestForm from '@/components/requests/create-request-form';

export default function KanbanPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        // Force refresh by incrementing key
        setRefreshKey(prev => prev + 1);
        // Also clear all caches
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    return (
        <>
            <Head>
                <title>Maintenance Kanban | GearGuard</title>
            </Head>

            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maintenance Board</h1>
                        <p className="text-slate-500">Manage and track repair requests across teams.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            title="Refresh data across all machines"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button
                            className="shadow-lg shadow-primary-500/20"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Request
                        </Button>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <KanbanBoard key={refreshKey} />
                </div>

                <Modal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    title="Create Maintenance Request"
                >
                    <CreateRequestForm
                        onSuccess={() => setIsCreateOpen(false)}
                        onCancel={() => setIsCreateOpen(false)}
                    />
                </Modal>
            </div>
        </>
    );
}
