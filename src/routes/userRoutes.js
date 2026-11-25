const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', require('../controllers/authController').login);
router.get('/me', require('../middlewares/authMiddleware'), (req, res) => {
  res.json({ status: 'success', data: { user: req.user } });
});

module.exports = router;
