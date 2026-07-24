import type { FormEvent } from "react";
import { ArrowLeft, Check, RotateCcw, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router";

function BusinessCardPreview({ english = false }: { english?: boolean }) {
  return (
    <div className="aspect-[1.75/1] w-full max-w-[430px] overflow-hidden rounded-sm bg-white shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
      <div className="grid h-[calc(100%-8px)] grid-cols-[34%_66%]">
        <div className="flex flex-col justify-between border-r border-slate-200 px-5 py-5">
          <div className="flex items-end gap-1">
            <span className="text-[27px] font-black tracking-[-0.08em] text-[#06418f]">
              CHEIL
            </span>
            <span className="mb-1 h-4 w-1.5 bg-[#55b936]" />
          </div>

          <span className="text-[8px] italic text-slate-600">
            “Smiling Technology”
          </span>
        </div>

        <div className="px-5 py-4">
          <p className="text-[13px] font-semibold text-slate-900">
            {english ? "Hong Gil Dong" : "홍 길 동"}
          </p>
          <p className="mt-0.5 text-[7px] text-slate-500">
            {english
              ? "Highway Eng. Business Div. / Director / P.E."
              : "도로사업부 / 이사 / 도로 및 공항 기술사"}
          </p>

          <p className="mb-2 mt-4 text-[7px] font-semibold text-slate-700">
            CHEIL ENGINEERING CO., LTD.
          </p>

          <div className="space-y-0.5 text-[6.5px] leading-[1.35] text-slate-500">
            <p>
              {english
                ? "22-6, Bangbaemae-ro 16gil, Seocho-gu,"
                : "06779 서울시 서초구 방배천로 22-6"}
            </p>
            <p>{english ? "Seoul, Korea (06779)" : "서울특별시 서초구"}</p>
            <p>TEL. 02-3498-2600 / FAX. 02-572-8970</p>
            <p>MOBILE. 010-1234-5678</p>
            <p>youremail@email.com</p>
            <p>www.cheileng.com</p>
          </div>
        </div>
      </div>

      <div className="flex h-2">
        <div className="w-[12%] bg-[#55b936]" />
        <div className="flex-1 bg-[#06418f]" />
      </div>
    </div>
  );
}

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/15";

export default function OrderFormPage() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("주문하기");
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[1440px] space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-lg font-semibold text-foreground md:text-xl"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              주문서
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

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                선택한 명함 디자인
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                CHEIL 기본형 · TPL-001
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/templates")}
              className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              <RotateCcw size={13} />
              템플릿 다시 선택
            </button>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">앞면</span>
                <span className="text-[11px] text-muted-foreground">Korean</span>
              </div>
              <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border bg-secondary/40 p-6">
                <BusinessCardPreview />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">뒷면</span>
                <span className="text-[11px] text-muted-foreground">English</span>
              </div>
              <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border bg-secondary/40 p-6">
                <BusinessCardPreview english />
              </div>
            </div>
          </div>
        </section>

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
              <input className={inputClassName} defaultValue="홍길동" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                전화번호
              </label>
              <input className={inputClassName} defaultValue="02-3498-2600" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                주소
              </label>
              <input
                className={inputClassName}
                defaultValue="06779 서울시 서초구 방배천로 22-6"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                상세주소
              </label>
              <input
                className={inputClassName}
                placeholder="상세주소를 입력해 주세요."
              />
            </div>
          </div>
        </section>

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
                  defaultValue="제일엔지니어링 기본 명함"
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  사양(재질)
                </label>
                <select className={inputClassName} defaultValue="휘라레 216g">
                  <option value="휘라레 216g">휘라레 216g</option>
                  <option value="스노우 250g">스노우 250g</option>
                  <option value="랑데뷰 240g">랑데뷰 240g</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  수량
                </label>
                <select className={inputClassName} defaultValue="200매">
                  <option value="100매">100매</option>
                  <option value="200매">200매</option>
                  <option value="500매">500매</option>
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
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              <ShoppingCart size={14} />
              주문하기
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
