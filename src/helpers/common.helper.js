const customError = (msg, statusCode = 400) => {
  const error = new Error(msg);
  error.statusCode = statusCode;
  return error;
};

const customResponseHandler = (res, message, statusCode = 200, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: data,
  });
};

const customErrorHandler = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = { customError, customResponseHandler, customErrorHandler };
