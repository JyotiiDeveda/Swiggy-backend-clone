const {
  placeOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  getAllUnassignedOrders,
  assignOrder,
  updateOrderStatus,
} = require('../../src/services/orders.service');
const { sequelize } = require('../../src/models');
const models = require('../../src/../src/models');
const mailHelper = require('../../src/helpers/mail.helper');
const constants = require('../../src/constants/constants');
const { customError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/models');
jest.mock('../../src/helpers/mail.helper');
jest.mock('../../src/helpers/common.helper');

describe('Order Service Tests', () => {
  let transactionMock;
  let currentUser;
  let userId;
  let payload;
  let cartId;
  let restaurantId;

  beforeEach(() => {
    // Create fake data
    currentUser = {
      userId: faker.string.uuid(),
      userRoles: [constants.ROLES.ADMIN], // Mock an admin user for tests
      email: faker.internet.email(),
    };
    userId = faker.string.uuid();
    cartId = faker.string.uuid();
    restaurantId = faker.string.uuid();
    payload = { cart_id: cartId, restaurant_id: restaurantId };

    transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.transaction = jest.fn().mockResolvedValue(transactionMock);

    // Mock the models and other dependencies
    models.Order.findOne = jest.fn();
    models.Cart.findOne = jest.fn();
    models.CartDish = jest.fn();
    models.Order.create = jest.fn();
    models.Cart.save = jest.fn();
    models.CartDish.save = jest.fn();
    models.User.findOne = jest.fn();
    models.Order.destroy = jest.fn();
    models.Order.update = jest.fn();

    mailHelper.sendOrderPlacedMail = jest.fn();
    mailHelper.sendOrderAssignedMail = jest.fn();
    mailHelper.sendOrderStatusUpdateMail = jest.fn();

    customError.mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('placeOrder', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should successfully place an order and commit the transaction', async () => {
      const cartDishDetails = {
        dishes: [{ restaurant_id: restaurantId, CartDish: { quantity: 2, price: 10 } }],
        status: constants.CART_STATUS.ACTIVE,
        save: jest.fn().mockResolvedValue(true),
      };

      models.Order.findOne.mockResolvedValue(null);
      models.Cart.findOne.mockResolvedValue(cartDishDetails);
      models.Order.create.mockResolvedValue({ id: faker.string.uuid() });

      const order = await placeOrder(currentUser, userId, payload);

      expect(order).toHaveProperty('id');
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if order is already placed', async () => {
      models.Order.findOne.mockResolvedValue({ id: faker.string.uuid() });

      await expect(placeOrder(currentUser, userId, payload)).rejects.toThrowError('Order already placed');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if cart not found', async () => {
      models.Order.findOne.mockResolvedValue(null);
      models.Cart.findOne.mockResolvedValue(null);

      await expect(placeOrder(currentUser, userId, payload)).rejects.toThrowError('Cart not found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if cart is empty', async () => {
      models.Order.findOne.mockResolvedValue(null); // No order placed
      models.Cart.findOne.mockResolvedValue({ dishes: [] }); // Cart is empty

      await expect(placeOrder(currentUser, userId, payload)).rejects.toThrowError('Cart is empty');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if restaurant does not match cart restaurant', async () => {
      models.Order.findOne.mockResolvedValue(null); // No order placed
      models.Cart.findOne.mockResolvedValue({
        dishes: [{ restaurant_id: faker.string.uuid() }],
      });

      await expect(placeOrder(currentUser, userId, payload)).rejects.toThrowError(
        'Restaurant does not belong to given cart'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error and rollback if order creation fails', async () => {
      models.Order.findOne.mockResolvedValue(null); // No order placed
      models.Cart.findOne.mockResolvedValue({
        dishes: [{ restaurant_id: restaurantId, price: 10, CartDish: { quantity: 2 } }],
      });

      models.Order.create.mockResolvedValue(null); // Failed to create order

      await expect(placeOrder(currentUser, userId, payload)).rejects.toThrowError('Failed to place error');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('getOrder', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return order details if authorized', async () => {
      const orderDetails = { id: faker.string.uuid() };

      models.Order.findOne.mockResolvedValue(orderDetails);

      const order = await getOrder(currentUser, userId, orderDetails.id);
      expect(order).toEqual(orderDetails);
    });

    it('should throw error if user is not authorized', async () => {
      currentUser.userRoles = ['USER']; // Non-admin user

      await expect(getOrder(currentUser, userId, faker.string.uuid())).rejects.toThrowError(
        'Given user is not authorized for this endpoint'
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return orders for a given user with admin role', async () => {
      const mockOrders = [
        { id: 1, status: constants.ORDER_STATUS.PREPARING },
        { id: 2, status: constants.ORDER_STATUS.PREPARING },
      ];
      const currentUser = { userId: 1, userRoles: [constants.ROLES.ADMIN] };
      models.Order.findAll = jest.fn().mockResolvedValue(mockOrders);

      const userId = 1;
      const page = 1;
      const limit = 10;

      const result = await getAllOrders(currentUser, userId, page, limit);

      expect(result).toEqual(mockOrders);
      expect(models.Order.findAll).toHaveBeenCalledWith({
        attributes: [
          'id',
          [sequelize.col('Order.created_at'), 'orderDate'],
          [sequelize.col('Restaurant.name'), constants.ENTITY_TYPE.RESTAURANT],
          'delivery_charges',
          'order_charges',
          'gst',
          'total_amount',
          'status',
        ],
        include: [
          {
            model: models.Restaurant,
            attributes: [],
            duplicating: false,
          },
          {
            model: models.Cart,
            where: { user_id: userId },
            attributes: [],
            duplicating: false,
          },
        ],
        offset: (page - 1) * limit,
        limit: page * limit,
      });
    });

    it('should return orders for a given user (non-admin)', async () => {
      const mockOrders = [
        { id: 1, status: constants.ORDER_STATUS.PREPARING },
        { id: 2, status: constants.ORDER_STATUS.PREPARING },
      ];
      const currentUser = { userId: 1, userRoles: [] };
      models.Order.findAll = jest.fn().mockResolvedValue(mockOrders);

      const userId = 1;
      const page = 1;
      const limit = 10;

      const result = await getAllOrders(currentUser, userId, page, limit);

      expect(result).toEqual(mockOrders);
      expect(models.Order.findAll).toHaveBeenCalledWith({
        attributes: [
          'id',
          [sequelize.col('Order.created_at'), 'orderDate'],
          [sequelize.col('Restaurant.name'), constants.ENTITY_TYPE.RESTAURANT],
          'delivery_charges',
          'order_charges',
          'gst',
          'total_amount',
          'status',
        ],
        include: [
          {
            model: models.Restaurant,
            attributes: [],
            duplicating: false,
          },
          {
            model: models.Cart,
            where: { user_id: userId },
            attributes: [],
            duplicating: false,
          },
        ],
        offset: (page - 1) * limit,
        limit: page * limit,
      });
    });

    it('should throw error if user is not authorized', async () => {
      const currentUser = { userId: 1, userRoles: [] };
      const userId = 2; // Trying to access another user's data
      const page = 1;
      const limit = 10;

      await expect(getAllOrders(currentUser, userId, page, limit)).rejects.toThrow(
        'Given user is not authorized for this endpoint'
      );
    });

    it('should throw error if no orders are found', async () => {
      const currentUser = { userId: 1, userRoles: [constants.ROLES.ADMIN] };
      const userId = 1;
      models.Order.findAll = jest.fn().mockResolvedValue([]);

      const page = 1;
      const limit = 10;

      await expect(getAllOrders(currentUser, userId, page, limit)).rejects.toThrow('No users found');
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and commit transaction', async () => {
      const orderId = faker.string.uuid();
      const orderDetails = { id: orderId, cart_id: faker.string.uuid() };

      models.Order.destroy.mockResolvedValue([1, orderDetails]);
      models.Cart.destroy.mockResolvedValue(1);

      await deleteOrder(currentUser, userId, orderId);

      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should rollback and throw error if order not found', async () => {
      models.Order.destroy.mockResolvedValue([]);

      await expect(deleteOrder(currentUser, userId, faker.string.uuid())).rejects.toThrowError(
        'No order found'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('getAllUnassignedOrders', () => {
    it('should return orders with status PREPARING', async () => {
      const mockOrders = [
        { id: 1, status: constants.ORDER_STATUS.PREPARING },
        { id: 2, status: constants.ORDER_STATUS.PREPARING },
      ];
      models.Order.findAll = jest.fn().mockResolvedValue(mockOrders);

      const page = 1;
      const limit = 10;

      const result = await getAllUnassignedOrders(page, limit);

      expect(result).toEqual(mockOrders);
      expect(models.Order.findAll).toHaveBeenCalledWith({
        where: { status: constants.ORDER_STATUS.PREPARING },
        offset: (page - 1) * limit,
        limit: page * limit,
      });
    });

    it('should throw error if no orders are found', async () => {
      models.Order.findAll = jest.fn().mockResolvedValue([]);

      const page = 1;
      const limit = 10;

      await expect(getAllUnassignedOrders(page, limit)).rejects.toThrow('No orders found');
      expect(models.Order.findAll).toHaveBeenCalledWith({
        where: { status: constants.ORDER_STATUS.PREPARING },
        offset: (page - 1) * limit,
        limit: page * limit,
      });
    });
  });

  describe('assignOrder', () => {
    it('should assign order to delivery partner and commit', async () => {
      const orderId = faker.string.uuid();
      const updatedOrder = { id: orderId, delivery_partner_id: userId };
      models.Order.update.mockResolvedValue([1, [updatedOrder]]);
      models.User.findOne.mockResolvedValue({ first_name: 'John', last_name: 'Doe' });

      const result = await assignOrder(currentUser, userId, orderId);

      expect(result[0].delivery_partner_id).toEqual(userId);
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should rollback if no order found for assignment', async () => {
      models.Order.update.mockResolvedValue([0]);

      await expect(assignOrder(currentUser, userId, faker.string.uuid())).rejects.toThrowError(
        'No order found'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status and commit', async () => {
      const orderId = faker.string.uuid();
      const status = 'DELIVERED';
      const updatedOrder = { id: orderId, status };
      models.Order.update.mockResolvedValue([1, [updatedOrder]]);

      const result = await updateOrderStatus(currentUser, orderId, status);

      expect(result[0].status).toEqual(status);
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should rollback and throw error if no order found', async () => {
      models.Order.update.mockResolvedValue([0]);

      await expect(updateOrderStatus(currentUser, faker.string.uuid(), 'DELIVERED')).rejects.toThrowError(
        'No order found'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });
});
