const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medcare_secret_key', {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, gender, age, medicalHistory, specialization, experience, bio, fee } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userData = {
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      gender,
      age,
      medicalHistory: medicalHistory || []
    };

    // If role is doctor, populate the doctorProfile subdocument
    if (role === 'doctor') {
      if (!specialization || !experience || !bio || !fee) {
        return res.status(400).json({ message: 'Doctor profiles require specialization, experience, bio, and consultation fee' });
      }
      userData.doctorProfile = {
        specialization,
        experience,
        bio,
        fee
      };
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      // Self-healing: ensure doctorProfile exists and is valid for doctors
      if (user.role === 'doctor' && (!user.doctorProfile || !user.doctorProfile.specialization)) {
        user.doctorProfile = {
          specialization: user.doctorProfile?.specialization || 'General Medicine',
          experience: user.doctorProfile?.experience || 1,
          bio: user.doctorProfile?.bio || 'No biography provided yet.',
          fee: user.doctorProfile?.fee || 50,
          availability: user.doctorProfile?.availability || {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
          }
        };
        await user.save();
      }
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.gender = req.body.gender || user.gender;
      user.age = req.body.age !== undefined ? req.body.age : user.age;
      user.medicalHistory = req.body.medicalHistory || user.medicalHistory;

      if (req.body.password) {
        user.password = req.body.password;
      }

      if (user.role === 'doctor') {
        if (!user.doctorProfile) {
          user.doctorProfile = {
            specialization: 'General Medicine',
            experience: 1,
            bio: 'No biography provided yet.',
            fee: 50,
            availability: {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
            }
          };
        }
        if (req.body.doctorProfile) {
          user.doctorProfile.specialization = req.body.doctorProfile.specialization || user.doctorProfile.specialization;
          user.doctorProfile.experience = req.body.doctorProfile.experience !== undefined ? req.body.doctorProfile.experience : user.doctorProfile.experience;
          user.doctorProfile.bio = req.body.doctorProfile.bio || user.doctorProfile.bio;
          user.doctorProfile.fee = req.body.doctorProfile.fee !== undefined ? req.body.doctorProfile.fee : user.doctorProfile.fee;
          user.doctorProfile.availability = req.body.doctorProfile.availability || user.doctorProfile.availability;
        }
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        age: updatedUser.age,
        medicalHistory: updatedUser.medicalHistory,
        doctorProfile: updatedUser.doctorProfile
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
