import { LucideIcon } from "lucide-react";

interface IndicatorCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "critical";
}

const TONE_STYLES: Record<NonNullable<IndicatorCardProps["tone"]>, { icon: string; iconBg: string }> = {
  default: { icon: "text-slate-600", iconBg: "bg-slate-100" },
  critical: { icon: "text-red-600", iconBg: "bg-red-50" },
};

export function IndicatorCard({ label, value, icon: Icon, tone = "default" }: IndicatorCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${styles.iconBg}`}>
        <Icon className={`h-5 w-5 ${styles.icon}`} strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
