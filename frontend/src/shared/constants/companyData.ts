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
    { ko: "도로사업부", en: "Highway Eng. Business Div." },
    { ko: "지반사업부", en: "Geotechnical Eng. Business Div." },
    { ko: "철도사업부", en: "Railway Eng. Business Div." },
    { ko: "수자원사업부", en: "Water Resources Business Div." },
    { ko: "도시계획사업부", en: "Urban Planning Business Div." },
    { ko: "환경플랜트사업부", en: "Environmental Plant Div." },
    { ko: "건축사업부", en: "Architectural Business Div." },
    { ko: "감리사업부", en: "Supervision Business Div." },
    { ko: "관리본부", en: "Management Division" },
    { ko: "해외본부", en: "Overseas Business Division" },
    { ko: "안전진단사업부", en: "Inspection Div." },
    { ko: "스마트 시티 사업단", en: "Smart City Division" },
    { ko: "건설교통연구원/도로 · 교통연구팀", en: "Technical Institute of E&C" },
    { ko: "교통 · ITS사업부", en: "Traffic Eng & ITS Business Div." },
    { ko: "토목구조사업부", en: "Civil Structural Eng. Business Div." },
  ],
  positions: [
    { ko: "회장", en: "Chairman" },
    { ko: "부회장", en: "Executive Vice Chairman" },
    { ko: "사장", en: "President" },
    { ko: "부사장", en: "Executive Vice President" },
    { ko: "전무", en: "Senior Vice President" },
    { ko: "상무", en: "Managing Director" },
    { ko: "이사", en: "Director" },
    { ko: "부장", en: "General Manager" },
    { ko: "차장", en: "Deputy General Manager" },
    { ko: "과장", en: "Manager" },
    { ko: "대리", en: "Assistant Manager" },
    { ko: "주임", en: "Assistant Chief Engineer" },
    { ko: "사원", en: "Assistant Section Head." },
    { ko: "감리단장", en: "Chief Engineer" },
  ],
  qualifications: [
    { ko: "상하수도기술사", en: "Chief Engineer" },
    { ko: "도로 및 공항 기술사", en: "Professional Engineer / Highway & Airport" },
    { ko: "토목구조기술사", en: "Civil Business Div." },
    { ko: "토목시공기술사", en: "Professional Engineer" },
    { ko: "토질 및 기초기술사", en: "P.E." },
    { ko: "철도기술사", en: "P.E." },
    { ko: "폐기물처리기술사", en: "P.E." },
    { ko: "공학박사", en: "Ph.D" },
    { ko: "기술사", en: "P.E." },
  ],
};

export const HANMI_COMPANY_DATA: CompanyData = {
  departments: [
    { ko: "국내사업부", en: "Domestic Division" },
    { ko: "하이테크사업부", en: "High-Tech Division" },
    { ko: "글로벌사업부", en: "Global Division" },
    { ko: "엔지니어링실", en: "Engineering Division" },
    { ko: "개발사업부", en: "Development Division" },
    { ko: "경영지원팀", en: "Management Support Team" },
  ],
  positions: [
    { ko: "사장", en: "President" },
    { ko: "부사장", en: "Senior Vice President" },
    { ko: "전무", en: "Vice President" },
    { ko: "상무", en: "Executive Director" },
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
