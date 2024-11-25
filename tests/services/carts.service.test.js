const cartServices = require('../../src/services/carts.service');
const models = require('../../src/models');
const commonHelper = require('../../src/helpers/common.helper');
const constants = require('../../src/constants/constants');
const { faker } = require('@faker-js/faker');
const { sequelize } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Cart Services', () => {
  let userId;
  let payload;
  let dish;
  let cart;
  let cartDish;
  let transactionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize faker data for testing
    userId = faker.string.uuid();
    payload = {
      dishId: faker.string.uuid(),
      quantity: faker.number.int({ min: 1, max: 5 }),
    };

    dish = {
      id: payload.dishId,
      quantity: 10,
      price: faker.number.int({ min: 10, max: 100 }),
      restaurant_id: faker.string.uuid(),
    };

    cart = {
      id: faker.string.uuid(),
      user_id: userId,
      status: constants.CART_STATUS.ACTIVE,
      dataValues: { restaurant_id: dish.restaurant_id, dishes_cnt: 0 },
    };

    cartDish = {
      cart_id: cart.id,
      dish_id: dish.id,
      price: dish.price,
      quantity: payload.quantity,
    };

    transactionContext = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockReturnValue(transactionContext);

    commonHelper.customError.mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully add a dish to the cart', async () => {
      models.Dish.findOne.mockResolvedValue(dish);
      models.Cart.findOrCreate.mockResolvedValue([cart, true]);
      models.CartDish.create.mockResolvedValue(cartDish);

      const result = await cartServices.addItem(userId, payload);

      expect(models.Dish.findOne).toHaveBeenCalledWith({ where: { id: payload.dishId } });
      expect(models.Cart.findOrCreate).toHaveBeenCalled();
      expect(models.CartDish.create).toHaveBeenCalled();
      expect(result).toEqual(cartDish);
      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw error if dishes from different restaurant are added to cart', async () => {
      const mockDish = {
        id: faker.string.uuid(),
        quantity: 100,
        price: faker.number.int({ min: 10, max: 100 }),
        restaurant_id: faker.string.uuid(),
      };
      models.Dish.findOne.mockResolvedValueOnce(mockDish);
      console.log('CART: ', cart);
      models.Cart.findOrCreate.mockResolvedValue([cart, false]);
      models.CartDish.findOne.mockResolvedValue(null);

      await expect(cartServices.addItem(userId, payload)).rejects.toThrowError(
        'Adding dishes from different restaurant will replace the existing dishes in cart'
      );

      expect(models.Dish.findOne).toHaveBeenCalled();
      expect(transactionContext.rollback).toHaveBeenCalled();
    });

    it('should throw error if dish is not available', async () => {
      models.Dish.findOne.mockResolvedValue(null);

      await expect(cartServices.addItem(userId, payload)).rejects.toThrowError('Dish not available');
    });
  });

  describe('removeItem', () => {
    it('should successfully remove a dish from the cart', async () => {
      models.CartDish.findOne.mockResolvedValue(cartDish);
      models.CartDish.destroy.mockResolvedValue();

      await cartServices.removeItem(userId, cart.id, payload.dish_id);

      expect(models.CartDish.destroy).toHaveBeenCalledWith({
        where: { cart_id: cart.id, dish_id: payload.dish_id },
        transaction: transactionContext,
      });
      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw error if dish not found in the cart', async () => {
      models.CartDish.findOne.mockResolvedValue(null);
      models.CartDish.destroy.mockResolvedValue(0);

      await expect(cartServices.removeItem(userId, cart.id, payload.dish_id)).rejects.toThrowError(
        'Dish not found in the cart'
      );
      expect(transactionContext.rollback).toHaveBeenCalled();
    });
  });

  describe('emptyCart', () => {
    it('should successfully empty the cart', async () => {
      models.Cart.findOne.mockResolvedValue(cart);
      models.CartDish.destroy.mockResolvedValue(5);

      await cartServices.emptyCart(userId, cart.id);

      expect(models.CartDish.destroy).toHaveBeenCalledWith({
        where: { cart_id: cart.id },
        transaction: transactionContext,
      });
      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw error if no active cart exists', async () => {
      models.Cart.findOne.mockResolvedValue(null);

      await expect(cartServices.emptyCart(userId, cart.id)).rejects.toThrowError('No active cart exists');
      expect(transactionContext.rollback).toHaveBeenCalled();
    });

    it('should throw error if no dishes are found in the cart', async () => {
      models.Cart.findOne.mockResolvedValue(cart);
      models.CartDish.destroy.mockResolvedValue(0);

      await expect(cartServices.emptyCart(userId, cart.id)).rejects.toThrowError(
        'No dishes found in the cart'
      );
      expect(transactionContext.rollback).toHaveBeenCalled();
    });
  });
});
