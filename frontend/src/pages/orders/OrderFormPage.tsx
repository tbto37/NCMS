import { useState, useEffect, type FormEvent } from "react";
import { ArrowLeft, Check, RotateCcw, ShoppingCart, AlertCircle } from "lucide-react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import OrderCompleteModal from "./components/OrderCompleteModal";
import { API_BASE_URL } from "@/shared/constants/api";
import { useAuth } from "@/app/providers/AuthProvider";
import type {
  OrderFormLocationState,
  BusinessCardInputData,
} from "@/shared/types/businessCard";
import DynamicBusinessCardPreview from "@/components/card/DynamicBusinessCardPreview";

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/15";

interface ProductOptionItem {
  id: number | string;
  category: string;
  name: string;
  sortOrder: number;
}

const defaultCardData: BusinessCardInputData = {
  front: {
    name: "조우진",
    departmentOption: "직접입력",
    department: "상하수도사업부",
    position1Option: "직접입력",
    position1: "부장",
    position2Option: "직접입력",
    position2: "",
    address: "06779 서울시 서초구 강남대로16길 22-6(양재동)",
    telephone: "02-3498-2600",
    fax: "02-572-3112",
    directTelephone: "02-3498-2441",
    mobile: "010-9142-9719",
    email: "a5273586@hanmail.net",
    website: "www.cheileng.com",
  },
  back: {
    name: "Woo-Jin Jo",
    department: "Water Supply & Sewerage Eng. Div.",
    position1: "General Manager",
    position2: "",
    address1: "22-6, Gangnamdaero 16gil, Seocho-gu,",
    address2: "Seoul, Korea (06779)",
    telephone: "82-2-3498-2600",
    fax: "82-2-572-3112",
    directTelephone: "82-2-3498-2441",
    mobile: "82-10-9142-9719",
    email: "a5273586@hanmail.net",
    website: "www.cheileng.com",
  },
};

export default function OrderFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyCode } = useParams<{ companyCode?: string }>();
  const { accessToken } = useAuth();
  const [isOrderCompleteOpen, setIsOrderCompleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const locationState = location.state as OrderFormLocationState | null;
  const orderDraft = locationState?.orderDraft;

  const cardData: BusinessCardInputData = orderDraft
    ? { front: orderDraft.front, back: orderDraft.back }
    : defaultCardData;

  const [recipientName, setRecipientName] = useState(orderDraft?.front?.name || "");
  const [recipientPhone, setRecipientPhone] = useState(
    orderDraft?.front?.mobile || orderDraft?.front?.telephone || "",
  );
  const [recipientAddress, setRecipientAddress] = useState(
    orderDraft?.front?.address || "",
  );
  const [recipientDetailAddress, setRecipientDetailAddress] = useState("");

  useEffect(() => {
    console.group("📇 주문서 페이지 전달 데이터");
    console.log("전체 location.state:", location.state);
    console.log("전체 orderDraft:", orderDraft);
    console.log("선택한 템플릿:", orderDraft?.template);
    console.log("명함 앞면 정보");
    console.table(orderDraft?.front);
    console.log("명함 뒷면 정보");
    console.table(orderDraft?.back);
    console.groupEnd();

    if (orderDraft?.front) {
      if (orderDraft.front.name) setRecipientName(orderDraft.front.name);
      const phoneVal = orderDraft.front.mobile || orderDraft.front.telephone;
      if (phoneVal) setRecipientPhone(phoneVal);
      if (orderDraft.front.address) setRecipientAddress(orderDraft.front.address);
    }
  }, [location.state, orderDraft]);

  const [paperOptions, setPaperOptions] = useState<ProductOptionItem[]>([]);
  const [qtyOptions, setQtyOptions] = useState<ProductOptionItem[]>([]);
  const [selectedPaper, setSelectedPaper] = useState("");
  const [selectedQty, setSelectedQty] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [paperRes, qtyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/product-options?category=PAPER`),
          fetch(`${API_BASE_URL}/api/v1/product-options?category=QTY`),
        ]);

        if (paperRes.ok) {
          const json = await paperRes.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setPaperOptions(json.data);
            setSelectedPaper(json.data[0].name);
          } else {
            const fallbackPapers = [
              { id: "OPT_P1", category: "PAPER", name: "휘라레 216g", sortOrder: 1 },
              { id: "OPT_P2", category: "PAPER", name: "스노우지 250g", sortOrder: 2 },
              { id: "OPT_P3", category: "PAPER", name: "랑데뷰 240g", sortOrder: 3 },
              { id: "OPT_P4", category: "PAPER", name: "띤또레또 250g", sortOrder: 4 },
            ];
            setPaperOptions(fallbackPapers);
            setSelectedPaper(fallbackPapers[0].name);
          }
        }

        if (qtyRes.ok) {
          const json = await qtyRes.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setQtyOptions(json.data);
            const default200 = json.data.find((q: ProductOptionItem) => q.name === "200매");
            setSelectedQty(default200 ? default200.name : json.data[0].name);
          } else {
            const fallbackQtys = [
              { id: "OPT_Q1", category: "QTY", name: "100매", sortOrder: 1 },
              { id: "OPT_Q2", category: "QTY", name: "200매", sortOrder: 2 },
              { id: "OPT_Q3", category: "QTY", name: "300매", sortOrder: 3 },
              { id: "OPT_Q4", category: "QTY", name: "500매", sortOrder: 4 },
              { id: "OPT_Q5", category: "QTY", name: "1000매", sortOrder: 5 },
            ];
            setQtyOptions(fallbackQtys);
            setSelectedQty("200매");
          }
        }
      } catch (e) {
        console.warn("ProductOption DB 조회 실패 - 가라데이터 표시:", e);
        const fallbackPapers = [
          { id: "OPT_P1", category: "PAPER", name: "휘라레 216g", sortOrder: 1 },
          { id: "OPT_P2", category: "PAPER", name: "스노우지 250g", sortOrder: 2 },
          { id: "OPT_P3", category: "PAPER", name: "랑데뷰 240g", sortOrder: 3 },
          { id: "OPT_P4", category: "PAPER", name: "띤또레또 250g", sortOrder: 4 },
        ];
        const fallbackQtys = [
          { id: "OPT_Q1", category: "QTY", name: "100매", sortOrder: 1 },
          { id: "OPT_Q2", category: "QTY", name: "200매", sortOrder: 2 },
          { id: "OPT_Q3", category: "QTY", name: "300매", sortOrder: 3 },
          { id: "OPT_Q4", category: "QTY", name: "500매", sortOrder: 4 },
          { id: "OPT_Q5", category: "QTY", name: "1000매", sortOrder: 5 },
        ];
        setPaperOptions(fallbackPapers);
        setSelectedPaper(fallbackPapers[0].name);
        setQtyOptions(fallbackQtys);
        setSelectedQty("200매");
      }
    }
    loadOptions();
  }, []);

  if (!companyCode) {
    return <Navigate to="/orders" replace />;
  }

  const mainPath = `/${companyCode}/templates`;
  const ordersPath = `/${companyCode}/orders`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const productOptionSummary = `${selectedPaper} / ${selectedQty}`;
      const cardDataJson = JSON.stringify(cardData);

      const requestBody = {
        templateId: orderDraft?.template?.id || "T_1",
        recipientName: recipientName || "홍길동",
        recipientPhone: recipientPhone || "010-0000-0000",
        zipcode: "",
        address: recipientAddress || "기본 주소",
        addressDetail: recipientDetailAddress || "",
        cardDataJson,
        productOptionSummary,
      };

      if (accessToken) {
        const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
          const errorMsg =
            json?.message ||
            json?.error?.message ||
            "주문 접수에 실패했습니다. 다시 시도해 주세요.";
          throw new Error(errorMsg);
        }
      } else {
        console.warn("인증 토큰 없음: 개발/테스트 모드로 주문 완료 모달 표시");
      }

      setIsOrderCompleteOpen(true);
    } catch (err: unknown) {
      console.error("Order submission error:", err);
      setSubmitError(
        err instanceof Error ? err.message : "주문 접수 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[1440px] space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground md:text-xl">
              명함 주문서 작성
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              선택한 명함과 배송 정보를 최종 확인해 주세요.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check size={12} />
            </span>
            <span>템플릿 선택</span>
            <span className="h-px w-5 bg-border" />
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </span>
            <span className="font-medium text-foreground">주문 정보</span>
          </div>
        </div>

        {submitError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 명함 실시간 미리보기 섹션 */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                선택한 명함 디자인
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {orderDraft?.template.name ?? "기본 명함 템플릿"}
                {orderDraft?.template.id ? ` · ${orderDraft.template.id}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(mainPath)}
              className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              <RotateCcw size={13} />
              템플릿 다시 선택
            </button>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">앞면 (한글)</span>
                <span className="text-[11px] text-muted-foreground">Korean</span>
              </div>
              <DynamicBusinessCardPreview
                templateId={orderDraft?.template?.id || "T_CHEIL"}
                cardData={cardData}
                isBack={false}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">뒷면 (영문)</span>
                <span className="text-[11px] text-muted-foreground">English</span>
              </div>
              <DynamicBusinessCardPreview
                templateId={orderDraft?.template?.id || "T_CHEIL"}
                cardData={cardData}
                isBack={true}
              />
            </div>
          </div>
        </section>

        {/* 배송지 주소 섹션 */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">배송지 주소</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              명함을 수령할 담당자와 배송지를 입력합니다.
            </p>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-[0.8fr_1fr_1.8fr_1.8fr]">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                이름
              </label>
              <input
                className={inputClassName}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="이름을 입력해 주세요."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                전화번호
              </label>
              <input
                className={inputClassName}
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="전화번호를 입력해 주세요."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                주소
              </label>
              <input
                className={inputClassName}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="주소를 입력해 주세요."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                상세주소
              </label>
              <input
                className={inputClassName}
                value={recipientDetailAddress}
                onChange={(e) => setRecipientDetailAddress(e.target.value)}
                placeholder="상세주소를 입력해 주세요."
              />
            </div>
          </div>
        </section>

        {/* 제품 정보 섹션 */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">제품 정보</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              용지와 수량을 확인하고 요청사항을 입력합니다.
            </p>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid gap-4 lg:grid-cols-[1.7fr_0.8fr_0.8fr]">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  템플릿명
                </label>
                <input
                  className={inputClassName}
                  value={orderDraft?.template.name ?? "기본 명함 템플릿"}
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  사양(재질)
                </label>
                <select
                  className={inputClassName}
                  value={selectedPaper}
                  onChange={(e) => setSelectedPaper(e.target.value)}
                >
                  {paperOptions.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  수량
                </label>
                <select
                  className={inputClassName}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                >
                  {qtyOptions.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                메모
              </label>
              <textarea
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/15"
                placeholder="제작 또는 배송 관련 요청사항을 입력해 주세요."
              />
            </div>
          </div>
        </section>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              <ArrowLeft size={14} />
              취소
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <ShoppingCart size={14} />
              {isSubmitting ? "주문 접수 중..." : "주문하기"}
            </button>
          </div>
        </div>
      </div>
      <OrderCompleteModal
        open={isOrderCompleteOpen}
        onGoMain={() => navigate(mainPath)}
        onGoOrders={() => navigate(ordersPath)}
      />
    </form>
  );
}
