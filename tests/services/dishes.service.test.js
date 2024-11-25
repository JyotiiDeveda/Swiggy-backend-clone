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
      expect(transactionContext.commit).toHaveBeenCalled();
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
        'A non-vegeterian dish cannot be added to vegeterian restaurant'
      );
    });
  });

  describe('get', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should successfully get a dish with rating', async () => {
      Dish.findOne.mockResolvedValue(dish);

      const result = await dishService.get(restaurantId, dish.id);

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
    it('should successfully get all dishes based on filters', async () => {
      const queryOptions = {
        name: 'pizza',
        category: 'veg',
        sortBy: 'price',
        orderBy: '1',
        page: 1,
        limit: 10,
      };
      const dishes = [dish];
      Dish.findAll.mockResolvedValue(dishes);

      const result = await dishService.getAll(restaurantId, queryOptions);

      expect(Dish.findAll).toHaveBeenCalled();
      expect(result).toEqual(dishes);
    });

    it('should throw error if no dishes found', async () => {
      const queryOptions = {
        name: 'pizza',
        category: 'veg',
        sortBy: 'price',
        orderBy: '1',
        page: 1,
        limit: 10,
      };
      Dish.findAll.mockResolvedValue(null);

      await expect(dishService.getAll(restaurantId, queryOptions)).rejects.toThrowError('No dishes found');
    });
  });

  describe('update', () => {
    it('should successfully update a dish', async () => {
      // const updatedDish = { ...dish, ...payload };
      Dish.findOne.mockResolvedValue(dish);

      // const result = await dishService.update(restaurantId, dish.id, payload);

      // expect(Dish.save).toHaveBeenCalled();

      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw error if dish not found', async () => {
      Dish.findOne.mockResolvedValue(null);

      await expect(dishService.update(restaurantId, dish.id, payload)).rejects.toThrowError('Dish not found');
    });
  });

  describe('remove', () => {
    it('should successfully remove a dish', async () => {
      Dish.findOne.mockResolvedValue(dish);
      Dish.destroy.mockResolvedValue(1);

      await dishService.remove(restaurantId, dish.id);

      expect(Dish.destroy).toHaveBeenCalledWith({
        where: { id: dish.id },
        transaction: transactionContext,
      });
      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw error if no dish found', async () => {
      Dish.findOne.mockResolvedValue(null);
      Dish.destroy.mockResolvedValue(0);

      await expect(dishService.remove(dish.id)).rejects.toThrowError('Dish not found');
    });
  });

  describe('uplaodImage', () => {
    it('should successfully upload an image for a dish', async () => {
      const file = { buffer: Buffer.from('image data') };
      const imageUrl = 'https://example.com/image.jpg';

      Dish.findOne.mockResolvedValue(dish);
      uploadToS3.mockResolvedValue(imageUrl);
      Dish.save.mockResolvedValue(dish);

      const result = await dishService.uplaodImage(restaurantId, dish.id, file);

      expect(Dish.findOne).toHaveBeenCalledWith({ where: { id: dish.id, restaurant_id: restaurantId } });
      expect(uploadToS3).toHaveBeenCalledWith(file, dish.id);
      expect(result.image_url).toEqual(imageUrl);
      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw error if dish not found', async () => {
      Dish.findOne.mockResolvedValue(null);

      await expect(dishService.uplaodImage(dish.id, { buffer: Buffer.from('image') })).rejects.toThrowError(
        'Dish not found'
      );
    });
  });
});
