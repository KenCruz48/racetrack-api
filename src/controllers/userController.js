const userService = require('../services/userService');

async function registerUser(req, res) {
  const user = await userService.registerUser(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Usuario registrado correctamente',
    data: user,
  });
}

module.exports = {
  registerUser,
};