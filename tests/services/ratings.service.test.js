const {
  createRestaurantsRating,
  createDishesRating,
  deleteRating,
} = require('../../src/services/ratings.service');
const { sequelize } = require('../../src/models');
const { faker } = require('@faker-js/faker');
const { Rating, Dish, Restaurant, Order, Cart } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const constants = require('../../src/constants/constants');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

// const { sequelize } = require('../models');
// const { createRestaurantsRating, createDishesRating, deleteRating } = require('../services/rating.service');
// const models = require('../models');
// const commonHelpers = require('../helpers/common.helper');
// const constants = require('../constants/constants');
// const faker = require('@faker-js/faker');

describe('Rating Service Tests', () => {
  let transactionMock;
  let userId;
  let restaurantId;
  let dishId;
  let ratingValue;

  beforeEach(() => {
    userId = faker.string.uuid();
    restaurantId = faker.string.uuid();
    dishId = faker.string.uuid();
    ratingValue = 5;

    transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.transaction = jest.fn().mockResolvedValue(transactionMock);

    // Mock models
    Restaurant.findOne = jest.fn();
    Dish.findOne = jest.fn();
    Rating.findOne = jest.fn();
    Rating.create = jest.fn();
    Rating.destroy = jest.fn();
    Order.findOne = jest.fn();
    Cart.findOne = jest.fn();

    commonHelpers.customError = jest.fn().mockImplementation((errorMessage, statusCode) => {
      const error = new Error(errorMessage);
      error.statusCode = statusCode;
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRestaurantsRating', () => {
    it('should successfully create a restaurant rating', async () => {
      Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      Rating.findOne.mockResolvedValue(null);
      Order.findOne.mockResolvedValue({});

      Rating.create.mockResolvedValue({ id: faker.string.uuid(), rating: ratingValue });

      const newRating = await createRestaurantsRating(restaurantId, ratingValue, userId);

      expect(newRating).toHaveProperty('id');
      expect(Restaurant.findOne).toHaveBeenCalledWith({ where: { id: restaurantId } });
      expect(Rating.create).toHaveBeenCalled();
    });

    it('should throw error if restaurant does not exist', async () => {
      Restaurant.findOne.mockResolvedValue(null);

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrow(
        'No restaurant found with given id'
      );
    });

    it('should throw error if user has already rated the restaurant', async () => {
      Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      Rating.findOne.mockResolvedValue({ id: faker.string.uuid() });

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrow(
        'User has already rated the restaurant'
      );
    });

    it('should throw error if user has not ordered from the restaurant', async () => {
      Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      Rating.findOne.mockResolvedValue(null);
      Order.findOne.mockResolvedValue(null);

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrow(
        "User has no orders from the restaurant, can't rate"
      );
    });

    it('should throw error if rating creation fails', async () => {
      Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      Rating.findOne.mockResolvedValue(null);
      Order.findOne.mockResolvedValue({});
      Rating.create.mockRejectedValue(new Error('Failed to create rating'));

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrow(
        'Failed to create rating'
      );
    });
  });

  describe('createDishesRating', () => {
    it('should successfully create a dish rating', async () => {
      Dish.findOne.mockResolvedValue({ id: dishId });
      Rating.findOne.mockResolvedValue(null);
      Order.findOne.mockResolvedValue({});

      Rating.create.mockResolvedValue({ id: faker.string.uuid(), rating: ratingValue });

      const newRating = await createDishesRating(dishId, ratingValue, userId);

      expect(newRating).toHaveProperty('id');
      expect(Dish.findOne).toHaveBeenCalledWith({ where: { id: dishId } });
      expect(Rating.create).toHaveBeenCalled();
    });

    it('should throw error if dish does not exist', async () => {
      Dish.findOne.mockResolvedValue(null);

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrow('Dish does not exist');
    });

    it('should throw error if user has already rated the dish', async () => {
      Dish.findOne.mockResolvedValue({ id: dishId });
      Rating.findOne.mockResolvedValue({ id: faker.string.uuid() });

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrow(
        'User has already rated the dish'
      );
    });

    it('should throw error if user has not ordered the dish', async () => {
      Dish.findOne.mockResolvedValue({ id: dishId });
      Rating.findOne.mockResolvedValue(null);
      Order.findOne.mockResolvedValue(null);

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrow(
        "User has not ordered the dish yet, can't rate"
      );
    });

    it('should throw error if rating creation fails', async () => {
      Dish.findOne.mockResolvedValue({ id: dishId });
      Rating.findOne.mockResolvedValue(null);
      Order.findOne.mockResolvedValue({});
      Rating.create.mockRejectedValue(new Error('Failed to create rating'));

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrow(
        'Failed to create rating'
      );
    });
  });

  describe('deleteRating', () => {
    it('should successfully delete a rating', async () => {
      Rating.findOne.mockResolvedValue({ id: faker.string.uuid() });
      Rating.destroy.mockResolvedValue(1);

      await deleteRating(faker.string.uuid(), constants.ENTITY_TYPE.RESTAURANT, restaurantId);

      expect(Rating.destroy).toHaveBeenCalled();
    });

    it('should throw error if no rating found for entity', async () => {
      Rating.findOne.mockResolvedValue(null);

      await expect(
        deleteRating(faker.string.uuid(), constants.ENTITY_TYPE.RESTAURANT, restaurantId)
      ).rejects.toThrow('No rating found for the dish');
    });
  });
});
