const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validations/auth.validation');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;
