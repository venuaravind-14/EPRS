const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

require('dotenv').config();

async function checkUser() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ username: 'prakashraj' });
    if (!user) {
        console.log('User NOT FOUND');
    } else {
        console.log('User found:', user.username);
        const isMatch = await bcrypt.compare('password123', user.password);
        console.log('Password match:', isMatch);
    }
    process.exit(0);
}

checkUser();
