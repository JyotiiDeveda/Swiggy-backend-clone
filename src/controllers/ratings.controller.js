const ratingServices = require('../services/ratings.service');
const commonHelper = require('../helpers/common.helper');

const remove = async (req, res) => {
  try {
    const ratingId = req.params['id'];
    await ratingServices.remove(ratingId);
    return commonHelper.customResponseHandler(res, 'Deleted rating successfully', 204);
  } catch (err) {
    console.log('Error in deleting rating: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  remove,
};
