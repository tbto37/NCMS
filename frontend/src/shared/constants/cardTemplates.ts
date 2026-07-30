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
      logoSpec: { x: 30, y: 36, width: 165, height: 52 },
      showSlogan: true,
      sloganText: "“Smiling Technology”",
      showCenterLine: false,
      showBottomBar: true,
      fields: {
        name: {
          x: 270,
          y: 38,
          fontSize: 24,
          fontWeight: "700",
          fill: "#0f172a",
          letterSpacing: "0.35em",
        },
        departmentPosition: {
          x: 270,
          y: 74,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        position2: {
          x: 270,
          y: 93,
          fontSize: 11,
          fontWeight: "400",
          fill: "#475569",
        },
        companyName: {
          x: 270,
          y: 130,
          fontSize: 13.5,
          fontWeight: "700",
          fill: "#0f172a",
        },
        address: {
          x: 270,
          y: 150,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#334155",
        },
        telAndFax: {
          x: 270,
          y: 169,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        directTelephone: {
          x: 270,
          y: 188,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        mobile: {
          x: 270,
          y: 207,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        email: {
          x: 270,
          y: 226,
          fontSize: 11.5,
          fontWeight: "400",
          fill: "#1e293b",
        },
        website: {
          x: 270,
          y: 245,
          fontSize: 12,
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
      logoSpec: { x: 30, y: 36, width: 165, height: 52 },
      showSlogan: true,
      sloganText: "“Smiling Technology”",
      showCenterLine: false,
      showBottomBar: true,
      fields: {
        name: {
          x: 270,
          y: 38,
          fontSize: 24,
          fontWeight: "700",
          fill: "#0f172a",
        },
        department: {
          x: 270,
          y: 71,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        position1: {
          x: 270,
          y: 89,
          fontSize: 11,
          fontWeight: "400",
          fill: "#475569",
        },
        companyName: {
          x: 270,
          y: 130,
          fontSize: 13,
          fontWeight: "700",
          fill: "#0f172a",
        },
        address1: {
          x: 270,
          y: 149,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#334155",
        },
        address2: {
          x: 270,
          y: 165,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#334155",
        },
        telAndFax: {
          x: 270,
          y: 184,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#1e293b",
        },
        directTelephone: {
          x: 270,
          y: 203,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#1e293b",
        },
        mobile: {
          x: 270,
          y: 221,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#1e293b",
        },
        email: {
          x: 270,
          y: 239,
          fontSize: 11.2,
          fontWeight: "400",
          fill: "#1e293b",
        },
        website: {
          x: 270,
          y: 257,
          fontSize: 12,
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
          fontSize: 25,
          fontWeight: "700",
          fill: "#0f172a",
          letterSpacing: "0.25em",
        },
        departmentPosition: {
          x: 285,
          y: 80,
          fontSize: 13,
          fontWeight: "500",
          fill: "#1e293b",
        },
        companyName: {
          x: 285,
          y: 138,
          fontSize: 14.5,
          fontWeight: "700",
          fill: "#0f172a",
        },
        telephone: {
          x: 285,
          y: 162,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        mobile: {
          x: 285,
          y: 183,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        email: {
          x: 285,
          y: 204,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        address1: {
          x: 285,
          y: 228,
          fontSize: 12,
          fontWeight: "400",
          fill: "#334155",
        },
        address2: {
          x: 285,
          y: 246,
          fontSize: 12,
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
          fontSize: 25,
          fontWeight: "700",
          fill: "#0f172a",
        },
        position1: {
          x: 285,
          y: 77,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        department: {
          x: 285,
          y: 94,
          fontSize: 12.5,
          fontWeight: "500",
          fill: "#1e293b",
        },
        companyName: {
          x: 285,
          y: 138,
          fontSize: 14.5,
          fontWeight: "700",
          fill: "#0f172a",
        },
        website: {
          x: 285,
          y: 160,
          fontSize: 13,
          fontWeight: "600",
          fill: "#004B96",
        },
        address1: {
          x: 285,
          y: 183,
          fontSize: 12,
          fontWeight: "400",
          fill: "#334155",
        },
        address2: {
          x: 285,
          y: 201,
          fontSize: 12,
          fontWeight: "400",
          fill: "#334155",
        },
        address3: {
          x: 285,
          y: 219,
          fontSize: 12,
          fontWeight: "400",
          fill: "#334155",
        },
      },
    },
  },
};
