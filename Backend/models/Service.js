import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  priceText: { type: String, required: true },
  includes: [{ type: String }],
  image: { type: String },
  active: { type: Boolean, default: true },
  type: { type: String, enum: ['service', 'addon'], default: 'service' }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
