import React, { useState } from "react";
import { Upload, X, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
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

  async function parseExcelFile(file: File): Promise<any[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];

    const worksheet = workbook.Sheets[sheetName];
    const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (jsonRows.length <= 1) return [];

    // 1. 헤더 행 탐색 ('운송장'/'송장'/'받는분'/'수령인'/'이름' 등이 포함된 첫 행)
    let headerRowIdx = 0;
    for (let i = 0; i < Math.min(15, jsonRows.length); i++) {
      const rowStr = (jsonRows[i] || []).join(" ").toLowerCase();
      if (
        rowStr.includes("운송장") ||
        rowStr.includes("송장") ||
        rowStr.includes("받는분") ||
        rowStr.includes("수령인") ||
        rowStr.includes("이름")
      ) {
        headerRowIdx = i;
        break;
      }
    }

    const headers = (jsonRows[headerRowIdx] || []).map((h: any) =>
      String(h || "").trim().toLowerCase()
    );

    // 2. 컬럼 인덱스 매칭
    const nameIdx = headers.findIndex((h) =>
      ["받는분", "수령인", "이름", "받는 사람", "수하인", "주문자", "성명", "name", "recipient"].some((k) =>
        h.includes(k)
      )
    );

    const trackingIdx = headers.findIndex((h) =>
      ["운송장번호", "송장번호", "운송장", "송장", "등기번호", "tracking", "invoice"].some((k) =>
        h.includes(k)
      )
    );

    const carrierIdx = headers.findIndex((h) =>
      ["택배사", "택배사명", "배송업체", "carrier"].some((k) => h.includes(k))
    );

    const orderNoIdx = headers.findIndex((h) =>
      ["주문번호", "고객주문번호", "orderno", "주문 id"].some((k) => h.includes(k))
    );

    const rows: any[] = [];
    for (let i = headerRowIdx + 1; i < jsonRows.length; i++) {
      const row = jsonRows[i];
      if (!row || row.length === 0) continue;

      const name = nameIdx >= 0 ? String(row[nameIdx] || "").trim() : "";
      const trackingNumber = trackingIdx >= 0 ? String(row[trackingIdx] || "").trim() : "";
      const carrierCode = carrierIdx >= 0 ? String(row[carrierIdx] || "").trim() : "롯데택배";
      const orderNo = orderNoIdx >= 0 ? String(row[orderNoIdx] || "").trim() : "";

      if (name && trackingNumber) {
        rows.push({
          orderNo: orderNo || "",
          name,
          carrierCode: carrierCode || "롯데택배",
          trackingNumber,
        });
      }
    }
    return rows;
  }

  async function handleUpload() {
    if (!file) {
      setErrorMsg("송장 엑셀(.xlsx, .xls, .csv) 파일을 선택해 주세요.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        throw new Error(
          "파싱 가능한 송장 및 수령인(받는분) 데이터가 엑셀 파일에 없습니다. (헤더: [운송장번호 / 송장번호] 및 [받는분 / 수령인 / 이름] 필수)"
        );
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
            💡 <strong>스마트 매칭 규칙 (송장번호 + 받는분/이름)</strong>
            <br />
            엑셀 내 <strong>[운송장번호]</strong>와 <strong>[받는분/수령인 이름]</strong>을 기반으로 시스템 DB의 진행 중인 주문을 자동 매칭하여 <strong>발송완료(`SHIPPED`)</strong> 상태로 일괄 전환합니다.
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              송장 엑셀 파일 선택 (.xlsx, .xls, .csv)
            </label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv, .txt"
              onChange={handleFileChange}
              className="block w-full text-xs text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-[11px] text-muted-foreground">
              ※ 헤더 행에 `운송장번호`(또는 `송장번호`)와 `받는분`(또는 `수령인`, `이름`)이 포함되어야 합니다.
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
                      <span>{f.name || f.orderNo || "대상명 미상"}</span>
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
