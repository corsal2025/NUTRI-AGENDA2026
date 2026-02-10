import { LucideIcon } from "lucide-react"
import clsx from "clsx"

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string
    color: "teal" | "blue" | "pink" | "green" | "orange" | "emerald" | "fuchsia"
    className?: string
}

const colorMap = {
    teal: { text: "text-teal-600", bg: "bg-teal-50", bar: "bg-teal-500" },
    blue: { text: "text-blue-600", bg: "bg-blue-50", bar: "bg-blue-500" },
    pink: { text: "text-pink-600", bg: "bg-pink-50", bar: "bg-pink-500" },
    green: { text: "text-green-600", bg: "bg-green-50", bar: "bg-green-500" },
    orange: { text: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-500" },
    emerald: { text: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" },
    fuchsia: { text: "text-fuchsia-600", bg: "bg-fuchsia-50", bar: "bg-fuchsia-600" },
}

export function StatCard({ icon: Icon, label, value, color, className }: StatCardProps) {
    const styles = colorMap[color] || colorMap.fuchsia
    const percent = parseInt(value) || 50

    return (
        <div className={clsx(
            "bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 flex items-center justify-between gap-5",
            className
        )}>
            <div className={clsx("size-14 rounded-2xl flex items-center justify-center border border-transparent shadow-sm", styles.bg)}>
                <Icon className={styles.text} size={24} />
            </div>

            <div className="flex-1 space-y-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{label}</span>
                    <span className="text-xl font-bold text-gray-900 font-serif">{value}</span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-gray-50">
                    <div
                        className={clsx("h-full rounded-full transition-all duration-1000 ease-out", styles.bar)}
                        style={{ width: value.includes('%') ? value : `${percent}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
