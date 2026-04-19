import mongoose, { Schema, Document } from 'mongoose';

export interface IChatGroup extends Document {
  name: string;
  description?: string;
  avatar?: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMessage extends Document {
  group: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const chatGroupSchema = new Schema<IChatGroup>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 500 },
    avatar: { type: String, default: '' },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'GroupMessage' },
  },
  { timestamps: true }
);

const groupMessageSchema = new Schema<IGroupMessage>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'ChatGroup', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: { type: String },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

chatGroupSchema.index({ members: 1, updatedAt: -1 });
groupMessageSchema.index({ group: 1, createdAt: -1 });

export const ChatGroup = mongoose.model<IChatGroup>('ChatGroup', chatGroupSchema);
export const GroupMessage = mongoose.model<IGroupMessage>('GroupMessage', groupMessageSchema);
