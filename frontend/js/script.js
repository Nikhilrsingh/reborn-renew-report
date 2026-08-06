const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOLBGMHtjoiUjWwKlZk_vrlSIursPZ5vSlqrVAvAF6GFADc0O65hXUy01agXlPusW0/exec';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('renewal-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnTextContent = submitBtn.querySelector('.btn-text-content');
  const spinner = submitBtn.querySelector('.spinner');
  const btnResetAuto = document.getElementById('btn-reset-auto');

  // Input Fields
  const memberName = document.getElementById('memberName');
  const packageSelect = document.getElementById('package');
  const categorySelect = document.getElementById('category');
  const durationSelect = document.getElementById('duration');
  const startDate = document.getElementById('startDate');
  const packageFees = document.getElementById('packageFees');
  const discount = document.getElementById('discount');
  const finalPaid = document.getElementById('finalPaid');
  const paymentMode = document.getElementById('paymentMode');

  // Conditional Payment Fields
  const cashAmountGroup = document.getElementById('cash-amount-group');
  const onlineAmountGroup = document.getElementById('online-amount-group');
  const cashAmount = document.getElementById('cashAmount');
  const onlineAmount = document.getElementById('onlineAmount');

  // Summary Elements
  const sumMemberName = document.getElementById('sum-member-name');
  const sumPackage = document.getElementById('sum-package');
  const sumCategory = document.getElementById('sum-category');
  const sumDuration = document.getElementById('sum-duration');
  const sumStartDate = document.getElementById('sum-start-date');
  const sumFees = document.getElementById('sum-fees');
  const sumDiscount = document.getElementById('sum-discount');
  const sumFinalPaid = document.getElementById('sum-final-paid');
  const sumPaymentSummary = document.getElementById('sum-payment-summary');

  let isManualFinalPaid = false;

  // Set Auto Today for Start Date
  const today = new Date().toISOString().split('T')[0];
  if (startDate) startDate.value = today;

  // Initialize UI
  updatePaymentModeUI();
  calculateFinalPaid();
  updateLiveSummary();

  // Toast Notifications
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-weight: bold; margin-right: 6px;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Calculate Final Paid
  function calculateFinalPaid() {
    if (isManualFinalPaid) return;
    const fees = parseFloat(packageFees.value) || 0;
    const disc = parseFloat(discount.value) || 0;
    const calculated = Math.max(0, fees - disc);
    finalPaid.value = calculated;
    syncPaymentSplitAmounts(calculated);
  }

  finalPaid.addEventListener('input', () => {
    isManualFinalPaid = true;
    syncPaymentSplitAmounts(parseFloat(finalPaid.value) || 0);
    updateLiveSummary();
  });

  if (btnResetAuto) {
    btnResetAuto.addEventListener('click', () => {
      isManualFinalPaid = false;
      calculateFinalPaid();
      updateLiveSummary();
      showToast('Final Paid reset to auto-calculated value', 'info');
    });
  }

  function syncPaymentSplitAmounts(totalAmount) {
    const mode = paymentMode.value;
    if (mode === 'Cash') {
      cashAmount.value = totalAmount;
      onlineAmount.value = 0;
    } else if (mode === 'Online') {
      onlineAmount.value = totalAmount;
      cashAmount.value = 0;
    }
  }

  function updatePaymentModeUI() {
    const mode = paymentMode.value;
    const currentFinal = parseFloat(finalPaid.value) || 0;

    if (mode === 'Cash') {
      cashAmountGroup.classList.remove('hidden');
      onlineAmountGroup.classList.add('hidden');
      cashAmount.value = currentFinal;
      onlineAmount.value = 0;
    } else if (mode === 'Online') {
      cashAmountGroup.classList.add('hidden');
      onlineAmountGroup.classList.remove('hidden');
      onlineAmount.value = currentFinal;
      cashAmount.value = 0;
    } else if (mode === 'Cash + Online') {
      cashAmountGroup.classList.remove('hidden');
      onlineAmountGroup.classList.remove('hidden');
    }
  }

  packageFees.addEventListener('input', () => { calculateFinalPaid(); updateLiveSummary(); });
  discount.addEventListener('input', () => { calculateFinalPaid(); updateLiveSummary(); });
  paymentMode.addEventListener('change', () => { updatePaymentModeUI(); updateLiveSummary(); });
  cashAmount.addEventListener('input', updateLiveSummary);
  onlineAmount.addEventListener('input', updateLiveSummary);

  [memberName, packageSelect, categorySelect, durationSelect, startDate].forEach(input => {
    if (input) {
      input.addEventListener('input', updateLiveSummary);
      input.addEventListener('change', updateLiveSummary);
    }
  });

  function getPaymentSummaryText() {
    const mode = paymentMode.value;
    const cashVal = parseFloat(cashAmount.value) || 0;
    const onlineVal = parseFloat(onlineAmount.value) || 0;

    if (mode === 'Cash') return `₹${cashVal} Cash`;
    if (mode === 'Online') return `₹${onlineVal} Online`;
    if (mode === 'Cash + Online') return `₹${onlineVal} Online + ₹${cashVal} Cash`;
    return '—';
  }

  function updateLiveSummary() {
    if (sumMemberName) sumMemberName.textContent = memberName.value.trim() || '—';
    if (sumPackage) sumPackage.textContent = packageSelect.value || '—';
    if (sumCategory) sumCategory.textContent = categorySelect.value || '—';
    if (sumDuration) sumDuration.textContent = durationSelect.value || '—';
    if (sumStartDate) {
      if (startDate.value) {
        const parts = startDate.value.split('-');
        sumStartDate.textContent = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : startDate.value;
      } else {
        sumStartDate.textContent = '—';
      }
    }
    if (sumFees) sumFees.textContent = `₹${parseFloat(packageFees.value) || 0}`;
    if (sumDiscount) sumDiscount.textContent = `₹${parseFloat(discount.value) || 0}`;
    if (sumFinalPaid) sumFinalPaid.textContent = `₹${parseFloat(finalPaid.value) || 0}`;
    if (sumPaymentSummary) sumPaymentSummary.textContent = getPaymentSummaryText();
  }

  function clearErrors() {
    form.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
  }

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    let hasError = false;
    const fieldsToValidate = [
      { el: memberName },
      { el: packageSelect },
      { el: categorySelect },
      { el: durationSelect },
      { el: startDate },
      { el: packageFees },
      { el: finalPaid }
    ];

    fieldsToValidate.forEach(field => {
      if (!field.el.value.toString().trim()) {
        field.el.classList.add('error-field');
        hasError = true;
      }
    });

    const mode = paymentMode.value;
    if (mode === 'Cash' && !cashAmount.value.toString().trim()) {
      cashAmount.classList.add('error-field');
      hasError = true;
    } else if (mode === 'Online' && !onlineAmount.value.toString().trim()) {
      onlineAmount.classList.add('error-field');
      hasError = true;
    } else if (mode === 'Cash + Online') {
      if (!cashAmount.value.toString().trim()) { cashAmount.classList.add('error-field'); hasError = true; }
      if (!onlineAmount.value.toString().trim()) { onlineAmount.classList.add('error-field'); hasError = true; }
    }

    if (hasError) {
      showToast('Please fill all highlighted required fields', 'error');
      return;
    }

    const payload = {
      memberName: memberName.value.trim(),
      packageType: packageSelect.value,
      category: categorySelect.value,
      duration: durationSelect.value,
      startDate: startDate.value,
      fees: parseFloat(packageFees.value) || 0,
      discount: parseFloat(discount.value) || 0,
      finalPaid: parseFloat(finalPaid.value) || 0,
      paymentMode: getPaymentSummaryText()
    };

    submitBtn.disabled = true;
    btnTextContent.textContent = 'Submitting...';
    spinner.classList.remove('hidden');

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      showToast('Renewal submitted successfully!', 'success');
      form.reset();
      startDate.value = today;
      isManualFinalPaid = false;
      updatePaymentModeUI();
      calculateFinalPaid();
      updateLiveSummary();

    } catch (err) {
      showToast('Submission error. Check console.', 'error');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      btnTextContent.textContent = 'Submit Renewal';
      spinner.classList.add('hidden');
    }
  });
});