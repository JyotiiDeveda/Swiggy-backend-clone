const { validateSchemas } = require('../../src/helpers/validate.helper');

describe('validateSchemas Function', () => {
  const mockSchema = {
    validate: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return [true, value] when validation passes', () => {
    const mockPayload = { key: 'value' };
    const mockValue = { key: 'validatedValue' };
    mockSchema.validate.mockReturnValue({ error: null, value: mockValue });

    const result = validateSchemas(mockSchema, mockPayload);

    expect(mockSchema.validate).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual([true, mockValue]);
  });

  it('should return [false, errMsg] when validation fails', () => {
    const mockPayload = { key: 'invalidValue' };
    const mockError = {
      details: [{ message: '"key" must be a valid value' }, { message: '"anotherKey" is required' }],
    };
    mockSchema.validate.mockReturnValue({ error: mockError, value: null });

    const result = validateSchemas(mockSchema, mockPayload);

    expect(mockSchema.validate).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual([false, 'key must be a valid value, anotherKey is required']);
  });

  it('should return default error message if details are missing in the error', () => {
    const mockPayload = { key: 'invalidValue' };
    const mockError = { details: [] };
    mockSchema.validate.mockReturnValue({ error: mockError, value: null });

    const result = validateSchemas(mockSchema, mockPayload);

    expect(mockSchema.validate).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual([false, 'Otp Validation failed']);
  });

  it('should log the validation error to the console', () => {
    const mockPayload = { key: 'invalidValue' };
    const mockError = {
      details: [{ message: '"key" is required' }],
    };
    mockSchema.validate.mockReturnValue({ error: mockError, value: null });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    validateSchemas(mockSchema, mockPayload);

    expect(consoleSpy).toHaveBeenCalledWith('Validation error: ', mockError);

    consoleSpy.mockRestore();
  });
});
