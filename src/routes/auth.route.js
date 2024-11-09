const router = require('express').Router();
const authControllers = require('../controllers/auth.controller');
const authValidators = require('../validators/auth.validator');

router.post('/signup', authValidators.validateSignupPayload, authControllers.signup);
router.post('/send-otp', authValidators.validateEmail, authControllers.sendOtp);

module.exports = router;
