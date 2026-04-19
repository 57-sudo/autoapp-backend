import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  creator: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: { type: string; coordinates: number[] };
  address: string;
  date: Date;
  participants: mongoose.Types.ObjectId[];
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    address: { type: String, default: '' },
    date: { type: Date, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });

export default mongoose.model<IEvent>('Event', eventSchema);
