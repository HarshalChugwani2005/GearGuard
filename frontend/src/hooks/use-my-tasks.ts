import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Task {
    id: string;
    maintenance_request_id: string;
    equipment_name: string;
    department: string;
    due_date: string;
    status: string;
    notes?: string;
}

export const useMyTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const token = localStorage.getItem('gearguard_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/auth/my-tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError('Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    };

    return { tasks, isLoading, error, refetch: fetchMyTasks };
};
