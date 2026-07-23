import {
  Download,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { revenueData, categoryData, PIE_COLORS, recentOrders } from "@/shared/constants/dashboard";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>대시보드</h1>
          <p className="text-xs text-muted-foreground mt-0.5">2026년 7월 21일 월요일</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
          <Download size={11} />
          <span className="hidden sm:inline">리포트 내보내기</span>
          <span className="sm:hidden">내보내기</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="총 매출" value="₩72.4M" sub="이번 달" trend={14.2} icon={DollarSign} accent />
        <StatCard label="신규 주문" value="2,050" sub="이번 달" trend={8.7} icon={ShoppingCart} />
        <StatCard label="신규 사용자" value="847" sub="이번 달" trend={-3.1} icon={Users} />
        <StatCard label="전환율" value="3.84%" sub="이번 달" trend={1.2} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">월별 매출 추이</h3>
            <span className="text-xs text-muted-foreground font-mono">2026 YTD</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1917" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1a1917" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b6860" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} width={32} />
              <Tooltip formatter={(v: number) => [`₩${(v / 1000000).toFixed(1)}M`, "매출"]} contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
              <Area type="monotone" dataKey="revenue" stroke="#1a1917" strokeWidth={1.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">카테고리 비율</h3>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" paddingAngle={2}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-xs font-medium font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: card list / Desktop: table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">최근 주문</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            전체 보기 <ChevronRight size={12} />
          </button>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-border">
          {recentOrders.map((order) => (
            <div key={order.id} className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-xs font-medium text-foreground truncate">{order.product}</div>
                <div className="text-xs text-muted-foreground">{order.customer} · {order.date}</div>
              </div>
              <div className="text-xs font-medium font-mono shrink-0">₩{order.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr className="border-b border-border">
              {["주문번호", "고객", "상품", "금액", "상태", "날짜"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">{h}</th>
              ))}
            </tr>
            </thead>
            <tbody>
            {recentOrders.map((order, i) => (
              <tr key={order.id} className={`${i < recentOrders.length - 1 ? "border-b border-border" : ""} hover:bg-secondary/50 transition-colors`}>
                <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{order.id}</td>
                <td className="px-5 py-3 text-xs font-medium text-foreground">{order.customer}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{order.product}</td>
                <td className="px-5 py-3 text-xs font-medium font-mono">₩{order.amount.toLocaleString()}</td>
                <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{order.date}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
