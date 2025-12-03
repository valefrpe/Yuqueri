import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  session: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('User', userSchema);

