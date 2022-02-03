import mongoose from 'mongoose';

module.exports = async () => {
    await mongoose.connection.close();
    process.exit(200);
};
