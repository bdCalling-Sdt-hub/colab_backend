/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import NormalUser from '../modules/normalUser/normalUser.model';

const handleChat = async (
  io: IOServer,
  socket: Socket,
  onlineUser: any,
): Promise<void> => {
  // message page
  socket.on('message-page', async (userId) => {
    console.log('Received message-page for userId:', userId);

    const userDetails = await NormalUser.findById(userId).select('-password');
    if (userDetails) {
      const payload = {
        _id: userDetails._id,
        name: userDetails.name,
        email: userDetails.email,
        profile_image: userDetails?.profile_image,
        online: onlineUser.has(userId),
      };
      socket.emit('message-user', payload);
    } else {
      console.log('User not found');
    }
    //get previous message
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    console.log('previous conversation message', getConversationMessage);

    socket.emit('message', getConversationMessage?.messages || []);
  });
};

export default handleChat;
