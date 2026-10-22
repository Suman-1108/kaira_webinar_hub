const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kaira_webinar_hub';

async function fixHashes() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const adminHash = bcrypt.hashSync('admin123', 10);
  const studentHash = bcrypt.hashSync('student123', 10);

  // Update Admin
  const adminRes = await User.updateOne(
    { email: 'admin@kairawebinarhub.com' },
    { $set: { passwordHash: adminHash, emailVerified: true, accountStatus: 'active', role: 'admin' } }
  );
  console.log('Updated admin@kairawebinarhub.com:', adminRes);

  // Update Suman Admin
  const sumanRes = await User.updateOne(
    { email: 'hellosuman29@gmail.com' },
    { $set: { passwordHash: adminHash, emailVerified: true, accountStatus: 'active', role: 'admin' } }
  );
  console.log('Updated hellosuman29@gmail.com:', sumanRes);

  // Update Pooja Student
  const studentRes = await User.updateOne(
    { email: 'pooja.sundaram@techvision.io' },
    { $set: { passwordHash: studentHash, emailVerified: true, accountStatus: 'active', role: 'student' } }
  );
  console.log('Updated pooja.sundaram@techvision.io:', studentRes);

  // Verify
  const adminUser = await User.findOne({ email: 'admin@kairawebinarhub.com' });
  console.log('admin bcrypt match:', bcrypt.compareSync('admin123', adminUser.passwordHash));

  const sumanUser = await User.findOne({ email: 'hellosuman29@gmail.com' });
  console.log('suman bcrypt match:', bcrypt.compareSync('admin123', sumanUser.passwordHash));

  const studentUser = await User.findOne({ email: 'pooja.sundaram@techvision.io' });
  console.log('student bcrypt match:', bcrypt.compareSync('student123', studentUser.passwordHash));

  await mongoose.disconnect();
  console.log('Done!');
}

fixHashes().catch(err => {
  console.error('Error fixing hashes:', err);
  process.exit(1);
});
