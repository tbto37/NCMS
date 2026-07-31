import type { MappedOrder as Order } from "@/shared/constants/orders";

export function formatExcelDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dayOfWeek = days[d.getDay()];
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}(${dayOfWeek}) ${hh}:${min}`;
  } catch {
    return dateStr ?? "";
  }
}

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function exportOrdersExcel(
  ordersToExport: Order[],
  siteCodeName?: string,
) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const prefix = (siteCodeName || "order").toLowerCase();
  const fileName = `${prefix}_order_list_${dateStr}.xls`;

  let rowsHtml = "";
  for (const order of ordersToExport) {
    const name = order.recipientName || order.name || "";
    const phone = order.recipientPhone || order.phone || "";
    const fullAddress = [order.address, order.addressDetail]
      .filter(Boolean)
      .join(" ");
    const memo = order.memo || "";

    const dataTdStyle =
      "font-family: '맑은 고딕', 'Malgun Gothic', sans-serif; font-size: 11pt; font-weight: normal; color: #000000; text-align: left; vertical-align: middle; padding: 6px 10px;";
    const emptyTdStyle =
      "font-family: '맑은 고딕', 'Malgun Gothic', sans-serif; font-size: 11pt; vertical-align: middle;";

    rowsHtml += `    <tr>
      <td style="${dataTdStyle}">${escapeXml(name)}</td>
      <td style="${dataTdStyle}">${escapeXml(phone)}</td>
      <td style="${dataTdStyle}">${escapeXml(fullAddress)}</td>
      <td style="${emptyTdStyle}"></td>
      <td style="${emptyTdStyle}"></td>
      <td style="${emptyTdStyle}"></td>
      <td style="${emptyTdStyle}"></td>
      <td style="${dataTdStyle}">${escapeXml(memo)}</td>
      <td style="${emptyTdStyle}"></td>
    </tr>\n`;
  }

  const thStyle =
    "background-color: #F0F0F0; font-family: '굴림', Gulim, sans-serif; font-size: 9pt; font-weight: bold; color: #000000; text-align: center; vertical-align: middle; border: 1px solid #000000; padding: 6px 10px;";

  const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Sheet1</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th {
    background-color: #F0F0F0;
    font-family: '굴림', Gulim, sans-serif;
    font-size: 9pt;
    font-weight: bold;
    color: #000000;
    text-align: center;
    vertical-align: middle;
    border: 1px solid #000000;
  }
  td {
    font-family: '맑은 고딕', 'Malgun Gothic', sans-serif;
    font-size: 11pt;
    color: #000000;
    vertical-align: middle;
  }
</style>
</head>
<body>
<table border="0" cellpadding="0" cellspacing="0">
  <colgroup>
    <col width="180" style="width: 180px;" />
    <col width="130" style="width: 130px;" />
    <col width="450" style="width: 450px;" />
    <col width="90" style="width: 90px;" />
    <col width="90" style="width: 90px;" />
    <col width="90" style="width: 90px;" />
    <col width="90" style="width: 90px;" />
    <col width="140" style="width: 140px;" />
    <col width="90" style="width: 90px;" />
  </colgroup>
  <thead>
     <tr>
        <th style="${thStyle}">받는분성명</th>
        <th style="${thStyle}">받는분전화번호</th>
        <th style="${thStyle}">받는분주소(전체, 분할)</th>
        <th style="${thStyle}">품목명</th>
        <th style="${thStyle}">품목명</th>
        <th style="${thStyle}">품목명</th>
        <th style="${thStyle}">품목명</th>
        <th style="${thStyle}">배송메세지1</th>
        <th style="${thStyle}">박스타입</th>
     </tr>
  </thead>
  <tbody>
${rowsHtml}
  </tbody>
</table>
</body>
</html>
`;

  const blob = new Blob([htmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
