const router = require('express').Router();
const authControllers = require('../controllers/auth.controller');
const authValidators = require('../validators/auth.validator');
const authMiddlewares = require('../middlewares/auth.middleware');

router.post('/signup', authValidators.validateSignupPayload, authControllers.signup);
router.post('/send-otp', authValidators.validateEmail, authControllers.sendOtp);
router.post('/login', authValidators.validateLoginSchema, authControllers.login);
router.delete('/logout', authMiddlewares.authenticateToken, authControllers.logout);

module.exports = router;
