/**
 * Reborn Fitness Club - Backend & Sheet Stylizer
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var sheetName = (data.action === 'saveNewMemberEntry') ? 'NewMembers' : 'RenewMembers';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // 14 Columns Order (Sr No excluded)
    var headers = [
      'Member Name',
      'Package',
      'Category',
      'Duration',
      'Start Date',
      'Gap Tha Ya Nhi',
      'Package Fees',
      'Discount',
      'Final Paid',
      'Payment Mode',
      'Cash (₹)',
      'Online (₹)',
      'Timestamp',
      'Entry Done By'
    ];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      applySheetStyles(sheet);
    }

    var rowData = [
      data.name || '',
      data.package || '',
      data.category || '',
      data.duration || '',
      data.startDate || '',
      data.gapStatus || '',
      data.packageFees || 0,
      data.discount || 0,
      data.finalAmount || 0,
      data.paymentMode || '',
      data.cashAmount || 0,
      data.onlineAmount || 0,
      data.timestamp || '',
      data.createdBy || ''
    ];

    sheet.appendRow(rowData);

    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, headers.length);
    rowRange.setFontFamily("Inter").setFontSize(10).setVerticalAlignment("middle");

    // Alignments
    sheet.getRange(lastRow, 1).setHorizontalAlignment("left"); // Member Name
    sheet.getRange(lastRow, 2, 1, 5).setHorizontalAlignment("center"); // Package, Category, Duration, Start Date, Gap
    sheet.getRange(lastRow, 7, 1, 3).setNumberFormat("₹#,##0").setHorizontalAlignment("right"); // Fees, Disc, Final
    sheet.getRange(lastRow, 10).setHorizontalAlignment("center"); // Payment Mode
    sheet.getRange(lastRow, 11, 1, 2).setNumberFormat("₹#,##0").setHorizontalAlignment("right"); // Cash, Online
    sheet.getRange(lastRow, 13, 1, 2).setHorizontalAlignment("center"); // Timestamp, Done By

    // Zebra striping
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#fdf2f2");
    } else {
      rowRange.setBackground("#ffffff");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function applySheetStyles(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, 14);
  headerRange
    .setBackground("#d90429")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10)
    .setFontFamily("Inter")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 100, 14).setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.autoResizeColumns(1, 14);
}

function doGet(e) {
  return ContentService.createTextOutput("Reborn Operations API is live.");
}