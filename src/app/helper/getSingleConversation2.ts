/* eslint-disable @typescript-eslint/no-explicit-any */
import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';
import NormalUser from '../modules/normalUser/normalUser.model';

export const getSingleConversation2 = async (
  currentUserId: string,
  receiverId: string,
) => {
  if (!currentUserId || !receiverId) return null;

  const conversation = await Conversation.findOne({
    $or: [
      { sender: currentUserId, receiver: receiverId },
      { sender: receiverId, receiver: currentUserId },
    ],
  })
    .populate('sender')
    .populate('receiver')
    .populate('lastMessage');

  if (!conversation) return null;
  const countUnseenMessage = await Message.countDocuments({
    conversationId: conversation._id,
    msgByUserId: { $ne: currentUserId },
    seen: false,
  });

  // Identify the other user in the conversation----------
  const otherUser =
    conversation.sender._id.toString() === currentUserId
      ? conversation.receiver
      : conversation.sender;

  // Fetch additional user details if necessary---------------
  const userData = await NormalUser.findById(otherUser._id);
  return {
    _id: conversation._id,
    userData: {
      id: otherUser._id,
      user: userData?.user,
      name: userData?.name,
      profileImage: userData?.profile_image,
    },
    unseenMsg: countUnseenMessage,
    lastMsg: conversation.lastMessage,
  };
};
