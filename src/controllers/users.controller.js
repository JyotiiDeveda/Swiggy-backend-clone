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

// admin can assign a delivery partner role to a reistered user
const addDeliveryPartner = async (req, res) => {
  try {
    const userId = req.params['userid'];
    const roleId = req.params['roleid'];

    await userServices.assignRole(userId, roleId);
    return commonHelper.customResponseHandler(res, 'Added delivery partner successfully', 201);
  } catch (err) {
    console.log('Error in adding delivery partner: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = { addAddress, addDeliveryPartner };
