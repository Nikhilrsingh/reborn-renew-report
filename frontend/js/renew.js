const STORAGE_KEY = 'reborn_renew_entries';
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1UefEJKUYTkntZo4RjtyZVx2rMxok-rFkWV2UgEZi8YIcCc_-tvd5lJ6BPUiW1ALr6w/exec';
const GROUP_URL = 'https://chat.whatsapp.com/FK75LJTbMuVHjpwvbeCYvA?s=cl&p=i&mlu=4&ilr=4';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Price matrix derived directly from the Reborn plans poster
const PRICING_TABLE = {
  "Gym only": {
    "Gents": { "1 month": 1200, "3 months": 3300, "6 months": 6000, "1 year": 10800 },
    "Women & Children": { "1 month": 1000, "3 months": 2700, "6 months": 4800, "1 year": 8400 }
  },
  "Cardio + Gym": {
    "Gents": { "1 month": 1500, "3 months": 4200, "6 months": 7800, "1 year": 14400 },
    "Women & Children": { "1 month": 1300, "3 months": 3600, "6 months": 6600, "1 year": 12000 }
  }
};

// Form elements
const packageSelect = document.getElementById('package');
const categorySelect = document.getElementById('category');
const durationSelect = document.getElementById('duration');
const gapStatusSelect = document.getElementById('gapStatus');

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

// Auto-lookup package fees
function autoFillPackageFees() {
  const pkg = packageSelect.value;
  const cat = categorySelect.value;
  const dur = durationSelect.value;

  if (pkg && cat && dur && PRICING_TABLE[pkg] && PRICING_TABLE[pkg][cat]) {
    const fee = PRICING_TABLE[pkg][cat][dur] || 0;
    packageFeesInput.value = fee;
    isManualFinalAmount = false;
    recalculateFinalAmount();
  }
}

packageSelect.addEventListener('change', autoFillPackageFees);
categorySelect.addEventListener('change', autoFillPackageFees);
durationSelect.addEventListener('change', autoFillPackageFees);

function getCleanEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === '[]') return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(item => item && item.name);
  } catch (e) {
    return [];
  }
}

function updateSrNo() {
  const srInput = document.getElementById('srNo');
  if (srInput) {
    const entries = getCleanEntries();
    srInput.value = entries.length > 0 ? entries.length + 1 : 1;
  }
}

window.deleteEntry = function(index) {
  const list = getCleanEntries();
  list.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  updateSrNo();
};

updateSrNo();

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
  document.getElementById('renewForm').reset();
  splitSection.style.display = 'none';
  isManualFinalAmount = false;
  updateLiveSummary();
  updateSrNo();
});

function buildSingleEntryMessage(item) {
  let text = `🔄 *REBORN FITNESS CLUB - RENEW MEMBER ENTRY* 🔄\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `👤 *Member Name:* ${item.name.toUpperCase()}\n`;
  text += `📦 *Package:* ${item.package} (${item.category})\n`;
  text += `⏳ *Duration:* ${item.duration}\n`;
  text += `📅 *Start Date:* ${item.startDate}\n`;
  text += `⏸️ *Gap Tha Ya Nhi:* ${item.gapStatus}\n`;
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

document.getElementById('renewForm').addEventListener('submit', function (e) {
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
    action: 'saveRenewEntry',
    name: document.getElementById('name').value.trim(),
    package: packageSelect.value,
    category: categorySelect.value,
    duration: durationSelect.value,
    startDate: formatWordDate(document.getElementById('startDate').value),
    gapStatus: gapStatusSelect.value,
    packageFees: parseFloat(packageFeesInput.value) || 0,
    discount: parseFloat(discountInput.value) || 0,
    finalAmount: finalAmount,
    paymentMode: mode,
    cashAmount: cash,
    onlineAmount: online,
    timestamp: getFormattedTimestamp(),
    createdBy: document.getElementById('createdBy').value
  };

  currentList.push(singleEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));

  fetch(APPSCRIPT_URL, {
  method: 'POST',
  mode: 'no-cors',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify(singleEntry)
});

  const singleMessage = buildSingleEntryMessage(singleEntry);
  navigator.clipboard.writeText(singleMessage).catch(() => {});
  window.open(GROUP_URL, '_blank');

  this.reset();
  splitSection.style.display = 'none';
  isManualFinalAmount = false;
  updateLiveSummary();
  updateSrNo();
});