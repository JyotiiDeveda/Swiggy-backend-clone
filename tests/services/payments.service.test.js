const { makePayment, getAllPayments } = require('../../src/services/payments.service');
const { sequelize } = require('../../src/models');
const models = require('../../src/models');
const mailHelper = require('../../src/helpers/mail.helper');
// const constants = require('../../src/constants/constants');
const { customError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const paymentsHelper = require('../../src/helpers/payments.helper');

jest.mock('../../src/models');
jest.mock('../../src/helpers/mail.helper');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/helpers/payments.helper');

describe('Payments Service Tests', () => {
  let transactionMock;
  let currentUser;
  let userId;
  let payload;
  let orderId;
  // let email;

  beforeEach(() => {
    // Create fake data
    currentUser = {
      userId: faker.string.uuid(),
      email: faker.internet.email(),
    };
    userId = faker.string.uuid();
    orderId = faker.string.uuid();
    // email = faker.internet.email();
    payload = { orderId, type: 'CREDIT_CARD' };

    transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.transaction = jest.fn().mockResolvedValue(transactionMock);

    // Mock the models and other dependencies
    models.Order.findOne = jest.fn();
    models.Payment.findOne = jest.fn();
    models.Payment.create = jest.fn();
    models.User.findOne = jest.fn();
    mailHelper.sendPaymentStatusMail = jest.fn();
    paymentsHelper.pay = jest.fn();

    customError.mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('makePayment', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully make a payment and commit the transaction', async () => {
      const orderDetails = { id: orderId, total_amount: 100 };
      models.Order.findOne.mockResolvedValue(orderDetails);
      models.Payment.findOne.mockResolvedValue(null);
      paymentsHelper.pay.mockResolvedValue(true);
      models.Payment.create.mockResolvedValue({ id: faker.string.uuid() });

      const result = await makePayment(currentUser, payload);

      expect(result).toHaveProperty('id');
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      models.Order.findOne.mockResolvedValue(null); // Order not found

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Order not found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if payment already made for the order', async () => {
      const existingPayment = { id: faker.string.uuid() };
      models.Order.findOne.mockResolvedValue({ id: orderId });
      models.Payment.findOne.mockResolvedValue(existingPayment); // Payment already exists

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Payment done already');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if payment fails', async () => {
      const orderDetails = { id: orderId, total_amount: 100 };
      models.Order.findOne.mockResolvedValue(orderDetails);
      models.Payment.findOne.mockResolvedValue(null);
      paymentsHelper.pay.mockResolvedValue(false); // Payment failed

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Payment failed');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if payment creation fails', async () => {
      const orderDetails = { id: orderId, total_amount: 100 };
      models.Order.findOne.mockResolvedValue(orderDetails);
      models.Payment.findOne.mockResolvedValue(null);
      paymentsHelper.pay.mockResolvedValue(true);
      models.Payment.create.mockResolvedValue(null); // Payment creation failed

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Error in payment');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('getAllPayments', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return all payments for the given user', async () => {
      const mockPayments = [{ id: 1, order_id: orderId, total_amount: 100 }];
      models.Payment.findAll.mockResolvedValue(mockPayments);

      const page = 1;
      const limit = 10;

      const result = await getAllPayments(userId, page, limit);

      expect(result).toEqual(mockPayments);
      expect(models.Payment.findAll).toHaveBeenCalledWith({
        where: { user_id: userId },
        offset: (page - 1) * limit,
        limit: page * limit,
      });
    });

    it('should throw error if no payments are found', async () => {
      models.Payment.findAll.mockResolvedValue([]);

      const page = 1;
      const limit = 10;

      await expect(getAllPayments(userId, page, limit)).rejects.toThrow('No payments found for the user');
    });
  });
});
