const customError = (msg, statusCode = 400) => {
  const error = new Error(msg);
  error.statusCode = statusCode;
  return error;
};

const customResponseHandler = (req, res) => {
  return res.status(res.statusCode).json({
    success: true,
    message: res.message,
    data: res.data,
  });
};

const customErrorHandler = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = { customError, customResponseHandler, customErrorHandler };
