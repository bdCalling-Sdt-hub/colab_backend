import mongoose, { model, Schema } from 'mongoose';
import { IConversation } from './conversation.interface';

const conversationSchema = new Schema<IConversation>(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'NormalUser',
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'NormalUser',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  },
);
conversationSchema.index({ sender: 1, receiver: 1 });

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
