import { useState } from "react";
import { Globe, Clock, Database, Mail, Bell, AlertTriangle, Shield } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, push: false, sms: true });
  const [activeTab, setActiveTab] = useState("일반");

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>설정</h1>
        <p className="text-xs text-muted-foreground mt-0.5">계정 및 시스템 설정 관리</p>
      </div>

      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {["일반", "알림", "보안", "인테그레이션"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 md:px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "일반" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 md:p-5">
            <h3 className="text-sm font-medium mb-4">프로필 정보</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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

          <div className="bg-card border border-border rounded-lg p-4 md:p-5">
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
        <div className="bg-card border border-border rounded-lg p-4 md:p-5 space-y-1">
          <h3 className="text-sm font-medium mb-3">알림 채널</h3>
          {(["email", "push", "sms"] as const).map((key) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                {key === "email" ? <Mail size={13} className="text-muted-foreground" /> : key === "push" ? <Bell size={13} className="text-muted-foreground" /> : <AlertTriangle size={13} className="text-muted-foreground" />}
                <div>
                  <div className="text-xs font-medium">{key === "email" ? "이메일 알림" : key === "push" ? "푸시 알림" : "SMS 알림"}</div>
                  <div className="text-xs text-muted-foreground">{key === "email" ? "주문, 사용자 관련 알림" : key === "push" ? "브라우저 푸시 알림" : "긴급 알림만"}</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${notifications[key] ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[key] ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "보안" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={13} className="text-foreground" />
              <h3 className="text-sm font-medium">보안 설정</h3>
            </div>
            <div className="space-y-1">
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
          <div className="bg-card border border-border rounded-lg p-4 md:p-5">
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
        <div className="bg-card border border-border rounded-lg p-4 md:p-5 space-y-1">
          <h3 className="text-sm font-medium mb-3">연동 서비스</h3>
          {[
            { name: "Slack", desc: "팀 알림 전송", connected: true },
            { name: "Google Analytics", desc: "사이트 분석 데이터", connected: true },
            { name: "Stripe", desc: "결제 처리", connected: false },
            { name: "Mailchimp", desc: "이메일 마케팅", connected: false },
          ].map((svc) => (
            <div key={svc.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 bg-secondary rounded flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{svc.name[0]}</div>
                <div className="min-w-0">
                  <div className="text-xs font-medium">{svc.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{svc.desc}</div>
                </div>
              </div>
              <button className={`px-2.5 py-1 text-xs rounded border whitespace-nowrap shrink-0 transition-colors ml-2 ${svc.connected ? "border-border text-muted-foreground hover:text-red-500 hover:border-red-200" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}>
                {svc.connected ? "연결 해제" : "연결"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
