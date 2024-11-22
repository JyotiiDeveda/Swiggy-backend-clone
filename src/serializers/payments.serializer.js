const serializePayments = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  const payments = rows.map(payment => ({
    id: payment.id,
    orderId: payment.order_id,
    paymentDate: payment?.created_at,
    totalAmount: payment?.total_amount,
    type: payment?.type,
    status: payment?.status,
    createdAt: payment?.created_at,
    updatedAt: payment?.updated_at,
  }));

  res.data = isSingleItem ? { payment: payments[0] } : { payments };

  next();
};

module.exports = {
  serializePayments,
};
