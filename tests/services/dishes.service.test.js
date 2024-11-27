const { sequelize } = require('../../src/models');
const { faker } = require('@faker-js/faker');
const { uploadToS3 } = require('../../src/helpers/image-upload.helper');
const dishService = require('../../src/services/dishes.service');
const { User, Cart, Restaurant, CartDish, Dish, Order } = require('../../src/models');
const commonHelper = require('../../src/helpers/common.helper');
const constants = require('../../src/constants/constants');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/helpers/image-upload.helper');

describe('Dish Services', () => {
  let restaurantId;
  let payload;
  let dish;
  let transactionContext;
  let restaurant;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize faker data for testing
    // restaurantId = faker.string.uuid();
    payload = {
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      category: constants.DISH_CATEGORY.VEG,
      price: faker.number.int({ min: 10, max: 100 }),
    };

    restaurant = {
      id: faker.string.uuid(),
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      category: constants.RESTAURANT_CATEGORY.VEG,
    };

    restaurantId = restaurant.id;

    dish = {
      id: faker.string.uuid(),
      restaurant_id: restaurantId,
      name: payload.name,
      description: payload.description,
      type: payload.category.toLowerCase(),
      price: payload.price,
      save: jest.fn(),
    };

    Order.findOne = jest.fn();
    Cart.findOne = jest.fn();
    CartDish.findOne = jest.fn();
    Restaurant.findOne = jest.fn();
    Restaurant.findByPk = jest.fn();
    Order.create = jest.fn();
    Cart.save = jest.fn();
    Dish.save = jest.fn();
    User.findOne = jest.fn();
    Order.destroy = jest.fn();
    Order.update = jest.fn();

    transactionContext = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockReturnValue(transactionContext);

    commonHelper.customError.mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create a dish', async () => {
      Restaurant.findOne.mockResolvedValue(restaurant);
      Dish.findOne.mockResolvedValue(null);
      Dish.create.mockResolvedValue(dish);

      const result = await dishService.create(restaurantId, payload);

      expect(Restaurant.findOne).toHaveBeenCalledWith({ where: { id: restaurant.id } });
      expect(Dish.create).toHaveBeenCalled();
      expect(result).toEqual(dish);
    });

    it('should throw error if restaurant does not exist', async () => {
      Restaurant.findOne.mockResolvedValue(null);

      await expect(dishService.create(restaurantId, payload)).rejects.toThrowError(
        'Restaurant does not exist'
      );
    });

    it('should throw error if dish already exists', async () => {
      Restaurant.findOne.mockResolvedValue({ id: restaurantId });
      Dish.findOne.mockResolvedValue(dish);

      await expect(dishService.create(restaurantId, payload)).rejects.toThrowError('Dish already exists');
    });

    it('should throw error if dish type does not match restaurant category', async () => {
      const restaurant = { id: restaurantId, category: constants.RESTAURANT_CATEGORY.VEG };
      Restaurant.findOne.mockResolvedValue(restaurant);
      Dish.findOne.mockResolvedValue(null);

      payload.category = constants.DISH_CATEGORY.NON_VEG;

      await expect(dishService.create(restaurantId, payload)).rejects.toThrowError(
        'A non-vegetarian dish cannot be added to vegetarian restaurant'
      );
    });
  });

  describe('get', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should successfully get a dish with rating', async () => {
      Dish.findOne.mockResolvedValue(dish);

      const result = await dishService.get({ restaurantId, dishId: dish.id });

      expect(Dish.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { restaurant_id: restaurantId, id: dish.id } })
      );
      expect(result).toEqual(dish);
    });

    it('should throw error if dish not found', async () => {
      Dish.findOne.mockResolvedValue(null);

      await expect(dishService.get(dish.id)).rejects.toThrowError('No dish found');
    });
  });

  describe('getAll', () => {
    let restaurant, dish, restaurantId, queryOptions;

    beforeEach(() => {
      restaurantId = 1;
      restaurant = { id: restaurantId, name: 'Test Restaurant' };
      dish = {
        id: 1,
        name: 'Dhokle',
        type: 'veg',
        price: 10.0,
        averageRating: 4.5,
        ratingsCount: 20,
      };
      queryOptions = {
        name: 'dhokle',
        category: 'veg',
        sortBy: 'price',
        orderBy: 'ASC',
        page: 1,
        limit: 10,
      };

      jest.clearAllMocks();
    });

    it('should successfully get all dishes based on filters', async () => {
      const dishes = [dish];
      const mockCount = 1;

      // Mock Restaurant and Dish models
      Restaurant.findByPk = jest.fn().mockResolvedValue(restaurant);
      Dish.count = jest.fn().mockResolvedValue(mockCount);
      Dish.findAll = jest.fn().mockResolvedValue(dishes);

      const result = await dishService.getAll(restaurantId, queryOptions);

      expect(Restaurant.findByPk).toHaveBeenCalledWith(restaurantId);
      expect(Dish.count).toHaveBeenCalled();
      expect(Dish.findAll).toHaveBeenCalled();

      // Verify the response structure
      expect(result).toEqual({
        rows: dishes,
        pagination: {
          totalRecords: mockCount,
          currentPage: queryOptions.page,
          recordsPerPage: queryOptions.limit,
          noOfPages: Math.ceil(mockCount / queryOptions.limit),
        },
      });
    });

    it('should throw an error if restaurant is not found', async () => {
      Restaurant.findByPk = jest.fn().mockResolvedValue(null); // Mock restaurant not found

      await expect(dishService.getAll(restaurantId, queryOptions)).rejects.toThrowError(
        'Restaurant not found'
      );

      expect(Restaurant.findByPk).toHaveBeenCalledWith(restaurantId);
      expect(Dish.count).not.toHaveBeenCalled();
      expect(Dish.findAll).not.toHaveBeenCalled();
    });

    it('should throw an error if no dishes are found', async () => {
      const mockCount = 0;

      Restaurant.findByPk = jest.fn().mockResolvedValue(restaurant);
      Dish.count = jest.fn().mockResolvedValue(mockCount);
      Dish.findAll = jest.fn().mockResolvedValue([]);

      await expect(dishService.getAll(restaurantId, queryOptions)).rejects.toThrowError(
        'No dishes avaliable in the restaurant'
      );

      expect(Restaurant.findByPk).toHaveBeenCalledWith(restaurantId);
      expect(Dish.count).toHaveBeenCalled();
      expect(Dish.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    let params, payload, dish;

    beforeEach(() => {
      params = { restaurantId: 1, dishId: 101 };
      payload = { name: 'Updated Dish', description: 'Updated Description', category: 'VEG', price: 15.99 };
      dish = {
        id: 101,
        restaurant_id: 1,
        name: 'Original Dish',
        description: 'Original Description',
        type: 'NON-VEG',
        price: 10.99,
        save: jest.fn().mockResolvedValue(), // Mock `save` method
      };
      jest.clearAllMocks();
    });

    it('should successfully update a dish', async () => {
      Dish.findOne = jest.fn().mockResolvedValue(dish);

      const result = await dishService.update(params, payload);

      expect(Dish.findOne).toHaveBeenCalledWith({
        where: { id: params.dishId, restaurant_id: params.restaurantId },
      });

      expect(dish.name).toEqual(payload.name);
      expect(dish.description).toEqual(payload.description);
      expect(dish.type).toEqual(payload.category);
      expect(dish.price).toEqual(payload.price);

      expect(dish.save).toHaveBeenCalled();
      expect(result).toEqual(dish);
    });

    it('should throw an error if the dish is not found', async () => {
      Dish.findOne = jest.fn().mockResolvedValue(null);

      await expect(dishService.update(params, payload)).rejects.toThrowError('Dish not found');

      expect(Dish.findOne).toHaveBeenCalledWith({
        where: { id: params.dishId, restaurant_id: params.restaurantId },
      });
      expect(dish.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully remove a dish', async () => {
      Dish.findOne.mockResolvedValue(dish);
      Dish.destroy.mockResolvedValue(1);

      await dishService.remove({ restaurantId, dishId: dish.id });

      expect(Dish.destroy).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
    });

    it('should throw error if no dish found', async () => {
      Dish.findOne.mockResolvedValue(null);
      Dish.destroy.mockResolvedValue(0);

      await expect(dishService.remove(dish.id)).rejects.toThrowError('Dish not found');
    });
  });

  describe('uploadImage', () => {
    let dish, file, imageUrl;

    beforeEach(() => {
      dish = {
        id: 101,
        image_url: null,
        save: jest.fn().mockResolvedValue(), // Mock the `save` method
      };
      file = { buffer: Buffer.from('image data') };
      imageUrl = 'https://example.com/image.jpg';

      jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should successfully upload an image for a dish', async () => {
      Dish.findOne = jest.fn().mockResolvedValue(dish);
      uploadToS3.mockResolvedValue(imageUrl);

      const result = await dishService.uploadImage(dish.id, file);

      expect(Dish.findOne).toHaveBeenCalledWith({ where: { id: dish.id } });
      expect(uploadToS3).toHaveBeenCalledWith(file, dish.id);
      expect(dish.save).toHaveBeenCalled();
      expect(result.imageUrl).toEqual(imageUrl);
    });

    it('should throw an error if the dish is not found', async () => {
      Dish.findOne = jest.fn().mockResolvedValue(null); // Dish not found

      await expect(dishService.uploadImage(dish.id, file)).rejects.toThrowError('Dish not found');

      expect(Dish.findOne).toHaveBeenCalledWith({ where: { id: dish.id } });
      expect(uploadToS3).not.toHaveBeenCalled();
      expect(dish.save).not.toHaveBeenCalled();
    });
  });
});
