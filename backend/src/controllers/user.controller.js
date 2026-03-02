const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    status: 'success',
    data: users,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(parseInt(req.params.id));

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

module.exports = { getAllUsers, getUserById };
