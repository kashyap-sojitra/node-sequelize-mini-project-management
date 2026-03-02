/**
 * Build pagination & sorting options from query params.
 * @param {object} query - req.query
 * @returns {{ limit: number, offset: number, page: number, order: Array }}
 */
const buildPaginationOptions = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const sortField = query.sortBy || 'created_at';
  const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
  const order = [[sortField, sortOrder]];

  return { limit, offset, page, order };
};

/**
 * Format paginated response.
 */
const paginatedResponse = (rows, count, page, limit) => ({
  data: rows,
  total: count,
  page,
  limit,
  totalPages: Math.ceil(count / limit),
});

module.exports = { buildPaginationOptions, paginatedResponse };
