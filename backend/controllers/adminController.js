const User = require('../models/User');
const Appointment = require('../models/Appointment');

const getSystemStats = async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const onboardDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, age, specialization, experience, bio, fee } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user already exists with this email address' });
    }

    const doctor = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      phone,
      gender,
      age,
      doctorProfile: {
        specialization,
        experience,
        bio,
        fee
      }
    });

    res.status(201).json({
      message: 'Doctor account created successfully by Admin',
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }

    // Delete corresponding appointments first
    if (user.role === 'patient') {
      await Appointment.deleteMany({ patient: user._id });
    } else if (user.role === 'doctor') {
      await Appointment.deleteMany({ doctor: user._id });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: `Account for '${user.name}' and all associated appointments successfully deleted` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  onboardDoctor,
  deleteUser
};
