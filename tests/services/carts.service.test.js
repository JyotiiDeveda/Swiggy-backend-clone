const { faker } = require('@faker-js/faker');
const { sequelize } = require('../../src/models');
const cartServices = require('../../src/services/carts.service');
const { Cart, CartDish, Dish, Restaurant } = require('../../src/models');
const commonHelper = require('../../src/helpers/common.helper');
const constants = require('../../src/constants/constants');

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

    Cart.findOne = jest.fn();
    Dish.findOne = jest.fn();
    Restaurant.findOne = jest.fn();

    commonHelper.customError.mockImplementation(errorMessage => {
      const error = new Error(errorMessage);
      throw error;
    });
  });

  describe('getCartDishes', () => {
    const userId = faker.string.uuid();
    const cartId = faker.string.uuid();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return cart dishes successfully', async () => {
      const restaurant = {
        id: faker.string.uuid(),
        name: faker.company.name(),
        category: faker.commerce.department(),
      };

      const dishes = [
        {
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          price: faker.number.int({ min: 10, max: 100 }),
          restaurant,
        },
      ];

      const cart = { id: cartId, user_id: userId };
      const cartDishes = { ...cart, dishes };

      Cart.findOne.mockResolvedValueOnce(cart);
      Cart.findOne.mockResolvedValueOnce(cartDishes);

      const result = await cartServices.getCartDishes(cartId, userId);

      expect(Cart.findOne).toHaveBeenCalledTimes(2);
      expect(Cart.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: cartId, user_id: userId },
      });
      expect(Cart.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: cartId },
        include: {
          model: Dish,
          as: 'dishes',
          include: {
            model: Restaurant,
            attributes: ['id', 'name', 'category'],
          },
        },
      });
      expect(result).toEqual(cartDishes);
    });

    it('should throw error if cart is not found', async () => {
      Cart.findOne.mockResolvedValueOnce(null);

      await expect(cartServices.getCartDishes(cartId, userId)).rejects.toThrowError(
        'No cart found for the user'
      );
      expect(Cart.findOne).toHaveBeenCalledTimes(1);
      expect(Cart.findOne).toHaveBeenCalledWith({
        where: { id: cartId, user_id: userId },
      });
    });

    it('should throw error if cart dishes are not found', async () => {
      const cart = { id: cartId, user_id: userId };

      Cart.findOne.mockResolvedValueOnce(cart);
      Cart.findOne.mockResolvedValueOnce(null);

      await expect(cartServices.getCartDishes(cartId, userId)).rejects.toThrowError('Cart dishes not found');
      expect(Cart.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw error if cart is empty', async () => {
      const cart = { id: cartId, user_id: userId };
      const cartDishes = { ...cart, dishes: [] };

      Cart.findOne.mockResolvedValueOnce(cart);
      Cart.findOne.mockResolvedValueOnce(cartDishes);

      await expect(cartServices.getCartDishes(cartId, userId)).rejects.toThrowError('Cart is empty');
      expect(Cart.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully add a dish to the cart', async () => {
      Dish.findOne.mockResolvedValue(dish);
      Cart.findOrCreate.mockResolvedValue([cart, true]);
      CartDish.create.mockResolvedValue(cartDish);

      const result = await cartServices.addItem(userId, payload);

      expect(Dish.findOne).toHaveBeenCalledWith({ where: { id: payload.dishId } });
      expect(Cart.findOrCreate).toHaveBeenCalled();
      expect(CartDish.create).toHaveBeenCalled();
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
      Dish.findOne.mockResolvedValueOnce(mockDish);
      console.log('CART: ', cart);
      Cart.findOrCreate.mockResolvedValue([cart, false]);
      CartDish.findOne.mockResolvedValue(null);

      await expect(cartServices.addItem(userId, payload)).rejects.toThrowError(
        'Adding dishes from different restaurant will replace the existing dishes in cart'
      );

      expect(Dish.findOne).toHaveBeenCalled();
      expect(transactionContext.rollback).toHaveBeenCalled();
    });

    it('should throw error if dish is not available', async () => {
      Dish.findOne.mockResolvedValue(null);

      await expect(cartServices.addItem(userId, payload)).rejects.toThrowError('Dish not available');
    });
  });

  describe('removeItem', () => {
    it('should successfully remove a dish from the cart', async () => {
      CartDish.findOne.mockResolvedValue(cartDish);
      CartDish.destroy.mockResolvedValue();

      await cartServices.removeItem(userId, cart.id, payload.dish_id);

      expect(CartDish.destroy).toHaveBeenCalledWith({
        where: { cart_id: cart.id, dish_id: payload.dish_id },
      });
    });

    it('should throw error if dish not found in the cart', async () => {
      CartDish.findOne.mockResolvedValue(null);
      CartDish.destroy.mockResolvedValue(0);

      await expect(cartServices.removeItem(userId, cart.id, payload.dish_id)).rejects.toThrowError(
        'Dish not found in the cart'
      );
    });
  });

  describe('emptyCart', () => {
    it('should successfully empty the cart', async () => {
      Cart.findOne.mockResolvedValue(cart);
      CartDish.destroy.mockResolvedValue(5);

      await cartServices.emptyCart(userId, cart.id);

      expect(CartDish.destroy).toHaveBeenCalledWith({
        where: { cart_id: cart.id },
      });
    });

    it('should throw error if no active cart exists', async () => {
      Cart.findOne.mockResolvedValue(null);

      await expect(cartServices.emptyCart(userId, cart.id)).rejects.toThrowError('No active cart exists');
    });

    it('should throw error if no dishes are found in the cart', async () => {
      Cart.findOne.mockResolvedValue(cart);
      CartDish.destroy.mockResolvedValue(0);

      await expect(cartServices.emptyCart(userId, cart.id)).rejects.toThrowError(
        'No dishes found in the cart'
      );
    });
  });
});
