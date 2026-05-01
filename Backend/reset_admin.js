const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function reset() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/anneCreationsProd');
        console.log('Connected');
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const result = await mongoose.connection.collection('admins').updateOne(
            { username: 'admin' }, 
            { $set: { password: hashedPassword, salt: salt, status: true } }
        );
        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
reset();
