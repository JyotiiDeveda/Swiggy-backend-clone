const {
  create,
  get,
  getAll,
  update,
  remove,
  uploadImage,
} = require('../../src/services/restaurants.service');
const { sequelize } = require('../../src/models');
const models = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const { uploadToS3 } = require('../../src/helpers/image-upload.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/helpers/image-upload.helper');

describe('Restaurant Service Tests', () => {
  let transactionMock;
  let restaurantId;
  // let userId;
  let file;

  beforeEach(() => {
    restaurantId = faker.string.uuid();
    // userId = faker.string.uuid();
    file = {
      path: faker.system.filePath(),
      originalname: faker.system.fileName(),
    };

    transactionMock = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.transaction = jest.fn().mockResolvedValue(transactionMock);

    // Mock the models and other dependencies
    models.Restaurant.create = jest.fn();
    models.Restaurant.findOne = jest.fn();
    models.Restaurant.update = jest.fn();
    models.Restaurant.findAll = jest.fn();
    models.Restaurant.destroy = jest.fn();
    models.Rating.findOne = jest.fn();
    models.Dish.findOne = jest.fn();
    models.Dish.findAll = jest.fn();
    uploadToS3.mockResolvedValue('https://fake-url.com/image.jpg');
  });

  commonHelpers.customError.mockImplementation(errorMessage => {
    const error = new Error(errorMessage);
    throw error;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a restaurant', async () => {
      const data = {
        name: 'Test Restaurant',
        description: 'Delicious food',
        category: 'Fast Food',
        address: { city: 'New York', pincode: '10001' },
      };

      models.Restaurant.findOne.mockResolvedValue(null); // No restaurant exists with this name and address
      models.Restaurant.create.mockResolvedValue({ id: restaurantId, ...data });

      const newRestaurant = await create(data);

      expect(newRestaurant).toHaveProperty('id');
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if restaurant already exists', async () => {
      const data = {
        name: 'Test Restaurant',
        description: 'Delicious food',
        category: 'Fast Food',
        address: { city: 'New York', pincode: '10001' },
      };

      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId, deleted_at: null }); // Restaurant exists and is active

      await expect(create(data)).rejects.toThrowError('Restaurant already exists');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });

    it('should restore restaurant if it was previously deleted', async () => {
      const data = {
        name: 'Test Restaurant',
        description: 'Delicious food',
        category: 'Fast Food',
        address: { city: 'New York', pincode: '10001' },
      };

      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId, deleted_at: '2023-01-01' }); // Restaurant exists and is deleted
      models.Restaurant.restore.mockResolvedValue([{}]);

      const restoredRestaurant = await create(data);

      expect(restoredRestaurant).toHaveProperty('id');
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if restaurant restoration fails', async () => {
      const data = {
        name: 'Test Restaurant',
        description: 'Delicious food',
        category: 'Fast Food',
        address: { city: 'New York', pincode: '10001' },
      };

      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId, deleted_at: '2023-01-01' }); // Restaurant exists and is deleted
      models.Restaurant.restore.mockResolvedValue([]); // Restoration fails

      await expect(create(data)).rejects.toThrowError('Restaurant name should be unique');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should successfully get a restaurant', async () => {
      const restaurant = {
        id: restaurantId,
        name: 'Test Restaurant',
        avg_rating: 4.5,
        ratings_cnt: 10,
        dishes: [],
        ratings: [],
      };

      models.Restaurant.findOne.mockResolvedValue(restaurant);

      const result = await get(restaurantId);

      expect(result).toHaveProperty('id', restaurantId);
    });

    it('should throw error if restaurant not found', async () => {
      models.Restaurant.findOne.mockResolvedValue(null);

      await expect(get(restaurantId)).rejects.toThrowError('No restaurant found');
    });

    it('should throw error if restaurantId is not provided', async () => {
      await expect(get()).rejects.toThrowError('Restaurant id not found');
    });
  });

  describe('getAll', () => {
    it('should successfully get a list of restaurants', async () => {
      const queryOptions = { city: 'New York', page: 1, limit: 10 };
      const restaurants = [{ id: restaurantId, name: 'Test Restaurant' }];

      models.Restaurant.findAll.mockResolvedValue(restaurants);

      const result = await getAll(queryOptions);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });

    it('should throw error if no restaurants found', async () => {
      const queryOptions = { city: 'Nonexistent City' };

      models.Restaurant.findAll.mockResolvedValue([]);

      await expect(getAll(queryOptions)).rejects.toThrowError('No restaurants found');
    });
  });

  describe('update', () => {
    it('should successfully update a restaurant', async () => {
      const payload = {
        name: 'Updated Restaurant',
        description: 'Updated description',
        category: 'Updated category',
        address: { city: 'Updated City', pincode: '20001' },
      };

      models.Restaurant.update.mockResolvedValue([1, [{ id: restaurantId, ...payload }]]);

      const updatedRestaurant = await update(restaurantId, payload);

      expect(updatedRestaurant).toHaveProperty('id', restaurantId);
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if restaurant not found for update', async () => {
      const payload = {
        name: 'Updated Restaurant',
        description: 'Updated description',
        category: 'Updated category',
        address: { city: 'Updated City', pincode: '20001' },
      };

      models.Restaurant.update.mockResolvedValue([0, []]);

      await expect(update(restaurantId, payload)).rejects.toThrowError('Restaurant not found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete a restaurant', async () => {
      models.Restaurant.destroy.mockResolvedValue(1);

      await remove(restaurantId);

      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if restaurant not found for deletion', async () => {
      models.Restaurant.destroy.mockResolvedValue(0);

      await expect(remove(restaurantId)).rejects.toThrowError('No restaurant found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('uploadImage', () => {
    it('should successfully upload an image for a restaurant', async () => {
      models.Restaurant.findOne.mockResolvedValue({ id: restaurantId, image_url: '' });

      const restaurant = await uploadImage(restaurantId, file);

      expect(restaurant.image_url).toBe('https://fake-url.com/image.jpg');
      expect(transactionMock.commit).toHaveBeenCalled();
    });

    it('should throw error if restaurant not found for image upload', async () => {
      models.Restaurant.findOne.mockResolvedValue(null);

      await expect(uploadImage(restaurantId, file)).rejects.toThrowError('Restaurant not found');
      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });
});
