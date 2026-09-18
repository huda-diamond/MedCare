const Appointment = require('../models/Appointment');
const User = require('../models/User');

const bookAppointment = async (req, res, next) => {
  try {
    const { doctor: doctorId, date, slot, symptoms, notes } = req.body;
    const patientId = req.user._id;

    // 1. Verify doctor exists and has role 'doctor'
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found or invalid' });
    }

    // 2. Prevent double booking on same slot/day for this doctor
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      slot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This appointment slot has already been booked' });
    }

    // 3. Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      slot,
      symptoms,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patient: req.user._id })
        .populate('doctor', 'name email phone doctorProfile')
        .sort({ date: 1, slot: 1 });
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctor: req.user._id })
        .populate('patient', 'name email phone gender age')
        .sort({ date: 1, slot: 1 });
    } else {
      // Admins see all
      appointments = await Appointment.find({})
        .populate('patient', 'name email phone')
        .populate('doctor', 'name email doctorProfile')
        .sort({ createdAt: -1 });
    }

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body; // e.g. status: 'confirmed', 'completed', 'cancelled'
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization checks:
    // Patients can only cancel their own appointments
    if (req.user.role === 'patient') {
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You cannot manage this appointment' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ message: 'Patients are only permitted to cancel appointments' });
      }
    }

    // Doctors can confirm, complete, or reject/cancel their own appointments
    if (req.user.role === 'doctor') {
      if (appointment.doctor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You cannot manage this appointment' });
      }
    }

    // Admins can do anything

    // Update fields
    appointment.status = status || appointment.status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();
    
    // Fetch and populate for clean UI update
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone gender age')
      .populate('doctor', 'name email phone doctorProfile');

    res.json({
      message: `Appointment status updated to ${appointment.status}`,
      appointment: updatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus
};
