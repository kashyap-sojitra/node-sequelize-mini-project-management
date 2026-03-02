const catchAsync = require('../utils/catchAsync');
const taskService = require('../services/task.service');
const { buildPaginationOptions, paginatedResponse } = require('../utils/pagination');

const createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    data: { task },
  });
});

const getTasks = catchAsync(async (req, res) => {
  const paginationOptions = buildPaginationOptions(req.query);
  const { rows, count } = await taskService.getTasks(req.query, paginationOptions);

  res.status(200).json({
    status: 'success',
    ...paginatedResponse(rows, count, paginationOptions.page, paginationOptions.limit),
  });
});

const getTaskById = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(parseInt(req.params.id));

  res.status(200).json({
    status: 'success',
    data: { task },
  });
});

const getTasksByProject = catchAsync(async (req, res) => {
  const paginationOptions = buildPaginationOptions(req.query);
  const { rows, count } = await taskService.getTasksByProject(
    parseInt(req.params.projectId),
    req.query,
    paginationOptions
  );

  res.status(200).json({
    status: 'success',
    ...paginatedResponse(rows, count, paginationOptions.page, paginationOptions.limit),
  });
});

const updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(parseInt(req.params.id), req.body, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { task },
  });
});

const deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTask(parseInt(req.params.id), req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
  });
});

module.exports = { createTask, getTasks, getTaskById, getTasksByProject, updateTask, deleteTask };
