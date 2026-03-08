const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function verifyTestUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./backend/models/User');
        const result = await User.findOneAndUpdate(
            { email: 'testing_123@mnagency.cv' },
            { isVerified: true, otp: undefined },
            { new: true }
        );
        if (result) {
            console.log('SUCCESS: Test user verified manually');
        } else {
            console.log('FAILURE: Test user not found');
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        process.exit(0);
    }
}

verifyTestUser();
