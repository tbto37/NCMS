export interface FieldSpec {
  x: number;
  y: number;
  fontSize: number;
  fontWeight?: string;
  fill?: string;
  letterSpacing?: string;
  lineHeight?: number;
  align?: "left" | "middle" | "right";
  fontFamily?: string;
}

export interface LogoSpec {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CardTemplateConfig {
  viewBox: string;
  width: number;
  height: number;
  logoUrl?: string;
  logoSpec?: LogoSpec;
  showSlogan?: boolean;
  sloganText?: string;
  showCenterLine?: boolean;
  showBottomBar?: boolean;
  fields: {
    name?: FieldSpec;
    departmentPosition?: FieldSpec;
    department?: FieldSpec;
    position1?: FieldSpec;
    position2?: FieldSpec;
    companyName?: FieldSpec;
    telephone?: FieldSpec;
    telAndFax?: FieldSpec;
    fax?: FieldSpec;
    directTelephone?: FieldSpec;
    mobile?: FieldSpec;
    email?: FieldSpec;
    website?: FieldSpec;
    address?: FieldSpec;
    address1?: FieldSpec;
    address2?: FieldSpec;
    address3?: FieldSpec;
  };
}

// 명함 표준 겉 규격: 90mm x 50mm (비율 90 : 50 = 1.8 : 1 = 519 : 288.333)
export const CARD_TEMPLATE_SPECS: Record<string, { front: CardTemplateConfig; back: CardTemplateConfig }> = {
  cheil: {
    front: {
      viewBox: "0 0 519 288.333",
      width: 519,
      height: 288.333,
      logoUrl: "/logos/cheil_logo.png",
      logoSpec: { x: 32, y: 36, width: 155, height: 48 },
      showSlogan: true,
      sloganText: '"Smiling Technology"',
      showCenterLine: false,
      showBottomBar: true,
      fields: {
        name: {
          x: 220,
          y: 30,
          fontSize: 22,
          fontWeight: "700",
          fill: "#0f172a",
          letterSpacing: "0.35em",
        },
        departmentPosition: {
          x: 220,
          y: 62,
          fontSize: 11.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        position2: {
          x: 220,
          y: 78,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#475569",
        },
        companyName: {
          x: 220,
          y: 118,
          fontSize: 14,
          fontWeight: "700",
          fill: "#0f172a",
          fontFamily: "'HY울릉도M', HYUlsungdoM, 'HYPMokGak-Medium', serif",
        },
        address: {
          x: 220,
          y: 138,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#334155",
        },
        telAndFax: {
          x: 220,
          y: 156,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        directTelephone: {
          x: 220,
          y: 174,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        mobile: {
          x: 220,
          y: 192,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        email: {
          x: 220,
          y: 210,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        website: {
          x: 220,
          y: 232,
          fontSize: 13.5,
          fontWeight: "700",
          fill: "#0f172a",
        },
      },
    },
    back: {
      viewBox: "0 0 519 288.333",
      width: 519,
      height: 288.333,
      logoUrl: "/logos/cheil_logo.png",
      logoSpec: { x: 32, y: 36, width: 155, height: 48 },
      showSlogan: true,
      sloganText: '"Smiling Technology"',
      showCenterLine: false,
      showBottomBar: true,
      fields: {
        name: {
          x: 220,
          y: 30,
          fontSize: 21,
          fontWeight: "700",
          fill: "#0f172a",
        },
        position1: {
          x: 220,
          y: 60,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        department: {
          x: 220,
          y: 76,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        companyName: {
          x: 220,
          y: 118,
          fontSize: 13.5,
          fontWeight: "700",
          fill: "#0f172a",
          fontFamily: "'HY울릉도M', HYUlsungdoM, 'HYPMokGak-Medium', serif",
        },
        address1: {
          x: 220,
          y: 138,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#334155",
        },
        address2: {
          x: 220,
          y: 155,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#334155",
        },
        telAndFax: {
          x: 220,
          y: 173,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        directTelephone: {
          x: 220,
          y: 191,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        mobile: {
          x: 220,
          y: 209,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        email: {
          x: 220,
          y: 227,
          fontSize: 12.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        website: {
          x: 220,
          y: 247,
          fontSize: 13.5,
          fontWeight: "700",
          fill: "#0f172a",
        },
      },
    },
  },
  hanmi: {
    front: {
      viewBox: "0 0 519 288.333",
      width: 519,
      height: 288.333,
      logoUrl: "/logos/hanmi_front_logo.png",
      logoSpec: { x: 25, y: 69, width: 165, height: 56 },
      showSlogan: false,
      showCenterLine: false,
      showBottomBar: false,
      fields: {
        name: {
          x: 285,
          y: 44,
          fontSize: 24,
          fontWeight: "700",
          fill: "#0f172a",
          letterSpacing: "0.25em",
        },
        departmentPosition: {
          x: 285,
          y: 78,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        companyName: {
          x: 285,
          y: 136,
          fontSize: 14,
          fontWeight: "700",
          fill: "#0f172a",
        },
        telephone: {
          x: 285,
          y: 158,
          fontSize: 12,
          fontWeight: "500",
          fill: "#1e293b",
        },
        mobile: {
          x: 285,
          y: 177,
          fontSize: 12,
          fontWeight: "500",
          fill: "#1e293b",
        },
        email: {
          x: 285,
          y: 196,
          fontSize: 12,
          fontWeight: "500",
          fill: "#1e293b",
        },
        address1: {
          x: 285,
          y: 218,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#334155",
        },
        address2: {
          x: 285,
          y: 234,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#334155",
        },
      },
    },
    back: {
      viewBox: "0 0 519 288.333",
      width: 519,
      height: 288.333,
      logoUrl: "/logos/hanmi_back_logo.png",
      logoSpec: { x: 18, y: 74, width: 215, height: 52 },
      showSlogan: false,
      showCenterLine: false,
      showBottomBar: false,
      fields: {
        name: {
          x: 285,
          y: 44,
          fontSize: 23,
          fontWeight: "700",
          fill: "#0f172a",
        },
        position1: {
          x: 285,
          y: 76,
          fontSize: 12,
          fontWeight: "400",
          fill: "#1e293b",
        },
        department: {
          x: 285,
          y: 92,
          fontSize: 12,
          fontWeight: "400",
          fill: "#1e293b",
        },
        companyName: {
          x: 285,
          y: 168,
          fontSize: 14,
          fontWeight: "700",
          fill: "#0f172a",
        },
        website: {
          x: 285,
          y: 186,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#004B96",
        },
        address1: {
          x: 285,
          y: 206,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#334155",
        },
        address2: {
          x: 285,
          y: 222,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#334155",
        },
        address3: {
          x: 285,
          y: 238,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#334155",
        },
      },
    },
  },
};
