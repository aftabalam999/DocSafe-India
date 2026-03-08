const mongoose = require('mongoose');
require('dotenv').config();

async function verifyTestUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const result = await User.findOneAndUpdate(
            { email: 'family@mnagency.cv' },
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
