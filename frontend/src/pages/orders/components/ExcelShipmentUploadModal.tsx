import React, { useState } from "react";
import { Upload, X, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { API_BASE_URL } from "@/shared/constants/api";

interface ExcelShipmentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token?: string | null;
}

interface UploadFailure {
  orderNo: string;
  name: string;
  reason: string;
}

interface UploadResult {
  successCount: number;
  failCount: number;
  failures: UploadFailure[];
}

export function ExcelShipmentUploadModal({
  open,
  onClose,
  onSuccess,
  token,
}: ExcelShipmentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg("");
      setResult(null);
    }
  }

  async function parseCsvOrText(file: File): Promise<any[]> {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    
    // 컬럼 인덱스 찾기
    const orderNoIdx = headers.findIndex((h) => h.includes("주문번호") || h.toLowerCase().includes("orderno") || h.includes("주문 ID"));
    const nameIdx = headers.findIndex((h) => h.includes("이름") || h.includes("수령인") || h.includes("주문자") || h.toLowerCase().includes("name"));
    const trackingIdx = headers.findIndex((h) => h.includes("송장") || h.includes("운송장") || h.toLowerCase().includes("tracking"));
    const carrierIdx = headers.findIndex((h) => h.includes("택배") || h.toLowerCase().includes("carrier"));

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const orderNo = orderNoIdx >= 0 ? cols[orderNoIdx] : cols[0];
      const name = nameIdx >= 0 ? cols[nameIdx] : (cols[1] || "");
      const trackingNumber = trackingIdx >= 0 ? cols[trackingIdx] : (cols[2] || "");
      const carrierCode = carrierIdx >= 0 ? cols[carrierIdx] : "롯데택배";

      if (orderNo && trackingNumber) {
        rows.push({
          orderNo,
          name,
          carrierCode,
          trackingNumber,
        });
      }
    }
    return rows;
  }

  async function handleUpload() {
    if (!file) {
      setErrorMsg("엑셀(CSV) 파일을 선택해 주세요.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setResult(null);

    try {
      // 텍스트/CSV 파싱
      const rows = await parseCsvOrText(file);
      if (rows.length === 0) {
        throw new Error("파싱 가능한 주문 및 송장 데이터가 엑셀 파일에 없습니다. (헤더: 주문번호, 이름, 송장번호 필요)");
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/operator/orders/shipments/excel-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(rows),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || "송장 엑셀 업로드 처리 실패");
      }

      const data: UploadResult = json.data;
      setResult(data);
      if (data.successCount > 0) {
        onSuccess();
      }
    } catch (e: any) {
      setErrorMsg(e.message || "파일 처리 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">택배사 송장 엑셀 일괄 매칭</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/30 p-3.5 border border-blue-200/50 dark:border-blue-800/50 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            💡 **매칭 규칙 (주문번호 + 이름)**
            <br />
            엑셀 내 <strong>[주문번호]</strong>와 <strong>[이름(수령인/주문자)]</strong> 2가지 조건이 모두 일치하는 주문건만 송장번호가 매칭되고 <strong>발송완료(`SHIPPED`)</strong> 상태로 자동 전환됩니다.
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              송장 엑셀(CSV) 파일 선택
            </label>
            <input
              type="file"
              accept=".csv, .xlsx, .xls, .txt"
              onChange={handleFileChange}
              className="block w-full text-xs text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-[11px] text-muted-foreground">
              ※ 첫번째 행에 `주문번호`, `이름`, `송장번호` 컬럼명이 포함되어야 합니다.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="h-4 w-4" /> 성공: {result.successCount}건
                </span>
                <span className={result.failCount > 0 ? "text-destructive" : "text-muted-foreground"}>
                  실패/미매칭: {result.failCount}건
                </span>
              </div>

              {result.failures.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto space-y-1 rounded border border-border bg-background p-2 text-[11px]">
                  <p className="font-semibold text-destructive mb-1">실패 내역 상세:</p>
                  {result.failures.map((f, idx) => (
                    <div key={idx} className="flex justify-between border-b border-border/50 py-0.5 last:border-0 text-muted-foreground">
                      <span>[{f.orderNo}] {f.name}</span>
                      <span className="text-destructive font-mono">{f.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4 bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {isUploading ? "매칭 처리 중..." : "송장 일괄 매칭"}
          </button>
        </div>
      </div>
    </div>
  );
}
