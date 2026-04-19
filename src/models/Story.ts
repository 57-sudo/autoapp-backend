import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
  author: mongoose.Types.ObjectId;
  image: string;
  caption?: string;
  views: mongoose.Types.ObjectId[];
  expiresAt: Date;
  createdAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    image: { type: String, required: true },
    caption: { type: String, maxlength: 200 },
    views: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IStory>('Story', storySchema);
