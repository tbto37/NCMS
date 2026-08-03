export interface OptionItem {
  ko: string;
  en: string;
}

export interface CompanyData {
  departments: OptionItem[];
  positions: OptionItem[];
  qualifications?: OptionItem[];
}

export const CHEIL_COMPANY_DATA: CompanyData = {
  departments: [
    { ko: "상하수도사업부", en: "Water Supply & Sewerage Business Div." },
    { ko: "관리본부", en: "Management Division" },
    { ko: "건설교통연구원/도로·교통연구팀", en: "Technical Institute of E&C" },
    { ko: "해외본부", en: "Overseas Business Division" },
    { ko: "안전진단사업부", en: "Inspection Div." },
    { ko: "스마트 시티 사업단", en: "Smart City Division" },
    { ko: "도로사업부", en: "Highway Eng. Business Div." },
    { ko: "지반사업부", en: "Geotechnical Eng. Business Div." },
    { ko: "철도사업부", en: "Railroad Business Div." },
    { ko: "환경플랜트사업부", en: "Environmental Plant Div." },
    { ko: "철도사업부(지반팀)", en: "Railroad Business Div." },
    { ko: "교통·ITS사업부", en: "Traffic Eng · ITS Business Div." },
    { ko: "토목구조사업부", en: "Civil Structural Eng. Business Div." },
    { ko: "경영기획본부", en: "Management planning Headquarter" },
  ],
  positions: [
    { ko: "부장", en: "General Manager" },
    { ko: "부사장", en: "Executive Vice President" },
    { ko: "감리단장", en: "Chief Engineer" },
    { ko: "상무", en: "Managing Director" },
    { ko: "사원", en: "Assistant Section Head." },
    { ko: "이사", en: "Director" },
    { ko: "부회장", en: "Executive Vice Chairman" },
    { ko: "주임", en: "Assistant Manager" },
    { ko: "차장", en: "Deputy General Manager" },
    { ko: "전무", en: "Executive Director" },
  ],
  qualifications: [
    { ko: "상하수도기술사", en: "Chief Engineer" },
    { ko: "토목구조기술사", en: "Civil Business Div." },
    { ko: "기술사", en: "Professional Engineer" },
    { ko: "토목시공기술사", en: "Professional Engineer Civil Engineering" },
    { ko: "공학박사", en: "Ph.D" },
    { ko: "토질 및 기초기술사", en: "P.E." },
    { ko: "폐기물처리기술사", en: "P.E." },
    { ko: "교통공학박사/교통기술사", en: "Ph.D. P.E." },
    { ko: "교통기술사", en: "P.E." },
    { ko: "공항 및 공항기술사", en: "P.E." },
    { ko: "책임기술사/기술사", en: "P.E." },
    { ko: "철도기술사", en: "Engineer Railway" },
    { ko: "도로 및 공항 기술사", en: "Professional Engineer / Highway & Airport" },
  ],
};

export const HANMI_COMPANY_DATA: CompanyData = {
  departments: [
    { ko: "국내사업부", en: "Domestic Division" },
    { ko: "하이테크사업부", en: "High-Tech Division" },
    { ko: "글로벌사업부", en: "Global Division" },
    { ko: "엔지니어링실", en: "Engineering Division" },
  ],
  positions: [
    { ko: "사장", en: "President" },
    { ko: "부사장", en: "Senior Vice President" },
    { ko: "전무", en: "Vice President" },
    { ko: "이사", en: "Director" },
    { ko: "시니어 매니저", en: "Senior Manager" },
    { ko: "매니저", en: "Manager" },
    { ko: "프로", en: "Professional" },
    { ko: "국내사업부장", en: "Head of Domestic Division" },
    { ko: "하이테크사업부장", en: "Head of High-Tech Division" },
    { ko: "개발사업부장", en: "Head of Development Division" },
    { ko: "글로벌사업부장", en: "Head of Global Division" },
    { ko: "기술총괄", en: "Head of Engineering Division" },
    { ko: "엔지니어링실장", en: "Division Leader" },
    { ko: "실장", en: "Team Leader" },
    { ko: "팀장", en: "Team Leader" },
    { ko: "단장", en: "Project Manager" },
  ],
};
