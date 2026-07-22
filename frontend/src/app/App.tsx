import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Mail,
  Shield,
  Globe,
  Database,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { id: "users", label: "사용자 관리", icon: Users, badge: 12 },
  { id: "orders", label: "주문 관리", icon: ShoppingCart, badge: 5 },
  { id: "analytics", label: "분석", icon: BarChart3 },
  { id: "settings", label: "설정", icon: Settings },
];

const revenueData = [
  { month: "1월", revenue: 42000000, orders: 1240 },
  { month: "2월", revenue: 38000000, orders: 1100 },
  { month: "3월", revenue: 51000000, orders: 1480 },
  { month: "4월", revenue: 47000000, orders: 1350 },
  { month: "5월", revenue: 63000000, orders: 1820 },
  { month: "6월", revenue: 58000000, orders: 1690 },
  { month: "7월", revenue: 72000000, orders: 2050 },
];

const categoryData = [
  { name: "전자제품", value: 38 },
  { name: "의류", value: 24 },
  { name: "식품", value: 19 },
  { name: "가구", value: 12 },
  { name: "기타", value: 7 },
];

const PIE_COLORS = ["#1a1917", "#d4a853", "#6b6860", "#c5c2ba", "#eceae5"];

const weeklyData = [
  { day: "월", sessions: 2400, conversions: 240 },
  { day: "화", sessions: 1398, conversions: 180 },
  { day: "수", sessions: 3200, conversions: 380 },
  { day: "목", sessions: 2780, conversions: 290 },
  { day: "금", sessions: 4100, conversions: 490 },
  { day: "토", sessions: 2900, conversions: 310 },
  { day: "일", sessions: 1800, conversions: 190 },
];

const recentOrders = [
  { id: "ORD-8821", customer: "김민준", product: "MacBook Pro 14인치", amount: 2990000, status: "완료", date: "2026-07-21" },
  { id: "ORD-8820", customer: "이서연", product: "Nike Air Max 2026", amount: 189000, status: "처리중", date: "2026-07-21" },
  { id: "ORD-8819", customer: "박지훈", product: "삼성 QLED 65인치", amount: 1590000, status: "배송중", date: "2026-07-20" },
  { id: "ORD-8818", customer: "최수아", product: "에어팟 Pro 3세대", amount: 359000, status: "완료", date: "2026-07-20" },
  { id: "ORD-8817", customer: "정우진", product: "아이패드 Air M3", amount: 999000, status: "취소", date: "2026-07-19" },
];

const users = [
  { id: 1, name: "김민준", email: "minjun.kim@email.com", role: "관리자", status: "활성", joined: "2024-03-15", orders: 142 },
  { id: 2, name: "이서연", email: "seoyeon.lee@email.com", role: "편집자", status: "활성", joined: "2024-05-22", orders: 87 },
  { id: 3, name: "박지훈", email: "jihun.park@email.com", role: "뷰어", status: "비활성", joined: "2024-01-08", orders: 23 },
  { id: 4, name: "최수아", email: "sua.choi@email.com", role: "편집자", status: "활성", joined: "2024-07-01", orders: 56 },
  { id: 5, name: "정우진", email: "woojin.jung@email.com", role: "뷰어", status: "보류", joined: "2024-06-14", orders: 12 },
  { id: 6, name: "강예은", email: "yeeun.kang@email.com", role: "관리자", status: "활성", joined: "2023-11-30", orders: 204 },
  { id: 7, name: "조현서", email: "hyunseo.jo@email.com", role: "뷰어", status: "활성", joined: "2025-01-12", orders: 34 },
];

const allOrders = [
  { id: "ORD-8821", customer: "김민준", product: "MacBook Pro 14인치", category: "전자제품", amount: 2990000, status: "완료", date: "2026-07-21" },
  { id: "ORD-8820", customer: "이서연", product: "Nike Air Max 2026", category: "의류", amount: 189000, status: "처리중", date: "2026-07-21" },
  { id: "ORD-8819", customer: "박지훈", product: "삼성 QLED 65인치", category: "전자제품", amount: 1590000, status: "배송중", date: "2026-07-20" },
  { id: "ORD-8818", customer: "최수아", product: "에어팟 Pro 3세대", category: "전자제품", amount: 359000, status: "완료", date: "2026-07-20" },
  { id: "ORD-8817", customer: "정우진", product: "아이패드 Air M3", category: "전자제품", amount: 999000, status: "취소", date: "2026-07-19" },
  { id: "ORD-8816", customer: "강예은", product: "리넨 셔츠 세트", category: "의류", amount: 89000, status: "완료", date: "2026-07-19" },
  { id: "ORD-8815", customer: "조현서", product: "유기농 그래놀라", category: "식품", amount: 42000, status: "배송중", date: "2026-07-18" },
  { id: "ORD-8814", customer: "윤하은", product: "원목 책상 1200", category: "가구", amount: 450000, status: "처리중", date: "2026-07-18" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  완료: { label: "완료", color: "#16a34a", bg: "#dcfce7" },
  처리중: { label: "처리중", color: "#d97706", bg: "#fef3c7" },
  배송중: { label: "배송중", color: "#2563eb", bg: "#dbeafe" },
  취소: { label: "취소", color: "#dc2626", bg: "#fee2e2" },
  활성: { label: "활성", color: "#16a34a", bg: "#dcfce7" },
  비활성: { label: "비활성", color: "#6b6860", bg: "#eceae5" },
  보류: { label: "보류", color: "#d97706", bg: "#fef3c7" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "#6b6860", bg: "#eceae5" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {status === "완료" || status === "활성" ? <CheckCircle size={10} /> : status === "취소" || status === "비활성" ? <XCircle size={10} /> : <Clock size={10} />}
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, trend, icon: Icon, accent }: { label: string; value: string; sub: string; trend?: number; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-5 flex flex-col gap-3 ${accent ? "bg-primary text-primary-foreground" : ""}`}>
      <div className="flex items-start justify-between">
        <span className={`text-xs font-medium tracking-widest uppercase ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{label}</span>
        <div className={`w-8 h-8 rounded flex items-center justify-center ${accent ? "bg-primary-foreground/10" : "bg-secondary"}`}>
          <Icon size={14} className={accent ? "text-primary-foreground" : "text-foreground"} />
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

function DashboardScreen() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>대시보드</h1>
          <p className="text-xs text-muted-foreground mt-0.5">2026년 7월 21일 월요일</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
          <Download size={12} />
          리포트 내보내기
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 매출" value="₩72.4M" sub="이번 달" trend={14.2} icon={DollarSign} accent />
        <StatCard label="신규 주문" value="2,050" sub="이번 달" trend={8.7} icon={ShoppingCart} />
        <StatCard label="신규 사용자" value="847" sub="이번 달" trend={-3.1} icon={Users} />
        <StatCard label="전환율" value="3.84%" sub="이번 달" trend={1.2} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">월별 매출 추이</h3>
            <span className="text-xs text-muted-foreground font-mono">2026 YTD</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1917" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1a1917" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b6860" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => [`₩${(v / 1000000).toFixed(1)}M`, "매출"]} contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
              <Area type="monotone" dataKey="revenue" stroke="#1a1917" strokeWidth={1.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">카테고리 비율</h3>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-xs font-medium font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">최근 주문</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            전체 보기 <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
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

function UsersScreen() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("전체");
  const filtered = users.filter((u) => {
    const matchSearch = u.name.includes(search) || u.email.includes(search);
    const matchRole = roleFilter === "전체" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>사용자 관리</h1>
          <p className="text-xs text-muted-foreground mt-0.5">총 {users.length}명의 사용자</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">
          <Plus size={12} />
          사용자 추가
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "전체 사용자", value: users.length, icon: Users },
          { label: "활성 사용자", value: users.filter((u) => u.status === "활성").length, icon: UserCheck },
          { label: "신규 (이번달)", value: 3, icon: TrendingUp },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-secondary rounded flex items-center justify-center">
              <item.icon size={15} className="text-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 또는 이메일 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            {["전체", "관리자", "편집자", "뷰어"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${roleFilter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["사용자", "역할", "상태", "가입일", "주문 수", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className={`${i < filtered.length - 1 ? "border-b border-border" : ""} hover:bg-secondary/50 transition-colors`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded text-foreground">{user.role}</span>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{user.joined}</td>
                  <td className="px-5 py-3 text-xs font-mono font-medium">{user.orders}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="text-muted-foreground hover:text-foreground transition-colors"><Eye size={13} /></button>
                      <button className="text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={13} /></button>
                      <button className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{filtered.length}명 표시</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-6 h-6 text-xs rounded ${p === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersScreen() {
  const [statusFilter, setStatusFilter] = useState("전체");
  const filtered = allOrders.filter((o) => statusFilter === "전체" || o.status === statusFilter);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>주문 관리</h1>
          <p className="text-xs text-muted-foreground mt-0.5">오늘 15건의 새 주문</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs rounded hover:bg-secondary transition-colors">
            <Filter size={11} />
            필터
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs rounded hover:bg-secondary transition-colors">
            <Download size={11} />
            내보내기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "전체", count: allOrders.length, color: "text-foreground" },
          { label: "완료", count: allOrders.filter((o) => o.status === "완료").length, color: "text-emerald-600" },
          { label: "처리중", count: allOrders.filter((o) => o.status === "처리중").length, color: "text-amber-600" },
          { label: "취소", count: allOrders.filter((o) => o.status === "취소").length, color: "text-red-500" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setStatusFilter(item.label)}
            className={`bg-card border rounded-lg p-4 text-left transition-all ${statusFilter === item.label ? "border-primary shadow-sm" : "border-border hover:border-foreground/20"}`}
          >
            <div className={`text-xl font-semibold ${item.color}`} style={{ fontFamily: "'Instrument Serif', serif" }}>{item.count}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.label} 주문</div>
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["주문번호", "고객", "상품", "카테고리", "금액", "상태", "날짜", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <tr key={order.id} className={`${i < filtered.length - 1 ? "border-b border-border" : ""} hover:bg-secondary/50 transition-colors`}>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{order.id}</td>
                  <td className="px-5 py-3 text-xs font-medium text-foreground">{order.customer}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{order.product}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-secondary px-2 py-0.5 rounded">{order.category}</span></td>
                  <td className="px-5 py-3 text-xs font-medium font-mono">₩{order.amount.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{order.date}</td>
                  <td className="px-5 py-3">
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>분석</h1>
          <p className="text-xs text-muted-foreground mt-0.5">지난 30일 기준</p>
        </div>
        <div className="flex items-center gap-2">
          {["7일", "30일", "90일", "올해"].map((p, i) => (
            <button key={p} className={`px-2.5 py-1 text-xs rounded transition-colors ${i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "페이지 뷰", value: "1.24M", trend: 22.1, icon: Eye },
          { label: "순 방문자", value: "284K", trend: 11.4, icon: Users },
          { label: "평균 세션", value: "4m 32s", trend: -5.2, icon: Clock },
          { label: "이탈률", value: "38.4%", trend: -2.1, icon: TrendingDown },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground tracking-wider uppercase">{item.label}</span>
              <item.icon size={13} className="text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>{item.value}</div>
            <span className={`flex items-center text-xs mt-1 ${item.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {item.trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {Math.abs(item.trend)}% 전주 대비
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">요일별 세션 & 전환</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
              <Bar dataKey="sessions" fill="#eceae5" radius={[3, 3, 0, 0]} name="세션" />
              <Bar dataKey="conversions" fill="#1a1917" radius={[3, 3, 0, 0]} name="전환" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">매출 vs 주문 추이</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6b6860" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6b6860" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid rgba(26,25,23,0.12)", borderRadius: 6 }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1a1917" strokeWidth={1.5} dot={false} name="매출" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#d4a853" strokeWidth={1.5} dot={false} name="주문" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">상위 유입 채널</h3>
        <div className="space-y-3">
          {[
            { channel: "유기 검색", sessions: 84200, pct: 68 },
            { channel: "직접 접속", sessions: 31400, pct: 25 },
            { channel: "소셜 미디어", sessions: 11200, pct: 9 },
            { channel: "이메일", sessions: 6800, pct: 5 },
            { channel: "유료 광고", sessions: 4100, pct: 3 },
          ].map((item) => (
            <div key={item.channel} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 shrink-0">{item.channel}</span>
              <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-xs font-mono w-12 text-right">{item.sessions.toLocaleString()}</span>
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen() {
  const [notifications, setNotifications] = useState({ email: true, push: false, sms: true });
  const [activeTab, setActiveTab] = useState("일반");

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>설정</h1>
        <p className="text-xs text-muted-foreground mt-0.5">계정 및 시스템 설정 관리</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {["일반", "알림", "보안", "인테그레이션"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "일반" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-4">프로필 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "이름", value: "김관리자", type: "text" },
                { label: "이메일", value: "admin@example.com", type: "email" },
                { label: "조직", value: "주식회사 예시", type: "text" },
                { label: "직책", value: "시스템 관리자", type: "text" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">저장</button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-4">시스템 설정</h3>
            <div className="space-y-3">
              {[
                { label: "언어", value: "한국어", icon: Globe },
                { label: "시간대", value: "Asia/Seoul (UTC+9)", icon: Clock },
                { label: "데이터 백업 주기", value: "매일 자정", icon: Database },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5">
                    <item.icon size={13} className="text-muted-foreground" />
                    <span className="text-xs text-foreground">{item.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "알림" && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-medium">알림 채널</h3>
          {(["email", "push", "sms"] as const).map((key) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                {key === "email" ? <Mail size={14} className="text-muted-foreground" /> : key === "push" ? <Bell size={14} className="text-muted-foreground" /> : <AlertTriangle size={14} className="text-muted-foreground" />}
                <div>
                  <div className="text-xs font-medium">{key === "email" ? "이메일 알림" : key === "push" ? "푸시 알림" : "SMS 알림"}</div>
                  <div className="text-xs text-muted-foreground">{key === "email" ? "주문, 사용자 관련 알림" : key === "push" ? "브라우저 푸시 알림" : "긴급 알림만"}</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`w-9 h-5 rounded-full transition-colors relative ${notifications[key] ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[key] ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "보안" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-foreground" />
              <h3 className="text-sm font-medium">보안 설정</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "2단계 인증", desc: "앱 인증을 통한 추가 보안", active: true },
                { label: "로그인 알림", desc: "새 기기 로그인 시 알림", active: true },
                { label: "세션 타임아웃", desc: "30분 비활성 시 자동 로그아웃", active: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <StatusBadge status={item.active ? "활성" : "비활성"} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium mb-3">비밀번호 변경</h3>
            <div className="space-y-3">
              {["현재 비밀번호", "새 비밀번호", "비밀번호 확인"].map((label) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <button className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-opacity">변경하기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "인테그레이션" && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-medium">연동 서비스</h3>
          {[
            { name: "Slack", desc: "팀 알림 전송", connected: true },
            { name: "Google Analytics", desc: "사이트 분석 데이터", connected: true },
            { name: "Stripe", desc: "결제 처리", connected: false },
            { name: "Mailchimp", desc: "이메일 마케팅", connected: false },
          ].map((svc) => (
            <div key={svc.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs font-bold text-muted-foreground">{svc.name[0]}</div>
                <div>
                  <div className="text-xs font-medium">{svc.name}</div>
                  <div className="text-xs text-muted-foreground">{svc.desc}</div>
                </div>
              </div>
              <button className={`px-3 py-1 text-xs rounded border transition-colors ${svc.connected ? "border-border text-muted-foreground hover:text-red-500 hover:border-red-200" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}>
                {svc.connected ? "연결 해제" : "연결"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const screens: Record<string, React.ReactNode> = {
    dashboard: <DashboardScreen />,
    users: <UsersScreen />,
    orders: <OrdersScreen />,
    analytics: <AnalyticsScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-52" : "w-14"} shrink-0 bg-card border-r border-border flex flex-col transition-all duration-200`}>
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border h-12">
          {sidebarOpen && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-5 h-5 bg-primary rounded flex items-center justify-center shrink-0">
                <Package size={10} className="text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold tracking-wide truncate">ADMIN</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-auto">
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map((item) => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-colors relative ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
              >
                <item.icon size={14} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {item.badge && sidebarOpen && (
                  <span className={`ml-auto text-xs font-mono px-1.5 py-0.5 rounded-full ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-foreground"}`}>
                    {item.badge}
                  </span>
                )}
                {item.badge && !sidebarOpen && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors`}>
            <LogOut size={13} className="shrink-0" />
            {sidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 bg-card border-b border-border flex items-center px-5 gap-4 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="검색..."
              className="w-full pl-7 pr-3 py-1 text-xs bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={15} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full" />
            </button>
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">K</div>
              <span className="text-xs font-medium hidden sm:block">김관리자</span>
              <ChevronDown size={11} className="text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {screens[activePage]}
        </main>
      </div>
    </div>
  );
}
