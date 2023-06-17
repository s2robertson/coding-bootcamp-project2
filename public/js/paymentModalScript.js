const makePaymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
const paymentAmountInput = document.getElementById('paymentAmount');
const paymentFeedbackEl = document.getElementById('paymentFormFeedback');
const paymentSubmitButton = document.getElementById('paymentSubmitButton');
const billIdHiddenInput = document.getElementById('billIdHidden');

let paymentModalOpenButton;

paymentSubmitButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const bill_id = billIdHiddenInput.value;
    const paid_amount = paymentAmountInput.value.trim();
    let errorMsg;
    if (!paid_amount) {
        errorMsg = 'Payment amount missing';
    } else if (paid_amount <= 0) {
        errorMsg = 'Payment must be > 0';
    }
    if (errorMsg) {
        paymentFeedbackEl.textContent = errorMsg;
        return;
    }
    paymentFeedbackEl.textContent = '';
    try {
        const result = await fetch('/api/payments', {
            method: 'POST',
            body: JSON.stringify({ bill_id, paid_amount }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!result.ok) {
            paymentFeedbackEl.textContent = 'Saving payment failed';
        } else {
            const payment = await result.json();
            try {
                const billDataEl = document.getElementById(paymentModalOpenButton.dataset.billInfoId);
                const billData = JSON.parse(billDataEl.value);
                const paymentListEl = document.getElementById(`paymentList${billData.id}`);
                paymentListEl.append(buildListItemForPayment(payment));
            } catch(err) {
                console.log(err);
            } finally {
                makePaymentModal.hide();
            }
        }
    } catch (err) {
        console.log(err);
        paymentFeedbackEl.textContent = 'Saving payment failed';
    }
});

function buildListItemForPayment(payment) {
    const base = document.createElement('li');
    base.classList.add('list-group-item');

    const paidAmountEl = document.createElement('p');
    paidAmountEl.textContent = `Amount paid: $${payment.paid_amount}`;
    const paidOnEl = document.createElement('p');
    const paidOnDate = new Date(payment.payment_date);
    paidOnEl.textContent = `Paid on ${paidOnDate.toLocaleDateString()}`;
    const paymentInfoHidden = document.createElement('input');
    paymentInfoHidden.id = `paymentInfo${payment.id}`;
    paymentInfoHidden.type = 'hidden';
    paymentInfoHidden.value = JSON.stringify(payment);

    base.append(paidAmountEl, paidOnEl, paymentInfoHidden);
    return base;
}

const makePaymentBillInfoEl = document.getElementById('makePaymentBillInfo');
const paymentModalLaunchButtons = document.querySelectorAll('button[data-bill-info-id]');
paymentModalLaunchButtons.forEach(button => {
    button.addEventListener('click', () => {
        paymentModalOpenButton = button;
        try {
            const billDataEl = document.getElementById(button.dataset.billInfoId);
            const billData = JSON.parse(billDataEl.value);
            const dueDate = new Date(billData.due_date)
            makePaymentBillInfoEl.textContent = `${billData.description}, due on ${dueDate.toLocaleDateString()}`
            billIdHiddenInput.value = billData.id;
            makePaymentModal.show();
        } catch (err) {
            console.log(err);
        }
    })
})