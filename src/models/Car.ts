import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Document {
  owner: mongoose.Types.ObjectId;
  make: string;
  model: string;
  year: number;
  photos: string[];
  specs: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    photos: { type: [String], validate: [(v: string[]) => v.length <= 5, 'Maximum 5 photos'] },
    specs: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ICar>('Car', carSchema);
