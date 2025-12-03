import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('GalleryItem', galleryItemSchema);