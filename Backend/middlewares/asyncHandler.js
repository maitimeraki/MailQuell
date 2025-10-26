const asyncHandler = (fn) => (req, res, next) => (new Promise(resolve => resolve(fn(req, res, next))).catch(next));
module.exports = { asyncHandler };