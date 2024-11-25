const { faker } = require('@faker-js/faker');
const rolesService = require('../../src/services/roles.service');
const commonHelper = require('../../src/helpers/common.helper');
const rolesControllers = require('../../src/controllers/roles.controller');

jest.mock('../../src/services/roles.service');
jest.mock('../../src/helpers/common.helper');

describe('Roles Controller', () => {
  describe('create Controller', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        body: { role: faker.person.jobTitle() },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should create a role successfully', async () => {
      const createdRole = { id: faker.string.uuid(), role: req.body.role };
      rolesService.create.mockResolvedValue(createdRole);

      await rolesControllers.create(req, res, next);

      expect(rolesService.create).toHaveBeenCalledWith(req.body.role);
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(createdRole);
      expect(res.message).toBe('Role created successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when creating a role fails', async () => {
      const errorMessage = 'Failed to create role';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      rolesService.create.mockRejectedValue(error);

      await rolesControllers.create(req, res, next);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('getAll Controller', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should fetch all roles successfully', async () => {
      const roles = [
        { id: faker.string.uuid(), role: faker.person.jobTitle() },
        { id: faker.string.uuid(), role: faker.person.jobTitle() },
      ];
      rolesService.getAll.mockResolvedValue(roles);

      await rolesControllers.getAll(req, res, next);

      expect(rolesService.getAll).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(roles);
      expect(res.message).toBe('Fetched roles successfully');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching roles fails', async () => {
      const errorMessage = 'Failed to fetch roles';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      rolesService.getAll.mockRejectedValue(error);

      await rolesControllers.getAll(req, res, next);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });

  describe('remove Controller', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        params: { id: faker.string.uuid() },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should remove a role successfully', async () => {
      rolesService.remove.mockResolvedValue();

      await rolesControllers.remove(req, res, next);

      expect(rolesService.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.statusCode).toBe(204);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle error when removing a role fails', async () => {
      const errorMessage = 'Failed to remove role';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      rolesService.remove.mockRejectedValue(error);

      await rolesControllers.remove(req, res, next);

      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
    });
  });
});
