const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, updateDoctorAvailability } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/availability', protect, authorize('doctor'), updateDoctorAvailability);

module.exports = router;
