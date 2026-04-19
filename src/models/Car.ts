import mongoose, { Schema } from 'mongoose';

const carSchema = new Schema(
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

export default mongoose.model('Car', carSchema);
