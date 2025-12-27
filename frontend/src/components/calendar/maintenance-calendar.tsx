import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMaintenanceRequests } from '@/hooks/use-maintenance-requests';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const MaintenanceCalendar = () => {
    const { data: requests } = useMaintenanceRequests();

    // Transform requests into Calendar Events
    // Only show Preventive tasks or Scheduled Corrective ones
    const events = useMemo(() => {
        if (!requests) return [];

        return requests
            .filter(req => req.scheduled_date)
            .map(req => ({
                id: req.id,
                title: `${req.equipment?.name} - ${req.subject}`,
                start: new Date(req.scheduled_date!),
                end: new Date(new Date(req.scheduled_date!).getTime() + (req.duration_hours || 1) * 3600000), // Default 1 hour if no duration
                resource: req,
                allDay: false
            }));
    }, [requests]);

    return (
        <Card className="h-[700px] p-4 shadow-sm border border-slate-200">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day']}
                defaultView='month'
                eventPropGetter={(event: any) => {
                    const isPreventive = event.resource.request_type === 'Preventive';
                    return {
                        className: isPreventive ? 'bg-primary-100 text-primary-900 border-l-4 border-l-primary-600' : 'bg-orange-100 text-orange-900 border-l-4 border-l-orange-500',
                        style: {
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    };
                }}
                onSelectEvent={(event: any) => alert(`Selected: ${event.title}`)} // Placeholder for Modal
            />
        </Card>
    );
};

export default MaintenanceCalendar;
