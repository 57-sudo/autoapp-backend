import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  images: string[];
  description: string;
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: { type: [String], validate: [(v: string[]) => v.length <= 4, 'Maximum 4 images'] },
    description: { type: String, default: '', maxlength: 2000 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export default mongoose.model<IPost>('Post', postSchema);
