const validateSchemas = (schema, payload) => {
  const { error, value } = schema.validate(payload);

  if (error) {
    console.log('error: ', typeof error);
    const errMsg =
      error.details
        .map(detail => detail.message)
        .join(', ')
        .replaceAll(`"`, '') || 'Otp Validation failed';

    return [false, errMsg];
  }
  return [true, value];
};

module.exports = { validateSchemas };
