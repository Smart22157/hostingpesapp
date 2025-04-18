const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: 'pes2025@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('@Peselec2025', 10);
    const adminUser = new User({
      username: 'pes2025',
      email: 'pes2025@gmail.com',
      passwordHash,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
