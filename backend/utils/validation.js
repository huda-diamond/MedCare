const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'doctor', 'admin']).default('patient'),
  phone: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  age: z.number().int().positive().optional(),
  medicalHistory: z.array(z.string()).optional(),
  // For doctors onboarding
  specialization: z.enum(['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine']).optional(),
  experience: z.number().int().nonnegative().optional(),
  bio: z.string().optional(),
  fee: z.number().nonnegative().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const bookingSchema = z.object({
  doctor: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Doctor ID format'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  slot: z.string().min(1, 'Slot is required'),
  symptoms: z.string().min(3, 'Symptoms description must be at least 3 characters'),
  notes: z.string().optional()
});

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  bookingSchema,
  validateBody
};
