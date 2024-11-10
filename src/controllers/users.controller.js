const userServices = require('../services/users.service');
const commonHelper = require('../helpers/common.helper');

const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.params['id'];
    await userServices.addAddress(userId, address);
    return commonHelper.customResponseHandler(res, 'Address updated successfully', 200);
  } catch (err) {
    console.log('Error in updating address: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = { addAddress };
