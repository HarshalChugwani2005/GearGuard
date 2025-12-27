import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Equipment } from '@/types';

// Extended equipment type for frontend visualization
export interface EquipmentWithHealth extends Equipment {
    health_score: number; // 0-100
    mttr: number; // Mean Time To Repair (hours)
    last_maintenance: string;
    next_maintenance: string;
    open_requests_count?: number; // For badge
}

const MOCK_EQUIPMENT: EquipmentWithHealth[] = [
    {
        id: 101,
        name: "CNC Machine 01",
        serial_number: "CNC-001",
        category: "Machinery",
        department: "Production",
        is_functional: true,
        team_id: 1,
        health_score: 92, // Green
        mttr: 4.5,
        last_maintenance: "2024-03-10",
        next_maintenance: "2024-06-10",
        open_requests_count: 1
    },
    {
        id: 102,
        name: "Conveyor Belt A",
        serial_number: "CV-002",
        category: "Logistics",
        department: "Warehouse",
        is_functional: true,
        team_id: 2,
        health_score: 75, // Yellow
        mttr: 6.2,
        last_maintenance: "2024-02-15",
        next_maintenance: "2024-05-15",
        open_requests_count: 2
    },
    {
        id: 103,
        name: "Office Printer",
        serial_number: "PRT-003",
        category: "IT",
        department: "Office",
        is_functional: true,
        team_id: 3,
        health_score: 98,
        mttr: 1.2,
        last_maintenance: "2024-04-01",
        next_maintenance: "2024-07-01",
        open_requests_count: 0
    },
    {
        id: 104,
        name: "Hydraulic Press X",
        serial_number: "HP-004",
        category: "Machinery",
        department: "Production",
        is_functional: false, // Scrapped?
        team_id: 1,
        health_score: 45, // Red
        mttr: 12.5,
        last_maintenance: "2024-01-05",
        next_maintenance: "2024-04-05",
        open_requests_count: 5 // Critical pile up
    }
];

export const useEquipment = (id?: number) => {
    return useQuery({
        queryKey: ['equipment', id],
        queryFn: async () => {
            try {
                const url = id
                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/equipment/${id}`
                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/equipment`;

                const { data } = await axios.get(url);
                return data as EquipmentWithHealth[] | EquipmentWithHealth;
            } catch (error) {
                console.warn("Backend unreached, using mock equipment data");
                // Return all or filter by ID
                if (id) {
                    return MOCK_EQUIPMENT.find(e => e.id === Number(id));
                }
                return MOCK_EQUIPMENT;
            }
        },
        // Health score changes frequently with live sensors
        refetchInterval: 5000
    });
};
