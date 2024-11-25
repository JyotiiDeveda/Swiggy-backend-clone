const {
  createRestaurantsRating,
  createDishesRating,
  deleteRestaurantRating,
  deleteDishRating,
} = require('../../src/services/ratings.service');
const { sequelize } = require('../../src/models');
const models = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
// const constants = require('../../src/constants/constants');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Rating Service Tests', () => {
  let transactionMock;
  // let currentUser;
  let userId;
  let restaurantId;
  let dishId;
  let ratingValue;

  beforeEach(() => {
    // Create fake data
    // currentUser = {
    //   userId: faker.string.uuid(),
    //   userRoles: [constants.ROLES.ADMIN],
    //   email: faker.internet.email(),
    // };
    userId = faker.string.uuid();
    restaurantId = faker.string.uuid();
    dishId = faker.string.uuid();
    ratingValue = 5;

    transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.transaction = jest.fn().mockResolvedValue(transactionMock);

    // Mock the models and other dependencies
    models.Restaurant.findOne = jest.fn();
    models.Dish.findOne = jest.fn();
    models.Rating.create = jest.fn();
    models.Rating.findOne = jest.fn();
    models.Order.findOne = jest.fn();
    models.Rating.destroy = jest.fn();
    models.Cart.findOne = jest.fn();

    commonHelpers.customError = jest.fn().mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRestaurantsRating', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create a restaurant rating', async () => {
      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      models.Rating.findOne.mockResolvedValue(null);
      models.Order.findOne.mockResolvedValue({});

      models.Rating.create.mockResolvedValue({ id: faker.string.uuid(), rating: ratingValue });

      const newRating = await createRestaurantsRating(restaurantId, ratingValue, userId);

      expect(newRating).toHaveProperty('id');
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if restaurant does not exist', async () => {
      models.Restaurant.findOne.mockResolvedValue(null);

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrowError(
        'No restaurant found with given id'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if user has already rated the restaurant', async () => {
      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      models.Rating.findOne.mockResolvedValue({ id: faker.string.uuid() });

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrowError(
        'User has already rated the restaurant'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if user has not ordered from the restaurant', async () => {
      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      models.Rating.findOne.mockResolvedValue(null);
      models.Order.findOne.mockResolvedValue(null);

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrowError(
        "User has no orders from the restaurant.. can't rate"
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if rating creation fails', async () => {
      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId });

      models.Rating.findOne.mockResolvedValue(null);
      models.Order.findOne.mockResolvedValue({});
      models.Rating.create.mockRejectedValue(new Error('Failed to create rating'));

      await expect(createRestaurantsRating(restaurantId, ratingValue, userId)).rejects.toThrowError(
        'Failed to create rating'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('createDishesRating', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create a dish rating', async () => {
      models.Dish.findOne.mockResolvedValue({ id: dishId });
      models.Rating.findOne.mockResolvedValue(null);
      models.Order.findOne.mockResolvedValue({});

      models.Rating.create.mockResolvedValue({ id: faker.string.uuid(), rating: ratingValue });

      const newRating = await createDishesRating(dishId, ratingValue, userId);

      expect(newRating).toHaveProperty('id');
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if dish does not exist', async () => {
      models.Dish.findOne.mockResolvedValue(null);

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrowError(
        'Dish does not exist'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if user has already rated the dish', async () => {
      models.Dish.findOne.mockResolvedValue({ id: dishId });
      models.Rating.findOne.mockResolvedValue({ id: faker.string.uuid() });

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrowError(
        'User has already rated the dish'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if user has not ordered the dish', async () => {
      models.Dish.findOne.mockResolvedValue({ id: dishId });
      models.Rating.findOne.mockResolvedValue(null);
      models.Order.findOne.mockResolvedValue(null);

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrowError(
        "User has not ordered the dish yet... can't rate"
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should throw error if rating creation fails', async () => {
      models.Dish.findOne.mockResolvedValue({ id: dishId });
      models.Rating.findOne.mockResolvedValue(null);
      models.Order.findOne.mockResolvedValue({});
      models.Rating.create.mockRejectedValue(new Error('Failed to create rating')); // Simulating failure

      await expect(createDishesRating(dishId, ratingValue, userId)).rejects.toThrowError(
        'Failed to create rating'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteRestaurantRating', () => {
    it('should delete a restaurant rating', async () => {
      const ratingId = faker.string.uuid();
      models.Rating.destroy.mockResolvedValue(1);

      await deleteRestaurantRating(restaurantId, ratingId);

      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if no rating found for restaurant', async () => {
      const ratingId = faker.string.uuid();
      models.Rating.destroy.mockResolvedValue(0);

      await expect(deleteRestaurantRating(restaurantId, ratingId)).rejects.toThrowError(
        'No rating found for the restaurant'
      );
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteDishRating', () => {
    it('should delete a dish rating', async () => {
      const ratingId = faker.string.uuid();
      models.Rating.destroy.mockResolvedValue(1);

      await deleteDishRating(dishId, ratingId);

      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if no rating found for dish', async () => {
      const ratingId = faker.string.uuid();
      models.Rating.destroy.mockResolvedValue(0);

      await expect(deleteDishRating(dishId, ratingId)).rejects.toThrowError('No rating found for the dish');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });
});
