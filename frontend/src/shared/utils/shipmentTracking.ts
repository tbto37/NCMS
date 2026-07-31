export function getCarrierTrackingUrl(carrierCode?: string, trackingNumber?: string): string | null {
  if (!trackingNumber) return null;
  const cleanNumber = trackingNumber.replace(/[^0-9a-zA-Z]/g, "").trim();
  if (!cleanNumber) return null;

  const carrier = (carrierCode || "").trim().toLowerCase();

  if (carrier.includes("cj") || carrier.includes("대한통운")) {
    return `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${cleanNumber}`;
  }
  if (carrier.includes("우체국")) {
    return `https://epost.go.kr/trace.RetrieveDomRレースList.comm?sid1=${cleanNumber}`;
  }
  if (carrier.includes("한진")) {
    return `https://www.hanjin.co.kr/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&wblnum=${cleanNumber}`;
  }
  if (carrier.includes("롯데")) {
    return `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${cleanNumber}`;
  }
  if (carrier.includes("로젠")) {
    return `https://www.ilogen.com/web/personal/trace/${cleanNumber}`;
  }
  // 기본 폴백: 네이버 통합 택배 배송조회 검색
  return `https://search.naver.com/search.naver?query=${encodeURIComponent((carrierCode || "택배") + " " + cleanNumber)}`;
}
