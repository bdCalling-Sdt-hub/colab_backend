/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import NormalUser from '../modules/normalUser/normalUser.model';
import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';
import { getConversation } from '../helper/gerConversation';
import { getSingleConversation } from '../helper/getSingleConversation';

const handleChat = async (
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
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    socket.emit('messages', getConversationMessage?.messages || []);
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
    };
    const saveMessage = await Message.create(messageData);
    await Conversation.updateOne(
      { _id: conversation?._id },
      {
        $push: { messages: saveMessage?._id },
      },
    );
    // send to the frontend only new message data ---------------
    io.to(data?.sender).emit('message', messageData);
    io.to(data?.receiver).emit('message', messageData);

    //send conversation
    const conversationSender = await getSingleConversation(
      data?.sender,
      data?.receiver,
    );
    const conversationReceiver = await getSingleConversation(
      data?.receiver,
      data?.sender,
    );

    io.to(data?.sender).emit('conversation', conversationSender);
    io.to(data?.receiver).emit('conversation', conversationReceiver);
  });

  // chat list -------------------
  socket.on('chat-list', async (crntUserId) => {
    const conversation = await getConversation(crntUserId);
    socket.emit('chat-list', conversation);
  });

  // send------------------------
  socket.on('seen', async (msgByUserId) => {
    const conversation = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: msgByUserId },
        { sender: msgByUserId, receiver: currentUserId },
      ],
    });
    const conversationMessageId = conversation?.messages || [];
    await Message.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } },
    );

    //send conversation --------------
    const conversationSender = await getConversation(currentUserId as string);
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(currentUserId as string).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });
};

export default handleChat;
