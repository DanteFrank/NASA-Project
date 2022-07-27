const DEFAULT_LIMIT_NUMBER = 0;
const DEFUALT_PAGE_NUMBER = 1;
function getPagination(query) {
  const page = Math.abs(query.page) || DEFUALT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_LIMIT_NUMBER;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
}

module.exports = {
  getPagination,
};
