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
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
