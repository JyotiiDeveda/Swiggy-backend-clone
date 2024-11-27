const authServices = require('../../src/services/auth.service');
const commonHelper = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const authControllers = require('../../src/controllers/auth.controller');
const { redisClient } = require('../../src/config/redis');

jest.mock('../../src/services/auth.service');
jest.mock('../../src/helpers/common.helper');

jest.mock('redis', () => {
  const mRedisClient = {
    connect: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue(),
  };
  return {
    createClient: jest.fn(() => mRedisClient),
  };
});

describe('Auth Controller', () => {
  afterAll(async () => {
    await redisClient.quit();
  });

  describe('signup Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        body: {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    it('should return success when user is created', async () => {
      authServices.signup.mockResolvedValue();

      await authControllers.signup(req, res, next);

      expect(authServices.signup).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
      expect(res.message).toBe('User registered successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return error when user creation fails', async () => {
      const errMessage = 'Failed to create user';
      const error = new Error(errMessage);
      error.statusCode = 400;
      authServices.signup.mockRejectedValue(error);

      await authControllers.signup(req, res);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, 'Failed to create user', 400);
    });
  });

  describe('sendOtp Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        body: {
          email: faker.internet.email(),
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    it('should send OTP successfully and return a 200 status', async () => {
      authServices.sendOtp.mockResolvedValue();

      await authControllers.sendOtp(req, res, next);

      expect(authServices.sendOtp).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.message).toBe('Otp sent successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return an error when OTP sending fails', async () => {
      const errorMessage = 'Failed to send OTP';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      authServices.sendOtp.mockRejectedValue(error);

      await authControllers.sendOtp(req, res);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('login Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        body: {
          email: faker.internet.email(),
          otp: faker.string.numeric(6), // Mock OTP
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    it('should login successfully and return a token', async () => {
      const fakeToken = faker.string.uuid();
      authServices.verifyOtp.mockResolvedValue(fakeToken);

      await authControllers.login(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(fakeToken);
      expect(res.message).toBe('Login Successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return an error when OTP verification fails', async () => {
      const errorMessage = 'Failed to send OTP';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      authServices.verifyOtp.mockRejectedValue(error);

      await authControllers.login(req, res);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('logout Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {};

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      next = jest.fn();
    });

    it('should log the user out successfully and return a 204 status', async () => {
      authServices.logout.mockResolvedValue();
      await authControllers.logout(req, res, next);

      expect(authServices.logout).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.message).toBe('Logout successful');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when there is no active session or user is not logged in', async () => {
      const errorMessage = 'No active session found';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      authServices.logout.mockRejectedValue(error);

      await authControllers.logout(req, res);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });
});
