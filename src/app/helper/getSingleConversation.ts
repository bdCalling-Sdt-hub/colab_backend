/* eslint-disable @typescript-eslint/no-explicit-any */
import Conversation from '../modules/conversation/conversation.model';
import NormalUser from '../modules/normalUser/normalUser.model';

export const getSingleConversation = async (
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
    .sort({ updatedAt: -1 })
    .populate('messages')
    .populate('sender')
    .populate('receiver');

  if (!conversation) return null;

  const countUnseenMessage = conversation.messages?.reduce(
    (prev: number, curr: any) =>
      curr.msgByUserId.toString() !== currentUserId && !curr.seen
        ? prev + 1
        : prev,
    0,
  );

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
    lastMsg: conversation.messages[conversation.messages.length - 1],
  };
};
