const {
  authenticateToken,
  isAuthorized,
  isAdmin,
  isAuthorizedDeliveryPartner,
} = require('../../src/middlewares/auth.middleware');
const commonHelper = require('../../src/helpers/common.helper');
const jwtHelper = require('../../src/helpers/jwt.helper');
const models = require('../../src/models');
const constants = require('../../src/constants/constants');
const { faker } = require('@faker-js/faker');

// Mock necessary modules
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/helpers/jwt.helper');
jest.mock('../../src/models');

describe('Authentication and Authorization Middleware', () => {
  let req, res, next;
  let user;

  beforeEach(() => {
    // Mock the response and next functions
    req = { headers: { authorization: `Bearer ${faker.string.uuid()}` }, user: {} };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    next = jest.fn();

    // Mock user
    user = {
      id: faker.string.uuid(),
      userRoles: [constants.ROLES.CUSTOMER], // Default role for most tests
    };

    // Mock models and helpers
    models.User.findByPk = jest.fn();
    jwtHelper.verifyToken = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should return error if token is missing', async () => {
      req.headers.authorization = '';
      await authenticateToken(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, 'Token not found', 401);
    });

    it('should return error if token is invalid', async () => {
      jwtHelper.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      await authenticateToken(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, 'Invalid token', 401);
    });

    it('should return error if user does not exist', async () => {
      jwtHelper.verifyToken.mockReturnValue({ userId: user.id });
      models.User.findByPk.mockResolvedValue(null);
      await authenticateToken(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, 'User does not exists', 404);
    });

    it('should proceed if token is valid and user exists', async () => {
      jwtHelper.verifyToken.mockReturnValue({ userId: user.id });
      models.User.findByPk.mockResolvedValue(user);
      await authenticateToken(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      jwtHelper.verifyToken.mockImplementation(() => {
        throw new Error('Some error');
      });
      await authenticateToken(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, 'Some error', 401);
    });
  });

  describe('isAuthorized', () => {
    it('should allow access for ADMIN role', async () => {
      req.user.userRoles = [constants.ROLES.ADMIN];
      await isAuthorized(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should allow access for CUSTOMER role', async () => {
      req.user.userRoles = [constants.ROLES.CUSTOMER];
      await isAuthorized(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should deny access for users with other roles', async () => {
      req.user.userRoles = ['OTHER_ROLE'];
      await isAuthorized(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(
        res,
        'Admin or authorized user can access this route',
        403
      );
    });

    it('should deny access if no roles are provided', async () => {
      req.user.userRoles = [];
      await isAuthorized(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(
        res,
        'Admin or authorized user can access this route',
        403
      );
    });
  });

  describe('isAdmin', () => {
    it('should allow access for ADMIN role', async () => {
      req.user.userRoles = [constants.ROLES.ADMIN];
      await isAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should deny access for users without ADMIN role', async () => {
      req.user.userRoles = [constants.ROLES.CUSTOMER];
      await isAdmin(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, 'User is not authorized.', 403);
    });

    it('should deny access if no roles are provided', async () => {
      req.user.userRoles = [];
      await isAdmin(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, 'User is not authorized.', 403);
    });
  });

  describe('isAuthorizedDeliveryPartner', () => {
    it('should allow access for ADMIN role', async () => {
      req.user.userRoles = [constants.ROLES.ADMIN];
      await isAuthorizedDeliveryPartner(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should allow access for DELIVERY_PARTNER role', async () => {
      req.user.userRoles = [constants.ROLES.DELIVERY_PARTNER];
      await isAuthorizedDeliveryPartner(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should deny access for users without valid roles', async () => {
      req.user.userRoles = [constants.ROLES.CUSTOMER];
      await isAuthorizedDeliveryPartner(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(
        res,
        'Admin or authorized Delivery partner can access this route.',
        403
      );
    });

    it('should deny access if no roles are provided', async () => {
      req.user.userRoles = [];
      await isAuthorizedDeliveryPartner(req, res, next);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(
        res,
        'Admin or authorized Delivery partner can access this route.',
        403
      );
    });
  });
});
