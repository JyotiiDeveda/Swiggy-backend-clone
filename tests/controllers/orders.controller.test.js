const { faker } = require('@faker-js/faker');
const commonHelper = require('../../src/helpers/common.helper');
const orderServices = require('../../src/services/orders.service');
const orderControllers = require('../../src/controllers/orders.controller');

jest.mock('../../src/services/orders.service');
jest.mock('../../src/helpers/common.helper');

describe('Order Controller', () => {
  describe('getAllUnassignedOrders Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        query: { page: faker.number.int({ min: 1, max: 5 }), limit: faker.number.int({ min: 1, max: 10 }) },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should successfully fetch unassigned orders and return a 200 status', async () => {
      const fakeOrders = [
        { orderId: faker.string.uuid(), status: 'unassigned' },
        { orderId: faker.string.uuid(), status: 'unassigned' },
      ];

      orderServices.getAllUnassignedOrders.mockResolvedValue(fakeOrders);

      await orderControllers.getAllUnassignedOrders(req, res, next);

      expect(orderServices.getAllUnassignedOrders).toHaveBeenCalledWith(req.query);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(fakeOrders);
      expect(res.message).toBe('Fetched unassigned orders successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching unassigned orders fails', async () => {
      const errorMessage = 'Failed to fetch unassigned orders';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      orderServices.getAllUnassignedOrders.mockRejectedValue(error);

      await orderControllers.getAllUnassignedOrders(req, res, next);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('assignOrder Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        params: { id: faker.string.uuid() }, // orderId
        body: { userId: faker.string.uuid() }, // delivery partner userId
        user: { userId: faker.string.uuid() }, // current user (delivery partner)
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should successfully assign an order and return a 200 status', async () => {
      const assignedOrder = {
        orderId: req.params.id,
        userId: req.body.userId,
        status: 'assigned',
      };

      orderServices.assignOrder.mockResolvedValue(assignedOrder);

      await orderControllers.assignOrder(req, res, next);

      expect(orderServices.assignOrder).toHaveBeenCalledWith(req.user, req.body.userId, req.params.id);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(assignedOrder);
      expect(res.message).toBe('Assigned order successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when assigning order fails', async () => {
      const errorMessage = 'Failed to assign order';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      orderServices.assignOrder.mockRejectedValue(error);

      await orderControllers.assignOrder(req, res, next);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('updateOrderStatus Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        params: { id: faker.string.uuid() }, // orderId
        body: { status: 'delivered' }, // order status
        user: { userId: faker.string.uuid() }, // delivery partner
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should successfully update the order status and return a 200 status', async () => {
      const updatedOrder = {
        orderId: req.params.id,
        status: req.body.status,
      };

      orderServices.updateOrderStatus.mockResolvedValue(updatedOrder);

      await orderControllers.updateOrderStatus(req, res, next);

      expect(orderServices.updateOrderStatus).toHaveBeenCalledWith(req.user, req.params.id, req.body.status);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(updatedOrder);
      expect(res.message).toBe('Updated order status successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when updating order status fails', async () => {
      const errorMessage = 'Failed to update order status';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      orderServices.updateOrderStatus.mockRejectedValue(error);

      await orderControllers.updateOrderStatus(req, res, next);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });
});
