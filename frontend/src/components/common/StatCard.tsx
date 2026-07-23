import type { ElementType } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({ label, value, sub, trend, icon: Icon, accent }: { label: string; value: string; sub: string; trend?: number; icon: ElementType; accent?: boolean }) {
  return (
    <div className={`border border-border rounded-lg p-4 flex flex-col gap-3 ${accent ? "bg-primary text-primary-foreground" : "bg-card"}`}>
      <div className="flex items-start justify-between">
        <span className={`text-xs font-medium tracking-widest uppercase ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{label}</span>
        <div className={`w-7 h-7 rounded flex items-center justify-center ${accent ? "bg-primary-foreground/10" : "bg-secondary"}`}>
          <Icon size={13} className={accent ? "text-primary-foreground" : "text-foreground"} />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-semibold tracking-tight ${accent ? "text-primary-foreground" : "text-foreground"}`} style={{ fontFamily: "'Instrument Serif', serif" }}>{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          {trend !== undefined && (
            <span className={`flex items-center text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
          <span className={`text-xs ${accent ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{sub}</span>
        </div>
      </div>
    </div>
  );
}
