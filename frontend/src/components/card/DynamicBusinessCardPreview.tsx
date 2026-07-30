import React from "react";
import type { BusinessCardInputData } from "@/shared/types/businessCard";
import SvgBusinessCardPreview from "./SvgBusinessCardPreview";

interface DynamicBusinessCardPreviewProps {
  templateId?: number | string;
  cardData: BusinessCardInputData;
  isBack?: boolean;
  scale?: number;
}

export default function DynamicBusinessCardPreview(props: DynamicBusinessCardPreviewProps) {
  return <SvgBusinessCardPreview {...props} />;
}
