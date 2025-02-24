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
    // messages: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Message',
    //   },
    // ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
conversationSchema.index({ sender: 1, receiver: 1 });

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
