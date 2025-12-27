import Head from 'next/head';
import KanbanBoard from '@/components/kanban/kanban-board';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import CreateRequestForm from '@/components/requests/create-request-form';

export default function KanbanPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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
                    <Button
                        className="shadow-lg shadow-primary-500/20"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Request
                    </Button>
                </div>

                <div className="flex-1 min-h-0">
                    <KanbanBoard />
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
