import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface HealthScoreGaugeProps {
    score: number; // 0-100
    size?: number;
    showDetails?: boolean;
}

const HealthScoreGauge = ({ score, size = 200, showDetails = true }: HealthScoreGaugeProps) => {
    // Determine color based on score
    let color = "#10b981"; // Success (Green)
    if (score < 80) color = "#f59e0b"; // Warning (Yellow)
    if (score < 50) color = "#ef4444"; // Danger (Red)

    const data = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ];

    return (
        <div className="flex flex-col items-center justify-center">
            <div style={{ width: size, height: size }} className="relative">
                {/* Full Circle Gauge */}
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
                            endAngle={450}
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={2}
                            dataKey="value"
                        >
                            <Cell key="score" fill={color} />
                            <Cell key="bg" fill="#e2e8f0" stroke="none" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Score Text - Centered */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-3xl font-bold text-slate-700">{score}%</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Health</div>
                </div>
            </div>

            {showDetails && (
                <p className={cn(
                    "text-sm font-medium mt-2 px-3 py-1 rounded-full",
                    score >= 80 ? "bg-green-100 text-green-700" :
                        score >= 50 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                )}>
                    {score >= 80 ? "Optimal Condition" : score >= 50 ? "Needs Attention" : "Critical State"}
                </p>
            )}
        </div>
    );
};

export default HealthScoreGauge;
