const STORAGE_KEY = 'reborn_new_member_entries';
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVgQnDBdYBN4HktX2bAOpNJ53YJSncJc68N7kYssgYa49RLdSy65PdcUTBya8jsPKKEA/exec';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Form elements
const packageFeesInput = document.getElementById('packageFees');
const discountInput = document.getElementById('discount');
const finalAmountInput = document.getElementById('finalAmount');
const paymentModeSelect = document.getElementById('paymentMode');
const splitSection = document.getElementById('splitSection');
const cashAmountInput = document.getElementById('cashAmount');
const onlineAmountInput = document.getElementById('onlineAmount');

// Live preview indicators
const sumPackageFees = document.getElementById('sumPackageFees');
const sumDiscount = document.getElementById('sumDiscount');
const sumFinalAmount = document.getElementById('sumFinalAmount');
const sumCash = document.getElementById('sumCash');
const sumOnline = document.getElementById('sumOnline');

let isManualFinalAmount = false;

// Strict Sequential Sr No Calculation
function getCleanEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === '[]') return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(item => item && item.name); // Filter empty records
  } catch (e) {
    return [];
  }
}

// Date & Time Helpers
function formatWordDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  const month = monthNames[parseInt(parts[1], 10) - 1];
  return `${String(parseInt(parts[2], 10)).padStart(2, '0')} ${month} ${parts[0]}`;
}

function getFormattedTimestamp() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

// Two-way Auto Calculation
function recalculateFinalAmount() {
  const fees = parseFloat(packageFeesInput.value) || 0;
  const disc = parseFloat(discountInput.value) || 0;

  if (!isManualFinalAmount) {
    finalAmountInput.value = Math.max(0, fees - disc);
  }
  recalculateSplitPayment();
  updateLiveSummary();
}

packageFeesInput.addEventListener('input', () => {
  isManualFinalAmount = false;
  recalculateFinalAmount();
});

discountInput.addEventListener('input', () => {
  isManualFinalAmount = false;
  recalculateFinalAmount();
});

finalAmountInput.addEventListener('input', () => {
  isManualFinalAmount = true;
  recalculateSplitPayment();
  updateLiveSummary();
});

function recalculateSplitPayment() {
  const mode = paymentModeSelect.value;
  const finalAmt = parseFloat(finalAmountInput.value) || 0;

  if (mode === 'Cash') {
    splitSection.style.display = 'none';
    cashAmountInput.value = finalAmt;
    onlineAmountInput.value = 0;
  } else if (mode === 'Online') {
    splitSection.style.display = 'none';
    cashAmountInput.value = 0;
    onlineAmountInput.value = finalAmt;
  } else if (mode === 'Cash + Online') {
    splitSection.style.display = 'block';
    const currentCash = parseFloat(cashAmountInput.value) || 0;
    onlineAmountInput.value = Math.max(0, finalAmt - currentCash);
  } else {
    splitSection.style.display = 'none';
  }
  updateLiveSummary();
}

paymentModeSelect.addEventListener('change', recalculateSplitPayment);

cashAmountInput.addEventListener('input', () => {
  const finalAmt = parseFloat(finalAmountInput.value) || 0;
  const cash = parseFloat(cashAmountInput.value) || 0;
  onlineAmountInput.value = Math.max(0, finalAmt - cash);
  updateLiveSummary();
});

onlineAmountInput.addEventListener('input', updateLiveSummary);

function updateLiveSummary() {
  sumPackageFees.textContent = `₹${parseFloat(packageFeesInput.value) || 0}`;
  sumDiscount.textContent = `₹${parseFloat(discountInput.value) || 0}`;
  sumFinalAmount.textContent = `₹${parseFloat(finalAmountInput.value) || 0}`;
  sumCash.textContent = `₹${parseFloat(cashAmountInput.value) || 0}`;
  sumOnline.textContent = `₹${parseFloat(onlineAmountInput.value) || 0}`;
}

document.getElementById('resetBtn')?.addEventListener('click', () => {
  document.getElementById('newMemberForm').reset();
  splitSection.style.display = 'none';
  isManualFinalAmount = false;
  updateLiveSummary();
});

// Single Entry WhatsApp Formatter
function buildSingleEntryMessage(item) {
  let text = `✨ *REBORN FITNESS CLUB - NEW ADMISSION ENTRY* ✨\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `👤 *Member Name:* ${item.name.toUpperCase()}\n`;
  text += `📦 *Package:* ${item.package} (${item.category})\n`;
  text += `⏳ *Duration:* ${item.duration}\n`;
  text += `📅 *Start Date:* ${item.startDate}\n`;
  text += `🏷️ *Package Fees:* ₹${item.packageFees}\n`;
  text += `🎁 *Discount:* ₹${item.discount}\n`;
  text += `💳 *Final Paid:* *₹${item.finalAmount}* (${item.paymentMode})\n`;
  if (item.paymentMode === 'Cash + Online') {
    text += `   ├ 💵 Cash: ₹${item.cashAmount}\n`;
    text += `   └ 📱 Online: ₹${item.onlineAmount}\n`;
  }
  text += `✍️ *Entry Done By:* ${item.createdBy}\n`;
  text += `🕒 *Timestamp:* ${item.timestamp}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Reborn Operations Hub_`;
  return text;
}

// Form Submission: Save + Pre-filled WhatsApp Trigger
document.getElementById('newMemberForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const currentList = getCleanEntries();

  const mode = paymentModeSelect.value;
  const finalAmount = parseFloat(finalAmountInput.value) || 0;
  let cash = 0;
  let online = 0;

  if (mode === 'Cash') {
    cash = finalAmount;
  } else if (mode === 'Online') {
    online = finalAmount;
  } else if (mode === 'Cash + Online') {
    cash = parseFloat(cashAmountInput.value) || 0;
    online = parseFloat(onlineAmountInput.value) || 0;
  }

  const singleEntry = {
    action: 'saveNewMemberEntry',
    name: document.getElementById('name').value.trim(),
    package: document.getElementById('package').value,
    category: document.getElementById('category').value,
    duration: document.getElementById('duration').value,
    startDate: formatWordDate(document.getElementById('startDate').value),
    packageFees: parseFloat(packageFeesInput.value) || 0,
    discount: parseFloat(discountInput.value) || 0,
    finalAmount: finalAmount,
    paymentMode: mode,
    cashAmount: cash,
    onlineAmount: online,
    timestamp: getFormattedTimestamp(),
    createdBy: document.getElementById('createdBy').value
  };

  // 1. Save locally with strict sequence
  currentList.push(singleEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));

  // 2. Dispatch to Google Sheet in the background
  fetch(APPSCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(singleEntry)
  }).catch(err => console.error(err));

  // 3. Format message
  const singleMessage = buildSingleEntryMessage(singleEntry);

  // 4. Open WhatsApp with message pre-filled in the text box
  const prefilledUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(singleMessage)}`;
  window.open(prefilledUrl, '_blank');

  // 5. Reset UI & update Sr No for next entry
  this.reset();
  splitSection.style.display = 'none';
  isManualFinalAmount = false;
  updateLiveSummary();
});