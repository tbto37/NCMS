import {
  ArrowRight,
  Building2,
  Minus,
  Plus,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import type { FormEvent } from "react";

import type {
  BackBusinessCardData,
  BusinessCardInputData,
  FrontBusinessCardData,
} from "@/shared/types/businessCard";

interface TemplateEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  onNext?: (cardData: BusinessCardInputData) => void;
}

type FieldDefinition<T extends object> = {
  name: keyof T;
  label: string;
  value: string;
  type?: "select";
};

const frontFields: Array<FieldDefinition<FrontBusinessCardData>> = [
  { name: "name", label: "이름", value: "홍길동" },
  {
    name: "departmentOption",
    label: "부서 선택",
    value: "직접입력",
    type: "select",
  },
  { name: "department", label: "부서", value: "도로사업부" },
  {
    name: "position1Option",
    label: "직급 1 선택",
    value: "직접입력",
    type: "select",
  },
  { name: "position1", label: "직급 1", value: "이사" },
  {
    name: "position2Option",
    label: "직급 2 선택",
    value: "직접입력",
    type: "select",
  },
  { name: "position2", label: "직급 2", value: "도로 및 공항 기술사" },
  { name: "address", label: "주소", value: "06779 서울시 서초구 방배천로 22-6" },
  { name: "telephone", label: "전화번호", value: "02-3498-2600" },
  { name: "fax", label: "팩스", value: "02-572-8970" },
  { name: "directTelephone", label: "직통번호", value: "02-3498-2662" },
  { name: "mobile", label: "핸드폰", value: "010-1234-5678" },
  { name: "email", label: "이메일", value: "youremail@email.com" },
  { name: "website", label: "웹사이트", value: "www.cheileng.com" },
];

const backFields: Array<FieldDefinition<BackBusinessCardData>> = [
  { name: "name", label: "이름", value: "Hong Gil Dong" },
  { name: "department", label: "부서", value: "Highway Eng. Business Div." },
  { name: "position1", label: "직급 1", value: "Director" },
  { name: "position2", label: "직급 2", value: "P.E." },
  {
    name: "address1",
    label: "주소 1",
    value: "22-6, Bangbaemae-ro 16gil, Seocho-gu,",
  },
  { name: "address2", label: "주소 2", value: "Seoul, Korea (06779)" },
  { name: "telephone", label: "전화번호", value: "82-2-3498-2600" },
  { name: "fax", label: "팩스", value: "82-2-572-8970" },
  { name: "directTelephone", label: "직통번호", value: "82-2-3498-2745" },
  { name: "mobile", label: "핸드폰", value: "82-10-1234-5678" },
  { name: "email", label: "이메일", value: "youremail@email.com" },
  { name: "website", label: "웹사이트", value: "www.cheileng.com" },
];

function BusinessCardPreview({ english = false }: { english?: boolean }) {
  return (
    <div className="flex min-h-[210px] items-center justify-center rounded-xl border border-border bg-secondary/40 p-6">
      <div className="aspect-[1.75/1] w-full max-w-[430px] overflow-hidden rounded-sm bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
        <div className="grid h-[calc(100%-8px)] grid-cols-[34%_66%]">
          <div className="flex flex-col justify-between border-r border-slate-200 px-5 py-5">
            <div className="flex items-end gap-1">
              <span className="text-[27px] font-black tracking-[-0.08em] text-[#06418f]">CHEIL</span>
              <span className="mb-1 h-4 w-1.5 bg-[#55b936]" />
            </div>
            <span className="text-[8px] italic text-slate-600">“Smiling Technology”</span>
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
            <p className="mb-2 mt-4 text-[7px] font-semibold text-slate-700">CHEIL ENGINEERING CO., LTD.</p>
            <div className="space-y-0.5 text-[6.5px] leading-[1.35] text-slate-500">
              <p>{english ? "22-6, Bangbaemae-ro 16gil, Seocho-gu," : "06779 서울시 서초구 방배천로 22-6"}</p>
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
    </div>
  );
}

function FieldList<T extends object>({
  title,
  description,
  fieldPrefix,
  fields,
}: {
  title: string;
  description: string;
  fieldPrefix: "front" | "back";
  fields: Array<FieldDefinition<T>>;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3 px-5 py-5">
        {fields.map((field) => {
          const fieldName = `${fieldPrefix}.${String(field.name)}`;

          return (
            <div key={fieldName} className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3">
              <label htmlFor={fieldName} className="text-xs font-medium text-muted-foreground">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  id={fieldName}
                  name={fieldName}
                  defaultValue={field.value}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                >
                  <option value="직접입력">직접입력</option>
                  <option value="대표이사">대표이사</option>
                  <option value="이사">이사</option>
                  <option value="부장">부장</option>
                </select>
              ) : (
                <input
                  id={fieldName}
                  name={fieldName}
                  defaultValue={field.value}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getFormValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function createCardData(formData: FormData): BusinessCardInputData {
  return {
    front: {
      name: getFormValue(formData, "front.name"),
      departmentOption: getFormValue(formData, "front.departmentOption"),
      department: getFormValue(formData, "front.department"),
      position1Option: getFormValue(formData, "front.position1Option"),
      position1: getFormValue(formData, "front.position1"),
      position2Option: getFormValue(formData, "front.position2Option"),
      position2: getFormValue(formData, "front.position2"),
      address: getFormValue(formData, "front.address"),
      telephone: getFormValue(formData, "front.telephone"),
      fax: getFormValue(formData, "front.fax"),
      directTelephone: getFormValue(formData, "front.directTelephone"),
      mobile: getFormValue(formData, "front.mobile"),
      email: getFormValue(formData, "front.email"),
      website: getFormValue(formData, "front.website"),
    },
    back: {
      name: getFormValue(formData, "back.name"),
      department: getFormValue(formData, "back.department"),
      position1: getFormValue(formData, "back.position1"),
      position2: getFormValue(formData, "back.position2"),
      address1: getFormValue(formData, "back.address1"),
      address2: getFormValue(formData, "back.address2"),
      telephone: getFormValue(formData, "back.telephone"),
      fax: getFormValue(formData, "back.fax"),
      directTelephone: getFormValue(formData, "back.directTelephone"),
      mobile: getFormValue(formData, "back.mobile"),
      email: getFormValue(formData, "back.email"),
      website: getFormValue(formData, "back.website"),
    },
  };
}

export default function TemplateEditModal({
  open,
  onClose,
  onSave,
  onNext,
}: TemplateEditModalProps) {
  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNext?.(createCardData(new FormData(event.currentTarget)));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="flex h-[calc(100vh-32px)] w-full max-w-[1280px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 size={17} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">명함 템플릿 편집</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">앞면과 뒷면의 표시 정보를 입력하세요.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">명함 미리보기</h3>
                  <p className="mt-1 text-xs text-muted-foreground">실제 명함에 배치되는 모습을 확인합니다.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-xs font-medium">100%</span>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                    <Plus size={14} />
                  </button>
                  <button type="button" className="ml-1 flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground">
                    <RotateCcw size={13} /> 초기화
                  </button>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold">앞면</span>
                    <span className="text-[11px] text-muted-foreground">Korean</span>
                  </div>
                  <BusinessCardPreview />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold">뒷면</span>
                    <span className="text-[11px] text-muted-foreground">English</span>
                  </div>
                  <BusinessCardPreview english />
                </div>
              </div>
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-2">
              <FieldList
                title="앞면 정보"
                description="한글 명함에 표시할 정보를 입력합니다."
                fieldPrefix="front"
                fields={frontFields}
              />
              <FieldList
                title="뒷면 정보"
                description="영문 명함에 표시할 정보를 입력합니다."
                fieldPrefix="back"
                fields={backFields}
              />
            </div>
          </div>
        </main>

        <footer className="flex shrink-0 items-center justify-between border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            취소
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              <Save size={14} /> 임시저장
            </button>
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              다음 <ArrowRight size={14} />
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
