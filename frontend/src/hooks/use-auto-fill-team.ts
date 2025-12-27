import { useEffect, useState } from 'react';
import { useEquipment } from './use-equipment';
import { UseFormSetValue } from 'react-hook-form';

export const useAutoFillTeam = (
    equipmentId: string | number,
    setValue: UseFormSetValue<any>
) => {
    // @ts-ignore
    const { data: equipment } = useEquipment(equipmentId ? Number(equipmentId) : undefined);
    const [teamName, setTeamName] = useState("");

    useEffect(() => {
        // If we have equipment data, auto-fill the team
        // In a real app, this might come from the relation or a separate API call
        if (equipment && !Array.isArray(equipment)) {
            // Logic: map team_id to name for display
            const teamMap: Record<number, string> = {
                1: "Mechanics Team",
                2: "Logistics Support",
                3: "IT Support"
            };
            const name = teamMap[equipment.team_id || 0] || "General Maintenance";

            setTeamName(name);
            setValue("team_name", name); // Update form field
            setValue("category", equipment.category); // Auto-fill category too
        }
    }, [equipment, setValue]);

    return { teamName };
};
