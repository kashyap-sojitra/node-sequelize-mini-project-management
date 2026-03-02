const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
