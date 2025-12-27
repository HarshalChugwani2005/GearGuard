export type RequestStatus = 'New' | 'In Progress' | 'Repaired' | 'Scrap';
export type RequestType = 'Corrective' | 'Preventive';

export interface MaintenanceTeam {
    id: number;
    name: string;
    technician_name: string;
}

export interface Equipment {
    id: number;
    name: string;
    serial_number: string;
    category: string;
    department: string;
    is_functional: boolean;
    team_id?: number;
}

export interface MaintenanceRequest {
    id: number;
    subject: string;
    description?: string;
    request_type: RequestType;
    status: RequestStatus;
    priority: number; // 1-5
    equipment_id: number;
    equipment?: Equipment; // Joined data
    team_id?: number;
    team?: MaintenanceTeam; // Joined data
    scheduled_date?: string; // ISO string
    duration_hours?: number;
    created_at: string;
}

// Grouped requests for Kanban
export interface KanbanData {
    [key: string]: MaintenanceRequest[];
}
