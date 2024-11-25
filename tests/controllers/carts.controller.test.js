const { faker } = require('@faker-js/faker');
const cartControllers = require('../../src/controllers/carts.controller');
const cartServices = require('../../src/services/carts.service');
const commonHelper = require('../../src/helpers/common.helper');

jest.mock('../../src/services/carts.service');
jest.mock('../../src/helpers/common.helper');

describe('Cart Controller', () => {
  describe('addItem Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        user: { userId: faker.string.uuid() },
        body: {
          dishId: faker.string.uuid(),
          quantity: faker.number.int({ min: 1, max: 5 }),
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should successfully add item to the cart and return a 201 status', async () => {
      const fakeCart = {
        userId: req.user.userId,
        items: [{ dishId: req.body.dishId, quantity: req.body.quantity }],
      };
      cartServices.addItem.mockResolvedValue(fakeCart);

      await cartControllers.addItem(req, res, next);

      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(fakeCart);
      expect(res.message).toBe('Added dish to cart successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when adding a dish to the cart fails', async () => {
      const errorMessage = 'Failed to add item';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      cartServices.addItem.mockRejectedValue(error);

      await cartControllers.addItem(req, res);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('removeItem Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        user: { userId: faker.string.uuid() },
        params: {
          cartId: faker.string.uuid(),
          dishId: faker.string.uuid(),
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should successfully remove item from the cart and return a 204 status', async () => {
      cartServices.removeItem.mockResolvedValue();

      await cartControllers.removeItem(req, res, next);

      expect(res.statusCode).toBe(204);
      expect(res.message).toBe('Dish removed from cart');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return an error if removing item from the cart fails', async () => {
      const errorMessage = 'Failed to remove item from cart';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      cartServices.removeItem.mockRejectedValue(error);

      await cartControllers.removeItem(req, res);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('emptyCart Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        user: { userId: faker.string.uuid() },
        params: {
          id: faker.string.uuid(),
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should successfully empty the cart and return a 204 status', async () => {
      cartServices.emptyCart.mockResolvedValue();

      await cartControllers.emptyCart(req, res, next);

      expect(res.statusCode).toBe(204);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return an error if emptying the cart fails', async () => {
      const errorMessage = 'Failed to empty the cart';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      cartServices.emptyCart.mockRejectedValue(error);

      await cartControllers.emptyCart(req, res);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });
});
