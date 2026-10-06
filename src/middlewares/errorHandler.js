function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  res.status(status).json({
    status: 'error',
    message: status === 500 ? 'Error interno del servidor' : error.message,
  });
}

module.exports = errorHandler;