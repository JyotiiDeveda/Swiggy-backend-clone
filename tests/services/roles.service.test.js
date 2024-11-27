const { faker } = require('@faker-js/faker');
const { sequelize, Role } = require('../../src/models');
const { Op } = require('sequelize');
const roleServices = require('../../src/services/roles.service');
const commonHelpers = require('../../src/helpers/common.helper');

jest.mock('../../src//models');
jest.mock('../../src/helpers/common.helper');

describe('Role Services', () => {
  let transactionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    sequelize.transaction.mockReturnValue(transactionContext);

    commonHelpers.customError.mockImplementation((message, statusCode) => {
      const error = new Error(message);
      error.statusCode = statusCode;
      throw error;
    });
  });

  describe('create', () => {
    it('should successfully create a new role', async () => {
      const roleName = faker.lorem.word();
      Role.findOne.mockResolvedValue(null);
      Role.create.mockResolvedValue({ id: faker.string.uuid(), name: roleName });

      const result = await roleServices.create(roleName);

      expect(Role.findOne).toHaveBeenCalled();
      expect(Role.create).toHaveBeenCalledWith({ name: roleName });
      expect(result).toEqual({ id: expect.any(String), name: roleName });
    });

    it('should throw an error if the role already exists', async () => {
      const roleName = faker.lorem.word();
      Role.findOne.mockResolvedValue({ id: faker.string.uuid(), name: roleName });

      await expect(roleServices.create(roleName)).rejects.toThrowError('Role already exists');

      expect(Role.findOne).toHaveBeenCalledWith({
        where: { name: { [Op.iLike]: roleName } },
      });
    });

    it('should throw an error if role creation fails', async () => {
      const roleName = faker.lorem.word();
      Role.findOne.mockResolvedValue(null);
      Role.create.mockResolvedValue(null);

      await expect(roleServices.create(roleName)).rejects.toThrowError('Failed to create new role');
    });
  });

  describe('getAll', () => {
    it('should return all roles successfully', async () => {
      const roles = [
        { id: faker.string.uuid(), name: faker.lorem.word() },
        { id: faker.string.uuid(), name: faker.lorem.word() },
      ];
      Role.findAll.mockResolvedValue(roles);

      const result = await roleServices.getAll();

      expect(Role.findAll).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });

    it('should throw an error if no roles are found', async () => {
      Role.findAll.mockResolvedValue([]);

      await expect(roleServices.getAll()).rejects.toThrowError('No roles found');

      expect(Role.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete a role', async () => {
      const roleId = faker.string.uuid();
      Role.findByPk.mockResolvedValue({ id: roleId });
      Role.destroy.mockResolvedValue(1);

      await roleServices.remove(roleId);

      expect(Role.findByPk).toHaveBeenCalledWith(roleId);
      expect(Role.destroy).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });

    it('should throw an error if the role does not exist', async () => {
      const roleId = faker.string.uuid();
      Role.findByPk.mockResolvedValue(null);

      await expect(roleServices.remove(roleId)).rejects.toThrowError('Role not found');

      expect(Role.findByPk).toHaveBeenCalledWith(roleId);
    });

    it('should throw an error if deletion fails', async () => {
      const roleId = faker.string.uuid();
      Role.findByPk.mockResolvedValue({ id: roleId });
      Role.destroy.mockRejectedValue(new Error('Error in deleting role'));

      await expect(roleServices.remove(roleId)).rejects.toThrowError('Error in deleting role');

      expect(Role.destroy).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });
  });
});
