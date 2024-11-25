const { faker } = require('@faker-js/faker');
const ratingServices = require('../../src/services/ratings.service');
const commonHelper = require('../../src/helpers/common.helper');
const dishesController = require('../../src/controllers/dishes.controller');
const restaurantsController = require('../../src/controllers/restaurants.controller');
const dishesService = require('../../src/services/dishes.service');

jest.mock('../../src/services/ratings.service');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/services/dishes.service');

describe('createDishesRating Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { userId: faker.string.uuid() }, // Generate a fake userId
      body: { rating: faker.number.int({ min: 1, max: 5 }) }, // Fake rating
      params: { id: faker.string.uuid() }, // Fake dishId
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  it('should create a rating for a dish successfully', async () => {
    const newRating = {
      ratingId: faker.string.uuid(),
      dishId: req.params.id,
      rating: req.body.rating,
      userId: req.user.userId,
    };

    ratingServices.createDishesRating.mockResolvedValue(newRating);

    await dishesController.createDishesRating(req, res, next);

    expect(ratingServices.createDishesRating).toHaveBeenCalledWith(
      req.params.id,
      req.body.rating,
      req.user.userId
    );
    expect(res.statusCode).toBe(201);
    expect(res.data).toEqual(newRating);
    expect(res.message).toBe('Dish rated successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when creating rating fails', async () => {
    const errorMessage = 'Failed to rate the dish';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    ratingServices.createDishesRating.mockRejectedValue(error);

    await dishesController.createDishesRating(req, res);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('deleteRating Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { userId: faker.string.uuid() }, // Generate a fake userId
      params: { dishId: faker.string.uuid(), ratingId: faker.string.uuid() }, // Fake dishId and ratingId
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  it('should delete a rating successfully', async () => {
    ratingServices.deleteDishRating.mockResolvedValue();

    await dishesController.deleteRating(req, res, next);

    expect(ratingServices.deleteDishRating).toHaveBeenCalledWith(req.params.dishId, req.params.ratingId);

    expect(res.statusCode).toBe(204);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when deleting rating fails', async () => {
    const errorMessage = 'Failed to delete rating';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    ratingServices.deleteDishRating.mockRejectedValue(error);

    await dishesController.deleteRating(req, res);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('get Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { restaurantId: faker.string.uuid(), dishId: faker.string.uuid() }, // Fake dishId
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  it('should get a dish successfully', async () => {
    const dishDetails = { dishId: req.params.id, name: faker.lorem.word() };

    dishesService.get.mockResolvedValue(dishDetails);

    await restaurantsController.getDish(req, res, next);

    expect(dishesService.get).toHaveBeenCalledWith(req.params.restaurantId, req.params.dishId);

    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(dishDetails);
    expect(res.message).toBe('Fetched dish successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching dish fails', async () => {
    const errorMessage = 'Failed to fetch dish';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    dishesService.get.mockRejectedValue(error);

    await restaurantsController.getDish(req, res);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('getAll Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { restaurantId: faker.string.uuid() },
      query: { page: faker.number.int({ min: 1, max: 5 }) },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn(); // Mock for next function
  });

  it('should fetch all dishes successfully', async () => {
    const dishes = [{ dishId: faker.string.uuid(), name: faker.lorem.word() }];

    dishesService.getAll.mockResolvedValue(dishes);

    await restaurantsController.getAllDishes(req, res, next);

    expect(dishesService.getAll).toHaveBeenCalledWith(req.params.restaurantId, req.query);

    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(dishes);
    expect(res.message).toBe('Fetched dishes data successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching all dishes fails', async () => {
    const errorMessage = 'Failed to fetch dishes';
    const error = new Error(errorMessage);
    error.statusCode = 400;

    await dishesService.getAll.mockRejectedValue(error);

    await restaurantsController.getAllDishes(req, res);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('update Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { restaurantId: faker.string.uuid(), dishId: faker.string.uuid() }, // Fake dishId
      body: { name: faker.lorem.word(), description: faker.lorem.sentence() }, // Fake dish update data
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  it('should update a dish successfully', async () => {
    const updatedDish = { dishId: req.params.id, name: req.body.name, description: req.body.description };

    dishesService.update.mockResolvedValue(updatedDish);

    await restaurantsController.updateDish(req, res, next);

    expect(dishesService.update).toHaveBeenCalledWith(req.params.restaurantId, req.params.dishId, req.body);
  });

  it('should handle error when updating dish fails', async () => {
    const errorMessage = 'Failed to update dish';
    const error = new Error(errorMessage);
    error.statusCode = 400;

    dishesService.update.mockRejectedValue(error);

    await restaurantsController.updateDish(req, res);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('remove Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { restaurantId: faker.string.uuid(), dishId: faker.string.uuid() }, // Fake dishId
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should remove a dish successfully', async () => {
    dishesService.remove.mockResolvedValue();

    await restaurantsController.removeDish(req, res, next);

    expect(dishesService.remove).toHaveBeenCalledWith(req.params.restaurantId, req.params.dishId);

    expect(res.statusCode).toBe(204);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when removing dish fails', async () => {
    const errorMessage = 'Failed to delete dish';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    dishesService.remove.mockRejectedValue(error);

    await restaurantsController.removeDish(req, res);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('uploadImage Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { restaurantId: faker.string.uuid(), dishId: faker.string.uuid() },
      file: { path: faker.system.filePath() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should upload an image successfully', async () => {
    const updatedDish = { dishId: req.params.id, image: req.file.path };

    dishesService.uplaodImage.mockResolvedValue(updatedDish);

    await restaurantsController.uplaodDishImage(req, res, next);

    expect(dishesService.uplaodImage).toHaveBeenCalledWith(
      req.params.restaurantId,
      req.params.dishId,
      req.file
    );

    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(updatedDish);
    expect(res.message).toBe('Image uploaded successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when uploading image fails', async () => {
    const errorMessage = 'Failed to upload image';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    dishesService.uplaodImage.mockRejectedValue(error);

    await restaurantsController.uplaodDishImage(req, res);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});
