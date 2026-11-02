export const GAS_CODE_TEMPLATE = `/**
 * Google Apps Script for Lomrak Community Village Dashboard
 * โครงการหมู่บ้านชุมชนล้อมรักษ์ จังหวัดศรีสะเกษ
 * 
 * วิธีการนำไปใช้งาน:
 * 1. เปิดไฟล์ Google Sheet ของคุณ หรือไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 2. วางโค้ดนี้ลงในไฟล์ Code.gs ทั้งหมดแทนที่โค้ดเดิม
 * 3. กดบันทึก (Ctrl + S)
 * 4. กดปุ่ม "Deploy" (การทำให้ใช้งานได้) > "New deployment" (การทำให้ใช้งานได้ใหม่)
 * 5. เลือกประเภท "Web app" (เว็บแอป)
 * 6. ตั้งค่า:
 *    - Execute as: "Me" (ฉัน)
 *    - Who has access: "Anyone" (ทุกคน)
 * 7. กด Deploy แล้วคัดลอก "Web app URL" มาใส่ในตัวแปร GAS_API_URL ในระบบ
 */

// ตั้งค่า URL สำหรับ Webhook (แจ้งเตือน Real-Time ทันทีที่มีการแก้ไขชีต)
// เช่น: "https://your-domain.vercel.app/api/lomrak/webhook"
var DASHBOARD_WEBHOOK_URL = "";

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createJsonResponse({
        status: "error",
        message: "No data rows found in sheet",
        data: []
      });
    }

    // อ่าน Header แถวแรก
    var headers = data[0].map(function(h) { return String(h).trim(); });
    
    // หาตำแหน่งคอลัมน์อัตโนมัติ
    var yearIdx = findColumnIndex(headers, ["ปี", "year", "Year", "พ.ศ."]);
    var districtIdx = findColumnIndex(headers, ["อำเภอ", "district", "District"]);
    var communityIdx = findColumnIndex(headers, ["หมู่บ้าน/ชุมชน", "ชุมชน", "หมู่บ้าน", "communityCount"]);
    var patientIdx = findColumnIndex(headers, ["ผู้ป่วยเข้ารับบำบัด", "ผู้ป่วย", "patientCount"]);

    var records = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var district = districtIdx !== -1 ? String(row[districtIdx]).trim() : "";
      if (!district) continue;

      records.push({
        year: yearIdx !== -1 ? Number(row[yearIdx]) || 2567 : 2567,
        district: district,
        communityCount: communityIdx !== -1 ? Number(row[communityIdx]) || 0 : 0,
        patientCount: patientIdx !== -1 ? Number(row[patientIdx]) || 0 : 0
      });
    }

    return createJsonResponse({
      status: "success",
      updatedAt: new Date().toISOString(),
      totalRecords: records.length,
      data: records
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString(),
      data: []
    });
  }
}

function findColumnIndex(headers, aliases) {
  for (var i = 0; i < headers.length; i++) {
    for (var j = 0; j < aliases.length; j++) {
      if (headers[i].toLowerCase() === aliases[j].toLowerCase()) {
        return i;
      }
    }
  }
  return -1;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ฟังก์ชันแจ้งเตือน Webhook ทันทีที่มีการแก้ไขชีต (Real-Time Push)
 * วิธีเปิดใช้งาน:
 * 1. ไปที่เมนู Triggers (รูปนาฬิกา ⏰ ด้านซ้ายของหน้าจอ Apps Script)
 * 2. กดปุ่ม "+ Add Trigger" (+ เพิ่มทริกเกอร์)
 * 3. เลือกฟังก์ชันที่จะเรียกใช้: onSheetEdit
 * 4. เลือกประเภทของเหตุการณ์: จากสเปรดชีต (From spreadsheet) > เมื่อแก้ไข (On edit)
 * 5. บันทึกและอนุญาตสิทธิ์ (Allow permissions)
 */
function onSheetEdit(e) {
  if (!DASHBOARD_WEBHOOK_URL) return;
  try {
    var payload = JSON.stringify({
      event: "edit",
      sheetName: e && e.range ? e.range.getSheet().getName() : "Lomrak",
      timestamp: new Date().toISOString()
    });
    UrlFetchApp.fetch(DASHBOARD_WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: payload,
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log("Webhook error: " + err);
  }
}
`;
