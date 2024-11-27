const { getOrders } = require('../../src/helpers/orders.helper');
const { Order } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('getOrders Function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockOptions = { where: { userId: '123' } };
  const mockPage = 1;
  const mockLimit = 10;

  describe('Success Cases', () => {
    it('should return orders with pagination if orders are found', async () => {
      const mockOrdersData = {
        count: 20,
        rows: [
          { id: 1, userId: '123', status: 'delivered' },
          { id: 2, userId: '123', status: 'pending' },
        ],
      };

      Order.findAndCountAll.mockResolvedValue(mockOrdersData);

      const result = await getOrders(mockOptions, mockPage, mockLimit);

      expect(Order.findAndCountAll).toHaveBeenCalledWith(mockOptions);
      expect(result).toHaveProperty('rows', mockOrdersData.rows);
      expect(result.pagination).toEqual({
        totalRecords: 20,
        currentPage: mockPage,
        recordsPerPage: mockLimit,
        noOfPages: 2,
      });
    });
  });

  describe('Failure Cases', () => {
    it('should throw an error if no orders are found', async () => {
      Order.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      commonHelpers.customError.mockImplementation((msg, statusCode) => {
        const error = new Error(msg);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(getOrders(mockOptions, mockPage, mockLimit)).rejects.toThrowError('Orders not found');
      expect(commonHelpers.customError).toHaveBeenCalledWith('Orders not found', 404);
    });

    it('should handle unexpected errors during database query', async () => {
      const mockError = new Error('Database query failed');
      Order.findAndCountAll.mockRejectedValue(mockError);

      await expect(getOrders(mockOptions, mockPage, mockLimit)).rejects.toThrowError('Database query failed');
    });
  });
});
