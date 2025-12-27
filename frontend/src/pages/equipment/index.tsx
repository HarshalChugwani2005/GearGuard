import Head from 'next/head';
import { useEquipment, EquipmentWithHealth } from '@/hooks/use-equipment';
import EquipmentListCard from '@/components/equipment/equipment-list'; // Ensure file name matches
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function EquipmentPage() {
    // @ts-ignore - Hook returns array or single depending on call, here it's array
    const { data: equipmentList, isLoading } = useEquipment();
    const [search, setSearch] = useState("");

    const filteredList = Array.isArray(equipmentList)
        ? equipmentList.filter(eq =>
            eq.name.toLowerCase().includes(search.toLowerCase()) ||
            eq.serial_number.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    return (
        <>
            <Head>
                <title>Equipment Inventory | GearGuard</title>
            </Head>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Equipment Inventory</h1>
                        <p className="text-slate-500">Monitor asset health and status.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search assets..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-slate-500">Loading assets...</p>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredList.map((eq) => (
                            <EquipmentListCard key={eq.id} equipment={eq} />
                        ))}
                        {filteredList.length === 0 && (
                            <p className="col-span-full text-center py-10 text-slate-500">No equipment found.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
