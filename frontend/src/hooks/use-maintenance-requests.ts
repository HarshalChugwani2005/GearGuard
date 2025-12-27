import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MaintenanceRequest } from '@/types';

// Mock data for development when backend is not reachable
const MOCK_REQUESTS: MaintenanceRequest[] = [
    {
        id: 1,
        subject: "Leaking Oil",
        request_type: "Corrective",
        status: "New",
        priority: 4,
        equipment_id: 101,
        equipment: {
            id: 101, name: "CNC Machine 01", serial_number: "CNC-001",
            category: "Machinery", department: "Production", is_functional: true
        },
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        subject: "Routine Inspection",
        request_type: "Preventive",
        status: "In Progress",
        priority: 2,
        equipment_id: 102,
        equipment: {
            id: 102, name: "Conveyor Belt A", serial_number: "CV-002",
            category: "Logistics", department: "Warehouse", is_functional: true
        },
        scheduled_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday (Overdue)
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        subject: "Printer Jam",
        request_type: "Corrective",
        status: "Repaired",
        priority: 1,
        equipment_id: 103,
        equipment: {
            id: 103, name: "Office Printer", serial_number: "PRT-003",
            category: "IT", department: "Office", is_functional: true
        },
        created_at: new Date().toISOString()
    }
];

export const useMaintenanceRequests = () => {
    return useQuery({
        queryKey: ['maintenance_requests'],
        queryFn: async () => {
            try {
                // Try to fetch from real API
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/maintenance-requests`);
                return data as MaintenanceRequest[];
            } catch (error) {
                // Fallback to mock data for development
                console.warn("Backend not reachable, using mock data");
                return MOCK_REQUESTS;
            }
        },
        refetchInterval: 5000, // Poll every 5s for "Real-Time" feel
    });
};
