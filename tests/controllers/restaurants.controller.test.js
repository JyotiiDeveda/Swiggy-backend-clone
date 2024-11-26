const { faker } = require('@faker-js/faker');
const restaurantServices = require('../../src/services/restaurants.service');
const ratingServices = require('../../src/services/ratings.service');
const dishServices = require('../../src/services/dishes.service');
const commonHelper = require('../../src/helpers/common.helper');
const restaurantControllers = require('../../src/controllers/restaurants.controller');
const imagesController = require('../../src/controllers/images.controller');
const constants = require('../../src/constants/constants');

jest.mock('../../src/services/restaurants.service');
jest.mock('../../src/services/ratings.service');
jest.mock('../../src/services/dishes.service');
jest.mock('../../src/helpers/common.helper');

describe('create Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: { name: faker.company.name(), location: faker.location.city() }, // Fake restaurant data
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should create a restaurant successfully', async () => {
    const restaurant = {
      id: faker.string.uuid(),
      name: req.body.name,
      location: req.body.location,
    };

    restaurantServices.create.mockResolvedValue(restaurant);

    await restaurantControllers.create(req, res, next);

    expect(restaurantServices.create).toHaveBeenCalledWith(req.body);
    expect(res.statusCode).toBe(201);
    expect(res.data).toEqual(restaurant);
    expect(res.message).toBe('Restaurant created successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when creating a restaurant fails', async () => {
    const errorMessage = 'Failed to create restaurant';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    restaurantServices.create.mockRejectedValue(error);

    await restaurantControllers.create(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('get Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() }, // Fake restaurant ID
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should fetch a restaurant successfully', async () => {
    const restaurant = {
      id: req.params.id,
      name: faker.company.name(),
      location: faker.location.city(),
    };

    restaurantServices.get.mockResolvedValue(restaurant);

    await restaurantControllers.get(req, res, next);

    expect(restaurantServices.get).toHaveBeenCalledWith(req.params.id);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(restaurant);
    expect(res.message).toBe('Fetched restaurant successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching a restaurant fails', async () => {
    const errorMessage = 'Failed to fetch restaurant';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    restaurantServices.get.mockRejectedValue(error);

    await restaurantControllers.get(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('getAll Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: { page: faker.number.int({ min: 1, max: 5 }), limit: faker.number.int({ min: 5, max: 20 }) }, // Fake query params
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should fetch all restaurants successfully', async () => {
    const restaurants = [
      { id: faker.string.uuid(), name: faker.company.name(), location: faker.location.city() },
      { id: faker.string.uuid(), name: faker.company.name(), location: faker.location.city() },
    ];

    restaurantServices.getAll.mockResolvedValue(restaurants);

    await restaurantControllers.getAll(req, res, next);

    expect(restaurantServices.getAll).toHaveBeenCalledWith(req.query);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(restaurants);
    expect(res.message).toBe('Fetched restaurants data successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching all restaurants fails', async () => {
    const errorMessage = 'Failed to fetch restaurants';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    restaurantServices.getAll.mockRejectedValue(error);

    await restaurantControllers.getAll(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('update Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() }, // Fake restaurant ID
      body: { name: faker.company.name(), location: faker.location.city() }, // Fake restaurant data
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should update a restaurant successfully', async () => {
    const updatedRestaurant = {
      id: req.params.id,
      name: req.body.name,
      location: req.body.location,
    };

    restaurantServices.update.mockResolvedValue(updatedRestaurant);

    await restaurantControllers.update(req, res, next);

    expect(restaurantServices.update).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(updatedRestaurant);
    expect(res.message).toBe('Restaurant updated successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when updating a restaurant fails', async () => {
    const errorMessage = 'Failed to update restaurant';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    restaurantServices.update.mockRejectedValue(error);

    await restaurantControllers.update(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('remove Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() }, // Fake restaurant ID
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should delete a restaurant successfully', async () => {
    restaurantServices.remove.mockResolvedValue();

    await restaurantControllers.remove(req, res, next);

    expect(restaurantServices.remove).toHaveBeenCalledWith(req.params.id);
    expect(res.statusCode).toBe(204);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when deleting a restaurant fails', async () => {
    const errorMessage = 'Failed to delete restaurant';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    restaurantServices.remove.mockRejectedValue(error);

    await restaurantControllers.remove(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('createRestaurantsRating Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() }, // Fake restaurant ID
      user: { userId: faker.string.uuid() }, // Fake user ID
      body: { rating: faker.number.int({ min: 1, max: 5 }) }, // Fake rating
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should create a restaurant rating successfully', async () => {
    const newRating = {
      restaurantId: req.params.id,
      rating: req.body.rating,
      userId: req.user.userId,
    };

    ratingServices.createRestaurantsRating.mockResolvedValue(newRating);

    await restaurantControllers.createRestaurantsRating(req, res, next);

    expect(ratingServices.createRestaurantsRating).toHaveBeenCalledWith(
      req.params.id,
      req.body.rating,
      req.user.userId
    );
    expect(res.statusCode).toBe(201);
    expect(res.data).toEqual(newRating);
    expect(res.message).toBe('Restaurant rated successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when creating a restaurant rating fails', async () => {
    const errorMessage = 'Failed to rate restaurant';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    ratingServices.createRestaurantsRating.mockRejectedValue(error);

    await restaurantControllers.createRestaurantsRating(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('deleteRating Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { restaurantId: faker.string.uuid(), ratingId: faker.string.uuid() }, // Fake restaurant and rating IDs
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should delete a restaurant rating successfully', async () => {
    ratingServices.deleteRating.mockResolvedValue();

    await restaurantControllers.deleteRating(req, res, next);

    expect(ratingServices.deleteRating).toHaveBeenCalledWith(
      req.params.ratingId,
      constants.ENTITY_TYPE.RESTAURANT,
      req.params.restaurantId
    );
    expect(res.statusCode).toBe(204);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when deleting a restaurant rating fails', async () => {
    const errorMessage = 'Failed to delete rating';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    ratingServices.deleteRating.mockRejectedValue(error);

    await restaurantControllers.deleteRating(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('createRestaurantsDish Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: faker.string.uuid() }, // Fake restaurant ID
      body: { name: faker.food.dish() }, // Fake dish data
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should create a restaurant dish successfully', async () => {
    const dish = {
      id: faker.string.uuid(),
      restaurantId: req.params.id,
      name: req.body.name,
    };

    dishServices.create.mockResolvedValue(dish);

    await restaurantControllers.createRestaurantsDish(req, res, next);

    expect(dishServices.create).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.statusCode).toBe(201);
    expect(res.data).toEqual(dish);
    expect(res.message).toBe('Dish created successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when creating a dish fails', async () => {
    const errorMessage = 'Failed to create dish';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    dishServices.create.mockRejectedValue(error);

    await restaurantControllers.createRestaurantsDish(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});

describe('uploadImage Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: { entityType: constants.ENTITY_TYPE.RESTAURANT, entityId: faker.string.uuid() },
      file: { buffer: faker.image.avatar() }, // Fake image file
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should upload restaurant image successfully', async () => {
    const updatedRestaurant = {
      id: req.body.entityId,
      imageUrl: faker.image.url(),
    };

    restaurantServices.uploadImage.mockResolvedValue(updatedRestaurant);

    await imagesController.uploadImage(req, res, next);

    expect(restaurantServices.uploadImage).toHaveBeenCalledWith(req.body.entityId, req.file);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual(updatedRestaurant);
    expect(res.message).toBe('Image uploaded successfully');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle error when uploading restaurant image fails', async () => {
    const errorMessage = 'Failed to upload image';
    const error = new Error(errorMessage);
    error.statusCode = 400;
    restaurantServices.uploadImage.mockRejectedValue(error);

    await imagesController.uploadImage(req, res, next);

    expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, 400);
  });
});
