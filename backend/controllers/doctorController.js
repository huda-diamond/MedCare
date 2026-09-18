const User = require('../models/User');

const getDoctors = async (req, res, next) => {
  try {
    const { specialty, search } = req.query;
    let query = { role: 'doctor' };

    if (specialty) {
      query['doctorProfile.specialization'] = specialty;
    }

    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { 'doctorProfile.bio': { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query).select('-password');

    // Self-healing: ensure doctorProfile exists and is valid
    for (let doc of doctors) {
      if (!doc.doctorProfile || !doc.doctorProfile.specialization) {
        doc.doctorProfile = {
          specialization: doc.doctorProfile?.specialization || 'General Medicine',
          experience: doc.doctorProfile?.experience || 1,
          bio: doc.doctorProfile?.bio || 'No biography provided yet.',
          fee: doc.doctorProfile?.fee || 50,
          availability: doc.doctorProfile?.availability || {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
          }
        };
        await doc.save();
      }
    }

    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Self-healing: ensure doctorProfile exists and is valid
    if (!doctor.doctorProfile || !doctor.doctorProfile.specialization) {
      doctor.doctorProfile = {
        specialization: doctor.doctorProfile?.specialization || 'General Medicine',
        experience: doctor.doctorProfile?.experience || 1,
        bio: doctor.doctorProfile?.bio || 'No biography provided yet.',
        fee: doctor.doctorProfile?.fee || 50,
        availability: doctor.doctorProfile?.availability || {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
        }
      };
      await doctor.save();
    }

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

const updateDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Ensure doctorProfile exists before editing availability
    if (!doctor.doctorProfile) {
      doctor.doctorProfile = {
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

    const { days, slots } = req.body;
    if (days) doctor.doctorProfile.availability.days = days;
    if (slots) doctor.doctorProfile.availability.slots = slots;

    await doctor.save();
    res.json({
      message: 'Availability updated successfully',
      availability: doctor.doctorProfile.availability
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorAvailability
};
