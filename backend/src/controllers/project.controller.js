const catchAsync = require('../utils/catchAsync');
const projectService = require('../services/project.service');
const { buildPaginationOptions, paginatedResponse } = require('../utils/pagination');

const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    data: { project },
  });
});

const getProjects = catchAsync(async (req, res) => {
  const paginationOptions = buildPaginationOptions(req.query);
  const { rows, count } = await projectService.getProjects(req.user.id, paginationOptions);

  res.status(200).json({
    status: 'success',
    ...paginatedResponse(rows, count, paginationOptions.page, paginationOptions.limit),
  });
});

const getProjectById = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(parseInt(req.params.id), req.user.id);

  res.status(200).json({
    status: 'success',
    data: { project },
  });
});

const updateProject = catchAsync(async (req, res) => {
  const project = await projectService.updateProject(parseInt(req.params.id), req.body, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { project },
  });
});

const deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProject(parseInt(req.params.id), req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Project deleted successfully',
  });
});

const addMember = catchAsync(async (req, res) => {
  const member = await projectService.addMember(
    parseInt(req.params.id),
    req.body.userId,
    req.body.role || 'MEMBER',
    req.user.id
  );

  res.status(201).json({
    status: 'success',
    data: { member },
  });
});

const removeMember = catchAsync(async (req, res) => {
  await projectService.removeMember(
    parseInt(req.params.id),
    parseInt(req.params.userId),
    req.user.id
  );

  res.status(200).json({
    status: 'success',
    message: 'Member removed successfully',
  });
});

const getMembers = catchAsync(async (req, res) => {
  const members = await projectService.getMembers(parseInt(req.params.id));

  res.status(200).json({
    status: 'success',
    data: members,
  });
});

const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await projectService.getDashboardStats(req.user.id);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

module.exports = {
  createProject, getProjects, getProjectById, updateProject, deleteProject,
  addMember, removeMember, getMembers, getDashboardStats,
};
