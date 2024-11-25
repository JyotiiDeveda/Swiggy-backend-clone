const serializePayments = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  const response = { pagination: res.data?.pagination };

  if (isSingleItem) {
    rows = [rows];
  }

  const payments = rows.map(payment => ({
    id: payment.id,
    orderId: payment?.order_id,
    userId: payment?.user_id,
    paymentDate: payment?.created_at,
    totalAmount: payment?.total_amount,
    type: payment?.type,
    status: payment?.status,
    createdAt: payment?.created_at,
    updatedAt: payment?.updated_at,
  }));

  isSingleItem ? (response.payment = payments[0]) : (response.payments = payments);

  res.data = response;

  next();
};

module.exports = {
  serializePayments,
};
