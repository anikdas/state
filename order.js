const order = {
    amount: 1200,
    status: 'INITIATED',
    contact: {
        name: 'Anik Das',
        email: 'anik@yellowmessenger.com'
    }
}

function initiatePayment () {
    const transactionId = generatePaymentLink();
    order.transactionId = transactionId;
    order.status = 'PAYMENT_PENDING';
}

function pay () {
    if (order.status !== 'PAYMENT_PENDING' && !order.transactionId) {
        throw new Error('Payment not allowed before payment initiation');
    }
    const paymentStatus = checkPaymentStatus();

    if (paymentStatus.success) {
        order.status = 'PAID'
    } else {
        order.status = 'PAYMENT_FAILED'
    }
}

function deliver () {
    if (order.status === 'PAID') {
        doDelivery();
        order.status = 'DELIVERED';
    } else {
        throw new Error('Please pay before requesting delivery');
    }
}

function cancelOrder () {
    if (order.status === 'PAID') {
        order.status = 'CANCEL';
        cancelOrder();
        refund();
    }

    if (order.status === 'PENDING') {
        cancelOrder();
    }

    if (order.status === 'DELIVERED') {
        throw new Error('Delivered order cannot be canceled');
    }
}


// write something like this
const definition = {
    init: 'pending',
    transitions: [
        { name: 'pay', from: 'pending', to: 'paid', 
            before: createTransaction, after: updateTransactionDetails },
        { name: 'deliver', from: 'paid', to: 'deliver', 
            before: checkDeliveryAvailability, after: updateDeliveryDetails },
        { name: 'pendingToCancel', from: 'pending', to: 'cancel' },
        { name: 'paidToRefund', from: 'paid', to: 'refund'},
        { name: 'refundToCancel', from: 'refund', to: 'cancel'}
    ],
    data: {
        quantity: '10g',
        temperature: 100
    }
}

const order = new order();
order.pay()
order.deliver()

order.pay()
order.paidToRefund()
order.refundToCancel()

order.pendingToCancel()