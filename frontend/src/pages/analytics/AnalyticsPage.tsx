import { Eye, Users, Clock, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { revenueData, weeklyData } from "@/shared/constants/dashboard";

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>분석</h1>
          <p className="text-xs text-muted-foreground mt-0.5">지난 30일 기준</p>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {["7일", "30일", "90일", "올해"].map((p, i) => (
            <button key={p} className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "페이지 뷰", value: "1.24M", trend: 22.1, icon: Eye },
          { label: "순 방문자", value: "284K", trend: 11.4, icon: Users },
          { label: "평균 세션", value: "4m 32s", trend: -5.2, icon: Clock },
          { label: "이탈률", value: "38.4%", trend: -2.1, icon: TrendingDown },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground tracking-wider uppercase">{item.label}</span>
              <item.icon size={12} className="text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>{item.value}</div>
            <span className={`flex items-center text-xs mt-1 ${item.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {item.trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {Math.abs(item.trend)}%
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 md:p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">요일별 세션 & 전환</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b6860" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
              <Bar dataKey="sessions" fill="#eceae5" radius={[3, 3, 0, 0]} name="세션" />
              <Bar dataKey="conversions" fill="#1a1917" radius={[3, 3, 0, 0]} name="전환" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">매출 vs 주문 추이</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#6b6860" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} width={28} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#6b6860" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1a1917" strokeWidth={1.5} dot={false} name="매출" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#d4a853" strokeWidth={1.5} dot={false} name="주문" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">상위 유입 채널</h3>
        <div className="space-y-3">
          {[
            { channel: "유기 검색", sessions: 84200, pct: 68 },
            { channel: "직접 접속", sessions: 31400, pct: 25 },
            { channel: "소셜 미디어", sessions: 11200, pct: 9 },
            { channel: "이메일", sessions: 6800, pct: 5 },
            { channel: "유료 광고", sessions: 4100, pct: 3 },
          ].map((item) => (
            <div key={item.channel} className="flex items-center gap-2 md:gap-3">
              <span className="text-xs text-muted-foreground w-20 md:w-24 shrink-0">{item.channel}</span>
              <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-xs font-mono w-14 text-right hidden sm:block">{item.sessions.toLocaleString()}</span>
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
