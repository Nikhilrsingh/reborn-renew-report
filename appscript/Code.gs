const SHEET_NAME = "Sheet1";

const HEADERS = [
  "Sr No",
  "Member Name",
  "Package",
  "Category",
  "Duration",
  "Start Date",
  "Package Fees",
  "Discount",
  "Final Paid",
  "Payment Mode",
  "Entry Time"
];

// ===============================
// Setup Sheet
// ===============================
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  const header = sheet.getRange(1, 1, 1, HEADERS.length);
  header
    .setFontWeight("bold")
    .setBackground("#E50914")
    .setFontColor("#FFFFFF")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.setFrozenRows(1);

  const existingFilter = sheet.getFilter();
  if (existingFilter) {
    existingFilter.remove();
  }
  sheet.getDataRange().createFilter();

  sheet.getRange(2, 7, Math.max(sheet.getMaxRows(), 2), 3).setNumberFormat("₹#,##0");
  sheet.getRange(2, 6, Math.max(sheet.getMaxRows(), 2), 1).setNumberFormat("dd-MMM-yyyy");

  sheet.autoResizeColumns(1, HEADERS.length);
  SpreadsheetApp.flush();
}

// ===============================
// Save Member
// ===============================
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      setupSheet();
    }

    const data = JSON.parse(e.postData.contents);
    const sr = Math.max(1, sheet.getLastRow());

    sheet.appendRow([
      sr,
      data.memberName || "",
      data.packageType || "",
      data.category || "",
      data.duration || "",
      data.startDate || "",
      Number(data.fees) || 0,
      Number(data.discount) || 0,
      Number(data.finalPaid) || 0,
      data.paymentMode || "",
      Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd-MMM-yyyy HH:mm:ss")
    ]);

    const row = sheet.getLastRow();
    sheet.getRange(row, 1, 1, 11)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    if (row % 2 === 0) {
      sheet.getRange(row, 1, 1, 11).setBackground("#FFF5F5");
    } else {
      sheet.getRange(row, 1, 1, 11).setBackground("#FFFFFF");
    }

    sheet.getRange(row, 7, 1, 3).setNumberFormat("₹#,##0");
    sheet.getRange(row, 6).setNumberFormat("dd-MMM-yyyy");

    sheet.autoResizeColumns(1, 11);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Added successfully" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===============================
function doGet() {
  return ContentService.createTextOutput("Reborn Fitness Running");
}