const { faker } = require('@faker-js/faker');
const commonHelper = require('../../src/helpers/common.helper');
const paymentServices = require('../../src/services/payments.service');
const paymentControllers = require('../../src/controllers/payments.controller');

jest.mock('../../src/services/payments.service');
jest.mock('../../src/helpers/common.helper');

describe('Payment Controller', () => {
  describe('makePayment Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        user: { userId: faker.string.uuid() },
        body: { amount: faker.number.int({ min: 1, max: 500 }) }, // Payment payload
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should successfully make a payment and return a 201 status', async () => {
      const payment = {
        paymentId: faker.string.uuid(),
        userId: req.user.userId,
        amount: req.body.amount,
        status: 'successful',
      };

      paymentServices.makePayment.mockResolvedValue(payment);

      await paymentControllers.makePayment(req, res, next);

      expect(paymentServices.makePayment).toHaveBeenCalledWith(req.user, req.body);
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(payment);
      expect(res.message).toBe('Payment successfull');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when making a payment fails', async () => {
      const errorMessage = 'Payment failed';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      paymentServices.makePayment.mockRejectedValue(error);

      await paymentControllers.makePayment(req, res, next);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });
});
