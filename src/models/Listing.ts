import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  seller: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  price: number;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  status: 'active' | 'sold' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    images: { type: [String], validate: [(v: string[]) => v.length <= 6, 'Maximum 6 images'] },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    condition: { type: String, enum: ['new', 'like_new', 'good', 'fair', 'poor'], required: true },
    status: { type: String, enum: ['active', 'sold', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IListing>('Listing', listingSchema);
