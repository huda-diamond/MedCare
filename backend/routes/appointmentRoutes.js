const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { bookingSchema, validateBody } = require('../utils/validation');

router.post('/', protect, validateBody(bookingSchema), bookAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
