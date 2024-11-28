const { generateOTP } = require('../../src/helpers/otp.helper');
const otpGenerator = require('otp-generator');

jest.mock('otp-generator');

describe('generateOTP Function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a 6-digit numeric OTP', () => {
    // Mock the otp-generator to return a predictable value
    const mockOtp = '123456';
    otpGenerator.generate.mockReturnValue(mockOtp);

    const otp = generateOTP();

    expect(otpGenerator.generate).toHaveBeenCalledWith(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    expect(otp).toBe(mockOtp);
    expect(otp).toHaveLength(6);
    expect(/^\d+$/.test(otp)).toBe(true); // Ensure the OTP contains only numeric characters
  });

  it('should return a string', () => {
    const mockOtp = '654321';
    otpGenerator.generate.mockReturnValue(mockOtp);

    const otp = generateOTP();

    expect(typeof otp).toBe('string');
  });

  it('should log the OTP to the console', () => {
    const mockOtp = '987654';
    otpGenerator.generate.mockReturnValue(mockOtp);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    generateOTP();

    expect(consoleSpy).toHaveBeenCalledWith('OTP in helper: ', mockOtp);

    consoleSpy.mockRestore(); // Restore original console.log functionality
  });
});
