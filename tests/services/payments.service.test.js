const { makePayment } = require('../../src/services/payments.service');
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
  let currentUser;
  let payload;
  let orderId;
  // let email;

  beforeEach(() => {
    // Create fake data
    currentUser = {
      userId: faker.string.uuid(),
      email: faker.internet.email(),
    };
    orderId = faker.string.uuid();
    // email = faker.internet.email();
    payload = { orderId, type: 'CREDIT_CARD' };

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
    });

    it('should throw error if order not found', async () => {
      models.Order.findOne.mockResolvedValue(null); // Order not found

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Order not found');
    });

    it('should throw error if payment already made for the order', async () => {
      const existingPayment = { id: faker.string.uuid() };
      models.Order.findOne.mockResolvedValue({ id: orderId });
      models.Payment.findOne.mockResolvedValue(existingPayment); // Payment already exists

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Payment done already');
    });

    it('should throw error if payment fails', async () => {
      const orderDetails = { id: orderId, total_amount: 100 };
      models.Order.findOne.mockResolvedValue(orderDetails);
      models.Payment.findOne.mockResolvedValue(null);
      paymentsHelper.pay.mockResolvedValue(false); // Payment failed

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Payment failed');
    });

    it('should throw error if payment creation fails', async () => {
      const orderDetails = { id: orderId, total_amount: 100 };
      models.Order.findOne.mockResolvedValue(orderDetails);
      models.Payment.findOne.mockResolvedValue(null);
      paymentsHelper.pay.mockResolvedValue(true);
      models.Payment.create.mockResolvedValue(null); // Payment creation failed

      await expect(makePayment(currentUser, payload)).rejects.toThrowError('Error in payment');
    });
  });
});
