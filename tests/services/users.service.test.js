const {
  create,
  assignRole,
  addAddress,
  removeAccount,
  get,
  getAll,
} = require('../../src/services/users.service');
const { sequelize } = require('../../src/models');
const { User, UserRole, Role } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const constants = require('../../src/constants/constants');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('User Service Tests', () => {
  let transactionMock;
  let currentUser;
  let userId;
  let newUser;
  let roleId;
  let address;

  beforeEach(() => {
    // Create fake data
    currentUser = {
      userId: faker.string.uuid(),
      userRoles: [constants.ROLES.ADMIN],
    };
    userId = faker.string.uuid();
    newUser = {
      id: faker.string.uuid(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      save: jest.fn().mockResolvedValue(true),
    };
    roleId = faker.string.uuid();
    address = faker.location.streetAddress();

    transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.transaction = jest.fn().mockResolvedValue(transactionMock);

    // Mock the and other dependencies
    User.findOne = jest.fn();
    User.restore = jest.fn();
    User.build = jest.fn();
    User.create = jest.fn();
    User.save = jest.fn();
    Role.findOne = jest.fn();
    UserRole.findOrCreate = jest.fn();
    User.update = jest.fn();
    User.destroy = jest.fn();
    User.findAll = jest.fn();
    Role.findOne = jest.fn();

    commonHelpers.customError = jest.fn().mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);
      Role.findOne.mockResolvedValue({ id: roleId });
      UserRole.findOrCreate.mockResolvedValue([{}, true]);

      const mockSave = jest.fn().mockResolvedValue(newUser);
      User.build.mockReturnValue({ ...newUser, save: mockSave });

      const createdUser = await create(newUser);

      expect(createdUser).toHaveProperty('id');
      expect(User.findOne).toHaveBeenCalled();
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      User.findOne.mockResolvedValue({ deleted_at: null }); // User already exists

      await expect(create(newUser)).rejects.toThrowError(
        'User with given credentials already exists (email and phone number should be unique)'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should restore a soft-deleted user if the same email/phone exists', async () => {
      User.findOne.mockResolvedValue({ deleted_at: new Date() }); // Soft deleted user exists
      User.restore.mockResolvedValue([newUser]);

      const restoredUser = await create(newUser);

      expect(restoredUser).toHaveProperty('id');
      expect(transactionMock.commit).toHaveBeenCalled();
    });
  });

  describe('assignRole', () => {
    it('should successfully assign a role to a user', async () => {
      Role.findOne.mockResolvedValue({ id: roleId });
      UserRole.findOrCreate.mockResolvedValue([{}, true]);

      await assignRole(currentUser, userId, roleId);

      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if user is not authorized to assign role', async () => {
      currentUser.userRoles = [constants.ROLES.CUSTOMER]; // Not an admin

      await expect(assignRole(currentUser, userId, roleId)).rejects.toThrowError(
        'Given user is not authorized for this endpoint'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if role does not exist', async () => {
      Role.findOne.mockResolvedValue(null);

      await expect(assignRole(currentUser, userId, roleId)).rejects.toThrowError('Role does not exist');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('addAddress', () => {
    it('should successfully add address to user', async () => {
      User.findByPk.mockResolvedValue(newUser);
      newUser.address = address;

      const updatedUser = await addAddress(currentUser, userId, address);

      expect(updatedUser).toHaveProperty('address', address);
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(addAddress(currentUser, userId, address)).rejects.toThrowError('No user found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('removeAccount', () => {
    it('should successfully remove a user account', async () => {
      User.findByPk.mockResolvedValue(newUser);
      User.destroy.mockResolvedValue(1);

      await removeAccount(currentUser, userId);

      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);
      User.destroy.mockResolvedValue(0); // No user found

      await expect(removeAccount(currentUser, userId)).rejects.toThrowError('No user found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should successfully get user details', async () => {
      User.findOne.mockResolvedValue(newUser);

      const userDetails = await get(currentUser.userId);

      expect(userDetails).toHaveProperty('id');
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null); // No user found

      await expect(get(currentUser, userId)).rejects.toThrowError('User not found');
    });
  });

  describe('getAll', () => {
    it('should successfully get all users', async () => {
      User.findAndCountAll.mockResolvedValue({ count: 1, rows: [newUser] });

      const users = await getAll({ page: 1, limit: 10 });

      expect(users?.rows).toHaveLength(1);
    });

    it('should throw error if no users found', async () => {
      User.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await expect(getAll({ page: 1, limit: 10 })).rejects.toThrowError('No users found');
    });
  });
});
