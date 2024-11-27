const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../../src/helpers/jwt.helper');

jest.mock('jsonwebtoken');

describe('JWT Helper Functions', () => {
  const mockPayload = { id: '123', role: 'user' };
  const mockToken = 'mock.jwt.token';
  const mockSecret = 'mockSecret';
  const mockExpiry = '1h';

  beforeAll(() => {
    // Mock environment variables
    process.env.JWT_SECRET = mockSecret;
    process.env.JWT_EXPIRY = mockExpiry;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a JWT token with the given payload', () => {
      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, mockSecret, { expiresIn: mockExpiry });
      expect(token).toBe(mockToken);
    });

    it('should throw an error if jwt.sign fails', () => {
      jwt.sign.mockImplementation(() => {
        throw new Error('Token generation error');
      });

      expect(() => generateToken(mockPayload)).toThrow('Token generation error');
    });
  });

  describe('verifyToken', () => {
    it('should verify a JWT token and return the decoded payload', () => {
      const decodedPayload = { id: '123', role: 'user' };
      jwt.verify.mockReturnValue(decodedPayload);

      const result = verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
      expect(result).toEqual(decodedPayload);
    });

    it('should throw an error if jwt.verify fails', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken(mockToken)).toThrow('Invalid token');
    });
  });
});
