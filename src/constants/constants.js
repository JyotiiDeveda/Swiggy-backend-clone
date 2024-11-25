const ROLES = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  DELIVERY_PARTNER: 'Delivery Partner',
};

const RESTAURANT_CATEGORY = {
  VEG: 'veg',
  NON_VEG: 'non-veg',
  BOTH: 'both',
};

const DISH_CATEGORY = {
  VEG: 'veg',
  NON_VEG: 'non-veg',
};

const GST_RATE = 5;
const DELIVERY_CHARGES = 30;

const ORDER_STATUS = {
  PREPARING: 'preparing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const CART_STATUS = {
  ACTIVE: 'active',
  LOCKED: 'locked',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESSFUL: 'successfull',
  FAILED: 'failed',
};

const ENTITY_TYPE = {
  RESTAURANT: 'restaurant',
  DISH: 'dish',
};

const PAYMENT_TYPE = {
  ONLINE: 'online',
  CASH_ON_DELIVERY: 'cash-on-delivery',
};

const SORT_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
};

const SORT_BY = {
  PRICE: 'price',
  AVERAGE_RATING: 'averageRating',
};

module.exports = {
  ROLES,
  RESTAURANT_CATEGORY,
  DISH_CATEGORY,
  GST_RATE,
  DELIVERY_CHARGES,
  ORDER_STATUS,
  CART_STATUS,
  PAYMENT_STATUS,
  ENTITY_TYPE,
  PAYMENT_TYPE,
  SORT_ORDER,
  SORT_BY,
};
