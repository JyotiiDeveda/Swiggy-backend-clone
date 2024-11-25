const userServices = require('../../src/services/users.service');
const authServices = require('../../src/services/auth.service');
const otpHelper = require('../../src/helpers/otp.helper');
const mailHelper = require('../../src/helpers/mail.helper');
const commonHelper = require('../../src/helpers/common.helper');
const { redisClient } = require('../../src/config/redis');
const models = require('../../src/models');
const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/services/users.service');
jest.mock('../../src/helpers/otp.helper');
jest.mock('../../src/helpers/mail.helper');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/config/redis');
jest.mock('../../src/models');
jest.mock('jsonwebtoken');

jest.mock('redis', () => {
  const mRedisClient = {
    connect: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };
  return {
    createClient: jest.fn(() => mRedisClient),
  };
});

describe('Auth Services', () => {
  let userData;
  let email;
  let otp;
  let token;
  let user;
  let mockRedisKey;

  beforeEach(() => {
    // Initialize faker data for testing
    userData = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
    };

    email = userData.email;
    otp = faker.string.numeric(6); // Simulate a 6 digit OTP
    token = faker.string.uuid();

    user = {
      id: faker.string.uuid(),
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
    };

    mockRedisKey = user.id.toString();

    commonHelper.customError.mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  afterAll(async () => {
    await redisClient.quit();

    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user, generate OTP, and send verification email', async () => {
      userServices.create.mockResolvedValue(user);
      otpHelper.generateOTP.mockReturnValue(otp);
      redisClient.set.mockResolvedValue('OK');
      mailHelper.sendVerificationEmail.mockResolvedValue();

      await authServices.signup(userData);

      expect(userServices.create).toHaveBeenCalledWith(userData);
      expect(otpHelper.generateOTP).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalledWith(mockRedisKey, otp.toString(), { EX: 300 });
      expect(mailHelper.sendVerificationEmail).toHaveBeenCalledWith(
        userData.email,
        'OTP Verification email',
        `Your one time password to login : ${otp}`
      );
    });

    it('should handle errors if user creation fails', async () => {
      const errorMessage = 'Error creating user';
      userServices.create.mockRejectedValue(new Error(errorMessage));

      await expect(authServices.signup(userData)).rejects.toThrowError(errorMessage);
    });
  });

  describe('sendOtp', () => {
    it('should generate OTP and send it to the user email if the user exists', async () => {
      // Mocks
      models.User.findOne.mockResolvedValue(user);
      otpHelper.generateOTP.mockReturnValue(otp);
      redisClient.set.mockResolvedValue('OK');
      mailHelper.sendVerificationEmail.mockResolvedValue();

      await authServices.sendOtp(email);

      expect(models.User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(otpHelper.generateOTP).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalledWith(mockRedisKey, otp.toString(), { EX: 300 });
      expect(mailHelper.sendVerificationEmail).toHaveBeenCalledWith(
        email,
        'Login OTP',
        `Your one time password to login: ${otp}`
      );
    });

    it('should throw error if user does not exist', async () => {
      const email = faker.internet.email();
      models.User.findOne.mockResolvedValue(null);

      const errorMessage = 'User does not exist.. Please signup';

      commonHelper.customError.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await expect(authServices.sendOtp(email)).rejects.toThrowError(errorMessage);
    });

    it('should handle errors if OTP generation or sending fails', async () => {
      models.User.findOne.mockResolvedValue(user);
      otpHelper.generateOTP.mockReturnValue(otp);
      redisClient.set.mockResolvedValue('OK');
      mailHelper.sendVerificationEmail.mockRejectedValue(new Error('Error sending email'));

      await expect(authServices.sendOtp(email)).rejects.toThrowError('Error sending email');
    });
  });

  describe('verifyOtp', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should verify OTP and return a JWT token if OTP matches', async () => {
      const userDetails = {
        ...user,
        roles: [{ name: 'Customer' }],
      };

      console.log('USER DETAILS: ', userDetails);
      models.User.findOne.mockResolvedValueOnce(userDetails);
      redisClient.get.mockResolvedValue(otp);
      redisClient.del.mockResolvedValue('OK');
      jwt.sign.mockReturnValue(token);

      console.log('Email: ', email);
      const result = await authServices.verifyOtp(email, otp);

      expect(models.User.findOne).toHaveBeenCalled();
      expect(redisClient.get).toHaveBeenCalledWith(mockRedisKey);
      expect(redisClient.del).toHaveBeenCalledWith(mockRedisKey);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: user.id,
          userRoles: ['Customer'],
          email,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );
      expect(result).toEqual({ token });
    });

    it('should throw error if user does not exist', async () => {
      models.User.findOne.mockResolvedValue(null);

      const errorMessage = 'User not found';
      await expect(authServices.verifyOtp(email, otp)).rejects.toThrowError(errorMessage);
    });

    it('should throw error if OTP does not match', async () => {
      const userDetails = { ...user };
      models.User.findOne.mockResolvedValue(userDetails);
      redisClient.get.mockResolvedValue('wrongOtp');

      const errorMessage = 'Invalid otp';
      await expect(authServices.verifyOtp(email, otp)).rejects.toThrowError(errorMessage);
    });

    it('should handle JWT signing errors', async () => {
      const userDetails = {
        ...user,
        roles: [{ name: 'USER' }],
      };
      models.User.findOne.mockResolvedValue(userDetails);
      redisClient.get.mockResolvedValue(otp);
      redisClient.del.mockResolvedValue('OK');
      jwt.sign.mockImplementation(() => {
        throw new Error('JWT Error');
      });

      await expect(authServices.verifyOtp(email, otp)).rejects.toThrowError('JWT Error');
    });
  });

  describe('logout', () => {
    it('Gracefully terminates, does not return anything', async () => {
      await authServices.logout();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token with provided payload', () => {
      const payload = { userId: user.id, email: user.email };
      jwt.sign.mockReturnValue(token);

      const result = authServices.generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
      });
      expect(result).toEqual(token);
    });
  });

  describe('verifyToken', () => {
    it('should verify a JWT token and return decoded payload', () => {
      const decodedToken = { userId: user.id, email: user.email };
      const token = faker.string.uuid();
      jwt.verify.mockReturnValue(decodedToken);

      const result = authServices.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toEqual(decodedToken);
    });

    it('should throw error if token verification fails', () => {
      const errorMessage = 'Token verification failed';
      jwt.verify.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const token = faker.string.uuid();
      expect(() => authServices.verifyToken(token)).toThrowError(errorMessage);
    });
  });
});
