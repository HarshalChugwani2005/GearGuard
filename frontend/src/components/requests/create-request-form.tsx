import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAutoFillTeam } from "@/hooks/use-auto-fill-team";
import { useEquipment } from "@/hooks/use-equipment";

const formSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters."),
    equipment_id: z.string().min(1, "Please select equipment."),
    request_type: z.enum(["Corrective", "Preventive"]),
    priority: z.string(),
    description: z.string().optional(),
    team_name: z.string().optional(), // Read-only auto-filled
    category: z.string().optional(), // Read-only auto-filled
    scheduled_date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateRequestFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateRequestForm = ({ onSuccess, onCancel }: CreateRequestFormProps) => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            request_type: "Corrective",
            priority: "2"
        }
    });

    const selectedEquipmentId = watch("equipment_id");
    const requestType = watch("request_type");

    // Hook triggers auto-fill whenever equipment changes
    useAutoFillTeam(selectedEquipmentId, setValue);

    // @ts-ignore
    const { data: equipmentList } = useEquipment();
    const equipmentOptions = Array.isArray(equipmentList) ? equipmentList : [];

    const onSubmit = (data: FormData) => {
        console.log("Submitting Request:", data);
        // TODO: Call API mutation here
        // await axios.post('/api/requests', data);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input {...register("subject")} placeholder="e.g. Engine Overheating" />
                {errors.subject && <p className="text-red-500 text-xs">{errors.subject.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Equipment</label>
                    <Select {...register("equipment_id")}>
                        <option value="">Select Asset...</option>
                        {equipmentOptions.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.name}</option>
                        ))}
                    </Select>
                    {errors.equipment_id && <p className="text-red-500 text-xs">{errors.equipment_id.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select {...register("priority")}>
                        <option value="1">Low</option>
                        <option value="2">Normal</option>
                        <option value="3">High</option>
                        <option value="4">Urgent</option>
                        <option value="5">Critical</option>
                    </Select>
                </div>
            </div>

            {/* Auto-Filled Read-Only Section */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md border border-slate-100">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Assigned Team</label>
                    <Input {...register("team_name")} disabled className="bg-transparent border-none p-0 h-auto font-medium text-slate-900 shadow-none" placeholder="Auto-filled..." />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                    <Input {...register("category")} disabled className="bg-transparent border-none p-0 h-auto font-medium text-slate-900 shadow-none" placeholder="Auto-filled..." />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input type="radio" value="Corrective" {...register("request_type")} />
                        Corrective
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" value="Preventive" {...register("request_type")} />
                        Preventive
                    </label>
                </div>
            </div>

            {requestType === 'Preventive' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-medium">Scheduled Date</label>
                    <Input type="datetime-local" {...register("scheduled_date")} />
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("description")}
                    placeholder="Describe the issue in detail..."
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Create Request</Button>
            </div>
        </form>
    );
};

export default CreateRequestForm;
