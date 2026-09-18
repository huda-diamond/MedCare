require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const doctorsData = [
  {
    name: 'Dr. huda dimond',
    email: 'huda@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 019-2834',
    gender: 'Female',
    age: 23,
    doctorProfile: {
      specialization: 'Cardiology',
      experience: 14,
      bio: 'Dr. huda diamond is an expert in cardiovascular medicine with over 14 years of clinical experience. Specializes in heart disease prevention, coronary interventions, and cardiac rehabilitation.',
      fee: 150,
      rating: 4.9,
      reviewsCount: 38,
      imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
      }
    }
  },
  {
    name: 'Dr. dahabo',
    email: 'dahabo@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 012-7654',
    gender: 'Female',
    age: 20,
    doctorProfile: {
      specialization: 'Neurology',
      experience: 18,
      bio: 'Dr.dahabo is a senior neurosurgeon specializing in neuromuscular disorders, stroke rehabilitation, and comprehensive brain mapping procedures.',
      fee: 200,
      rating: 4.8,
      reviewsCount: 45,
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
      availability: {
        days: ['Tuesday', 'Thursday'],
        slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
      }
    }
  },
  {
    name: 'Dr. muna',
    email: 'muna@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 014-9823',
    gender: 'Female',
    age: 21,
    doctorProfile: {
      specialization: 'Pediatrics',
      experience: 9,
      bio: 'Dr. muna provides compassionate pediatric medical care, specializing in child development, immunizations, childhood infectious diseases, and pediatric nutrition guidance.',
      fee: 90,
      rating: 4.95,
      reviewsCount: 62,
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM']
      }
    }
  },
  {
    name: 'Dr. abdale',
    email: 'abdale@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 018-4567',
    gender: 'Male',
    age: 21,
    doctorProfile: {
      specialization: 'Orthopedics',
      experience: 12,
      bio: 'Dr. abdale is an orthopedic surgeon specializing in joint replacement, sports injury recovery, minimally invasive spine surgery, and musculoskeletal physical therapy plans.',
      fee: 175,
      rating: 4.75,
      reviewsCount: 29,
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
      availability: {
        days: ['Monday', 'Wednesday', 'Thursday'],
        slots: ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM']
      }
    }
  },
  {
    name: 'Dr. shukri',
    email: 'shukri@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 017-3210',
    gender: 'Female',
    age: 39,
    doctorProfile: {
      specialization: 'Dermatology',
      experience: 11,
      bio: 'Dr. shukri provides advanced skincare services. Expertise includes medical dermatology for chronic skin conditions, skin cancer screenings, and high-end cosmetic dermatological consultations.',
      fee: 120,
      rating: 4.85,
      reviewsCount: 51,
      imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=256&h=256&q=80',
      availability: {
        days: ['Tuesday', 'Wednesday', 'Friday'],
        slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
      }
    }
  },
  {
    name: 'Dr. nuur',
    email: 'nuur@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+1 (555) 016-5643',
    gender: 'Male',
    age: 45,
    doctorProfile: {
      specialization: 'General Medicine',
      experience: 16,
      bio: 'Dr. James Wilson is a family practitioner dedicated to comprehensive general care, health screening, chronic illness management, and long-term wellness planning.',
      fee: 80,
      rating: 4.9,
      reviewsCount: 88,
      imageUrl: 'https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&w=256&h=256&q=80',
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
      }
    }
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcare';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Database connected!');

    // Wipe collections
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Appointment.deleteMany({});

    // Create Admin
    console.log('Creating Admin Account...');
    const admin = await User.create({
      name: 'MedCare Admin',
      email: 'admin@medcare.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 123-4567',
      gender: 'Male',
      age: 35
    });
    console.log('Admin account created successfully.');

    // Create Patients
    console.log('Creating Patient Accounts...');
    const patient1 = await User.create({
      name: 'Huda Dimond',
      email: 'patient@medcare.com',
      password: 'patient123',
      role: 'patient',
      phone: '+1 (555) 321-0987',
      gender: 'Female',
      age: 23,
      medicalHistory: ['Asthma', 'Seasonal Allergies']
    });

    const patient2 = await User.create({
      name: 'muuse',
      email: 'muuse@medcare.com',
      password: 'patient123',
      role: 'patient',
      phone: '+1 (555) 789-0123',
      gender: 'Male',
      age: 31,
      medicalHistory: ['Mild Hypertension']
    });
    console.log('Patient accounts created successfully.');

    // Create Doctors
    console.log('Creating Doctor Accounts...');
    const doctors = [];
    for (const doc of doctorsData) {
      const createdDoctor = await User.create(doc);
      doctors.push(createdDoctor);
    }
    console.log('Doctor accounts created successfully.');

    // Create Sample Appointments
    console.log('Creating Sample Appointments...');
    
    // 1. Pending appointment for Huda with Dr. huda dimond (Cardiology)
    await Appointment.create({
      patient: patient1._id,
      doctor: doctors[0]._id, // Dr. huda dimond
      date: '2026-05-25',
      slot: '10:00 AM',
      status: 'pending',
      symptoms: 'Mild chest pains and rapid heart rate after workouts.',
      notes: ''
    });

    // 2. Confirmed appointment for muuse with Dr. dahabo (Neurology)
    await Appointment.create({
      patient: patient2._id,
      doctor: doctors[1]._id, // Dr. dahabo
      date: '2026-05-26',
      slot: '02:00 PM',
      status: 'confirmed',
      symptoms: 'Recurring migraines and sensitivity to light in the afternoon.',
      notes: 'Doctor confirmed - please bring previous CT scan report.'
    });

    // 3. Completed appointment for Huda with Dr. nuur (General Medicine)
    await Appointment.create({
      patient: patient1._id,
      doctor: doctors[5]._id, // Dr. nuur
      date: '2026-05-18',
      slot: '11:00 AM',
      status: 'completed',
      symptoms: 'General physical checkup and annual wellness blood test referral.',
      notes: 'Prescribed daily multivitamins. Regular health indicators are in excellent ranges.'
    });

    console.log('Sample appointments created successfully.');
    console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
    
    console.log('\nSeeded Accounts List for Reference:');
    console.log('====================================');
    console.log(`Admin Role:    email: admin@medcare.com        password: admin123`);
    console.log(`Patient Role:  email: patient@medcare.com      password: patient123`);
    console.log(`Doctor Role:   email: cardio@medcare.com       password: doctor123 (Cardiology)`);
    console.log(`Doctor Role:   email: neuro@medcare.com        password: doctor123 (Neurology)`);
    console.log(`Doctor Role:   email: general@medcare.com      password: doctor123 (General Medicine)`);
    console.log('====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedDB();
