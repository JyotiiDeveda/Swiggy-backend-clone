const { faker } = require('@faker-js/faker');
const userServices = require('../../src/services/users.service');
const orderServices = require('../../src/services/orders.service');
const commonHelper = require('../../src/helpers/common.helper');
const userControllers = require('../../src/controllers/users.controller');

jest.mock('../../src/services/users.service');
jest.mock('../../src/services/orders.service');
jest.mock('../../src/helpers/common.helper');

describe('addAddress Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: { address: faker.location.streetAddress() },
      params: { id: faker.string.uuid() },
      user: { userId: faker.string.uuid() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should add address successfully', async () => {
    const updatedUser = {
      id: req.params.id,
      address: req.body.address,
    };

    userServices.addAddress.mockResolvedValue(updatedUser);

    await userControllers.addAddress(req, res, next);

    expect(userServices.addAddress).toHaveBeenCalledWith(req.user, req.params.id, req.body.address);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(updatedUser);
    expect(res.message).toBe('Address updated successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when adding address fails', async () => {
    const errorMessage = 'Failed to add address';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    userServices.addAddress.mockRejectedValue(error);

    await userControllers.addAddress(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('addDeliveryPartner Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: { roleId: faker.string.uuid() },
      params: { userId: faker.string.uuid() },
      user: { userId: faker.string.uuid() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should assign delivery partner role successfully', async () => {
    userServices.assignRole.mockResolvedValue();

    await userControllers.assignRole(req, res, next);

    expect(userServices.assignRole).toHaveBeenCalledWith(req.user, req.params.userId, req.body.roleId);
    expect(res.statusCode).toBe(201);
    expect(res.message).toBe('Assigned role successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when adding delivery partner fails', async () => {
    const errorMessage = 'Failed to add delivery partner';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    userServices.assignRole.mockRejectedValue(error);

    await userControllers.assignRole(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('removeAccount Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() },
      user: { userId: faker.string.uuid() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should remove user account successfully', async () => {
    userServices.removeAccount.mockResolvedValue();

    await userControllers.removeAccount(req, res, next);

    expect(userServices.removeAccount).toHaveBeenCalledWith(req.user, req.params.id);
    expect(res.statusCode).toBe(204);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when removing user account fails', async () => {
    const errorMessage = 'Failed to delete user';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    userServices.removeAccount.mockRejectedValue(error);

    await userControllers.removeAccount(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('get Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() },
      user: { userId: faker.string.uuid() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should fetch user details successfully', async () => {
    const userDetails = {
      id: req.params.id,
      name: faker.person.firstName(),
      email: faker.internet.email(),
    };

    userServices.get.mockResolvedValue(userDetails);

    await userControllers.get(req, res, next);

    expect(userServices.get).toHaveBeenCalledWith(req.params.id);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(userDetails);
    expect(res.message).toBe('Fetched user details successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching user details fails', async () => {
    const errorMessage = 'Failed to fetch user details';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    userServices.get.mockRejectedValue(error);

    await userControllers.get(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('getAll Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: { page: faker.number.int({ min: 1, max: 5 }), limit: faker.number.int({ min: 5, max: 20 }) },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should fetch all users successfully', async () => {
    const users = [
      { id: faker.string.uuid(), name: faker.person.firstName() },
      { id: faker.string.uuid(), name: faker.person.firstName() },
    ];

    userServices.getAll.mockResolvedValue(users);

    await userControllers.getAll(req, res, next);

    expect(userServices.getAll).toHaveBeenCalledWith(req.query);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(users);
    expect(res.message).toBe('Fetched users successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching all users fails', async () => {
    const errorMessage = 'Failed to fetch users';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    userServices.getAll.mockRejectedValue(error);

    await userControllers.getAll(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('placeOrder Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() },
      user: { userId: faker.string.uuid() },
      body: { items: [{ dishId: faker.string.uuid(), quantity: 2 }] },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should place order successfully', async () => {
    const order = {
      id: faker.string.uuid(),
      userId: req.params.id,
      items: req.body.items,
    };

    orderServices.placeOrder.mockResolvedValue(order);

    await userControllers.placeOrder(req, res, next);

    expect(orderServices.placeOrder).toHaveBeenCalledWith(req.user, req.params.id, req.body);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(order);
    expect(res.message).toBe('Placed order successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when placing order fails', async () => {
    const errorMessage = 'Failed to place order';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    orderServices.placeOrder.mockRejectedValue(error);

    await userControllers.placeOrder(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('getOrder Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { userId: faker.string.uuid(), orderId: faker.string.uuid() },
      user: { userId: faker.string.uuid() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should fetch order details successfully', async () => {
    const order = {
      id: req.params.orderId,
      userId: req.params.userId,
      items: [{ dishId: faker.string.uuid(), quantity: 2 }],
    };

    orderServices.getOrder.mockResolvedValue(order);

    await userControllers.getOrder(req, res, next);

    expect(orderServices.getOrder).toHaveBeenCalledWith(req.user, req.params.userId, req.params.orderId);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(order);
    expect(res.message).toBe('Fetched order successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching order fails', async () => {
    const errorMessage = 'Failed to fetch order';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    orderServices.getOrder.mockRejectedValue(error);

    await userControllers.getOrder(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});
