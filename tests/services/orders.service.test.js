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
const { getOrders } = require('../../src/helpers/orders.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/models');
jest.mock('../../src/helpers/mail.helper');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/helpers/orders.helper');

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
    mailHelper.sendOrderStatusUpdateMail = jest.fn();

    customError.mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });

    // getOrders.mockImplementation(() => jest.fn());
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
        getDishes: jest
          .fn()
          .mockResolvedValue([{ restaurant_id: restaurantId, price: 10, CartDish: { quantity: 2 } }]),
        status: constants.CART_STATUS.ACTIVE,
        save: jest.fn().mockResolvedValue(true),
      };

      models.Cart.findOne.mockResolvedValue(cartDishDetails);
      models.Order.findOne.mockResolvedValue(null);
      models.Order.create.mockResolvedValue({ id: faker.string.uuid() });

      const order = await placeOrder(currentUser, currentUser.userId, payload);

      expect(models.Cart.findOne).toHaveBeenCalled();
      expect(cartDishDetails.getDishes).toHaveBeenCalled();
      expect(models.Order.create).toHaveBeenCalled();
      expect(transactionMock.commit).toHaveBeenCalled();
      expect(order).toHaveProperty('id');
    });

    it('should throw error if order is already placed', async () => {
      models.Cart.findOne.mockResolvedValue({
        id: faker.string.uuid(),
        status: constants.CART_STATUS.ACTIVE,
      });
      models.Order.findOne.mockResolvedValue({ id: faker.string.uuid() }); // Order already exists

      await expect(placeOrder(currentUser, currentUser.userId, payload)).rejects.toThrowError(
        'Order already placed'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if cart not found', async () => {
      models.Cart.findOne.mockResolvedValue(null); // Cart not found

      await expect(placeOrder(currentUser, currentUser.userId, payload)).rejects.toThrowError(
        'Cart not found'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if cart is empty', async () => {
      const emptyCart = {
        getDishes: jest.fn().mockResolvedValue([]), // Empty cart
      };

      models.Cart.findOne.mockResolvedValue(emptyCart);
      models.Order.findOne.mockResolvedValue(null); // No order exists

      await expect(placeOrder(currentUser, currentUser.userId, payload)).rejects.toThrowError(
        'Cart is empty'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error and rollback if order creation fails', async () => {
      const cartDishDetails = {
        getDishes: jest
          .fn()
          .mockResolvedValue([{ restaurant_id: restaurantId, price: 10, CartDish: { quantity: 2 } }]),
        status: constants.CART_STATUS.ACTIVE,
      };

      models.Cart.findOne.mockResolvedValue(cartDishDetails);
      models.Order.findOne.mockResolvedValue(null); // No order exists
      models.Order.create.mockResolvedValue(null); // Order creation fails

      await expect(placeOrder(currentUser, currentUser.userId, payload)).rejects.toThrowError(
        'Failed to place error'
      );
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
    let currentUser;
    let userId;
    let queryOptions;

    beforeEach(() => {
      jest.clearAllMocks();

      currentUser = { userId: 1, userRoles: [] };
      userId = 1;
      queryOptions = { page: 1, limit: 10 };

      customError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      getOrders.mockImplementation(() => jest.fn());
    });

    it('should return orders for a given user (non-admin)', async () => {
      const mockOrders = {
        rows: [
          { id: 1, status: constants.ORDER_STATUS.PREPARING },
          { id: 2, status: constants.ORDER_STATUS.PREPARING },
        ],
        pagination: {
          totalRecords: 20,
          currentPage: 1,
          recordsPerPage: 10,
          noOfPages: 2,
        },
      };

      getOrders.mockResolvedValue(mockOrders);

      const result = await getAllOrders(currentUser, userId, queryOptions);

      expect(result).toEqual(mockOrders);
      expect(getOrders).toHaveBeenCalled();
    });

    it('should throw an error if the user is not authorized', async () => {
      currentUser.userId = 2; // Trying to access data for a different user
      userId = 1;

      await expect(getAllOrders(currentUser, userId, queryOptions)).rejects.toThrow(
        'Given user is not authorized for this endpoint'
      );

      expect(customError).toHaveBeenCalledWith('Given user is not authorized for this endpoint', 403);
      expect(getOrders).not.toHaveBeenCalled();
    });

    it('should return orders for an admin user accessing another user’s data', async () => {
      currentUser.userRoles = [constants.ROLES.ADMIN];
      userId = 2;

      const mockOrders = {
        rows: [
          { id: 1, status: constants.ORDER_STATUS.COMPLETED },
          { id: 2, status: constants.ORDER_STATUS.DELIVERED },
        ],
        pagination: {
          totalRecords: 15,
          currentPage: 1,
          recordsPerPage: 10,
          noOfPages: 2,
        },
      };

      getOrders.mockResolvedValue(mockOrders);

      const result = await getAllOrders(currentUser, userId, queryOptions);

      expect(result).toEqual(mockOrders);
      expect(getOrders).toHaveBeenCalled();
    });

    it('should throw an error if no orders are found', async () => {
      getOrders.mockRejectedValue(new Error('Orders not found'));

      await expect(getAllOrders(currentUser, userId, queryOptions)).rejects.toThrow('Orders not found');

      expect(getOrders).toHaveBeenCalled();
    });

    it('should handle an error if getOrders fails', async () => {
      getOrders.mockRejectedValue(new Error('Database error'));

      await expect(getAllOrders(currentUser, userId, queryOptions)).rejects.toThrow('Database error');

      expect(getOrders).toHaveBeenCalled();
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and commit transaction', async () => {
      const orderId = faker.string.uuid();
      const orderDetails = { id: orderId, cart_id: faker.string.uuid() };
      const cartDetails = { id: faker.string.uuid(), status: 'active' };

      models.Order.findOne.mockResolvedValue(orderDetails);
      models.Order.destroy.mockResolvedValue(1);
      models.Cart.findByPk.mockResolvedValue(cartDetails);
      models.Cart.destroy.mockResolvedValue(1);

      await deleteOrder(currentUser, { userId: currentUser.userId, orderId });

      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should rollback and throw error if order not found', async () => {
      models.Order.findOne.mockResolvedValue(null);
      models.Order.destroy.mockResolvedValue(0);

      await expect(
        deleteOrder(currentUser, { userId: currentUser.userId, orderId: faker.string.uuid() })
      ).rejects.toThrowError('No order found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('getAllUnassignedOrders', () => {
    const options = {
      where: { status: constants.ORDER_STATUS.PREPARING, delivery_partner_id: null },
      include: {
        model: models.Restaurant,
      },
      offset: 2,
      limit: 5,
    };
    it('should return orders with status PREPARING', async () => {
      const mockOrders = [
        { id: 1, status: constants.ORDER_STATUS.PREPARING },
        { id: 2, status: constants.ORDER_STATUS.PREPARING },
      ];

      getOrders.mockResolvedValue(mockOrders);

      const page = 1;
      const limit = 10;

      const result = await getAllUnassignedOrders(options, page, limit);

      expect(result).toEqual(mockOrders);
    });

    it('should throw error if no orders are found', async () => {
      getOrders.mockRejectedValue(new Error('No orders found'));

      const page = 1;
      const limit = 10;

      await expect(getAllUnassignedOrders(options, page, limit)).rejects.toThrow('No orders found');
    });
  });

  describe('assignOrder', () => {
    const orderId = faker.string.uuid();
    const order = {
      id: orderId,
      cart_id: cartId,
      save: jest.fn(),
    };

    it('should assign order to delivery partner and commit', async () => {
      models.Order.findOne.mockResolvedValue(order);
      models.User.findOne.mockResolvedValue({ first_name: 'John', last_name: 'Doe' });

      const result = await assignOrder(currentUser, userId, orderId);

      expect(result.delivery_partner_id).toEqual(userId);
    });

    it('should rollback if no order found for assignment', async () => {
      models.Order.update.mockResolvedValue([0]);

      await expect(assignOrder(currentUser, userId, faker.string.uuid())).rejects.toThrowError(
        'No order found'
      );
    });
  });

  describe('updateOrderStatus', () => {
    const orderId = faker.string.uuid();

    const order = {
      id: orderId,
      cart_id: cartId,
      save: jest.fn(),
    };

    it('should update order status and commit', async () => {
      const status = 'DELIVERED';
      models.Order.findOne.mockResolvedValue(order);

      const result = await updateOrderStatus(currentUser, orderId, status);

      expect(result.status).toEqual(status);
    });

    it('should rollback and throw error if no order found', async () => {
      models.Order.update.mockResolvedValue([0]);

      await expect(updateOrderStatus(currentUser, faker.string.uuid(), 'DELIVERED')).rejects.toThrowError(
        'No order found'
      );
    });
  });
});
