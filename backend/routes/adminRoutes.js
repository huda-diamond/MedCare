const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, onboardDoctor, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { registerSchema, validateBody } = require('../utils/validation');

// All endpoints in this router are restricted to Admins
router.use(protect, authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.post('/doctors', validateBody(registerSchema), onboardDoctor);
router.delete('/users/:id', deleteUser);

module.exports = router;
