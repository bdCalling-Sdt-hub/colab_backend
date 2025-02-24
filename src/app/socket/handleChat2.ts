/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import NormalUser from '../modules/normalUser/normalUser.model';
import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';
import { getConversation } from '../helper/gerConversation';
import { getSingleConversation2 } from '../helper/getSingleConversation2';

const handleChat2 = async (
  io: IOServer,
  socket: Socket,
  onlineUser: any,
  currentUserId: string,
): Promise<void> => {
  // message page
  socket.on('message-page', async (userId) => {
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
      socket.emit('socket-error', {
        errorMessage: 'Current user is not exits',
      });
    }
    //get previous message
    const conversation = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    });
    const messages = await Message.find({ conversationId: conversation?._id });

    socket.emit('messages', messages || []);
  });

  // new message -----------------------------------
  socket.on('new-message', async (data) => {
    let conversation = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });
    if (!conversation) {
      conversation = await Conversation.create({
        sender: data?.sender,
        receiver: data?.receiver,
      });
    }
    const messageData = {
      text: data.text,
      imageUrl: data.imageUrl || '',
      videoUrl: data.videoUrl || '',
      msgByUserId: data?.msgByUserId,
      conversationId: conversation?._id,
    };
    // console.log('message dta', messageData);
    const saveMessage = await Message.create(messageData);
    await Conversation.updateOne(
      { _id: conversation?._id },
      {
        lastMessage: saveMessage._id,
      },
    );
    // send to the frontend only new message data ---------------
    io.to(data?.sender).emit('message', messageData);
    io.to(data?.receiver).emit('message', messageData);

    //send conversation
    const conversationSender = await getSingleConversation2(
      data?.sender,
      data?.receiver,
    );
    const conversationReceiver = await getSingleConversation2(
      data?.receiver,
      data?.sender,
    );

    io.to(data?.sender).emit('conversation', conversationSender);
    io.to(data?.receiver).emit('conversation', conversationReceiver);
  });

  // send------------------------
  socket.on('seen', async (msgByUserId) => {
    const conversation = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: msgByUserId },
        { sender: msgByUserId, receiver: currentUserId },
      ],
    });
    await Message.updateMany(
      { conversationId: conversation?._id, msgByUserId: msgByUserId },
      { $set: { seen: true } },
    );

    //send conversation --------------
    const conversationSender = await getConversation(currentUserId as string);
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(currentUserId as string).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });
};

export default handleChat2;
