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
    let deptName = "";
    if (order.cardDataJson) {
      try {
        const parsed = JSON.parse(order.cardDataJson);
        deptName = parsed?.front?.department || "";
      } catch (e) {
        console.error("Failed to parse cardDataJson for excel export", e);
      }
    }
    if (!deptName && order.site && order.site !== "고객사 미지정") {
      deptName = order.site;
    }

    const formattedDate = formatExcelDate(order.receivedAt);
    const orderNo = order.id || order.rawId || "";
    const quantity = order.quantity || 200;
    const phone = order.phone || order.recipientPhone || "";
    const name = order.name || order.recipientName || "";
    const status = order.status || "";

    rowsHtml += `                                 <tr class="list_tr_basket">
                                   <td>${escapeXml(formattedDate)}</td>
                                   <td>${escapeXml(String(orderNo))}</td>
                                   <td>${escapeXml(deptName)}</td>
                                   <td>${quantity}</td>
                                   <td>${escapeXml(phone)}</td>
                                   <td>${escapeXml(name)}</td>
                                   <td>${escapeXml(status)}</td>
                                   
                                 </tr>\n                       \n                                 \n`;
  }

  const htmlContent = `
<meta charset="utf-8" />


                      <table class="table table-bordered table-hover" id="price_list_table">
                        <thead>
                           <tr>
                              <td>접수일자</td>
                              <td>주문번호</td>
                              <td>부서/매장명</td>
                              <td>수량</td>
                              <td>전화번호</td>
                              <td>이름</td>
                              <td>주문상태</td>

							  <!--
                              <th class="total" style="vertical-align:middle;">엑션</th>
							  -->
                           </tr>
                        </thead>
                        <tbody class="price_list_tbody">
                           
${rowsHtml}
                        </tbody>
                     </table>



</body>
<!-- END BODY -->
</html>`;

  const blob = new Blob([htmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
