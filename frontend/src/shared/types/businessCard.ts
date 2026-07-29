export interface FrontBusinessCardData {
  name: string;
  departmentOption: string;
  department: string;
  position1Option: string;
  position1: string;
  position2Option: string;
  position2: string;
  address: string;
  telephone: string;
  fax: string;
  directTelephone: string;
  mobile: string;
  email: string;
  website: string;
}

export interface BackBusinessCardData {
  name: string;
  department: string;
  position1: string;
  position2: string;
  address1: string;
  address2: string;
  telephone: string;
  fax: string;
  directTelephone: string;
  mobile: string;
  email: string;
  website: string;
}

export interface BusinessCardInputData {
  front: FrontBusinessCardData;
  back: BackBusinessCardData;
}

export interface SelectedTemplateData {
  id: number | string;
  name: string;
  previewFrontUrl: string | null;
  previewBackUrl: string | null;
}

export interface BusinessCardOrderDraft extends BusinessCardInputData {
  template: SelectedTemplateData;
}

export interface OrderFormLocationState {
  orderDraft: BusinessCardOrderDraft;
}
