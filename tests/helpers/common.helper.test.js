const { customError, customResponseHandler, customErrorHandler } = require('../../src/helpers/common.helper');

describe('Common Helper Functions', () => {
  describe('customError', () => {
    it('should return an error object with the provided message and default status code', () => {
      const message = 'An error occurred';
      const error = customError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400); // Default status code
    });

    it('should return an error object with the provided message and custom status code', () => {
      const message = 'Not Found';
      const statusCode = 404;
      const error = customError(message, statusCode);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });
  });

  describe('customResponseHandler', () => {
    it('should send a success response with the given data, message, and status code', () => {
      const mockReq = {};
      const mockRes = {
        statusCode: 200,
        message: 'Operation successful',
        data: { id: 1, name: 'Test' },
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      customResponseHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: mockRes.message,
        data: mockRes.data,
      });
    });
  });

  describe('customErrorHandler', () => {
    it('should send an error response with the given message and default status code', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const message = 'Bad Request';

      customErrorHandler(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(400); // Default status code
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: message,
      });
    });

    it('should send an error response with the given message and custom status code', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const message = 'Unauthorized';
      const statusCode = 401;

      customErrorHandler(mockRes, message, statusCode);

      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: message,
      });
    });
  });
});
