/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import NormalUser from '../modules/normalUser/normalUser.model';
import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';
import { getConversation } from '../helper/gerConversation';
// for uplaods----------------
import { promisify } from 'util';
import upload from '../utilities/upload';
const uploadSingle = promisify(upload.single('media'));
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
    // Handle file upload
    // if (data.file) {
    //   const mockReq = { body: {}, file: data.file };
    //   const mockRes = {};
    //   await uploadSingle(mockReq, mockRes);

    //   const fileType = mockReq.file.mimetype.split('/')[0];
    //   if (fileType === 'image')
    //     data.imageUrl = `/uploads/message-media/image/${mockReq.file.filename}`;
    //   if (fileType === 'video')
    //     data.videoUrl = `/uploads/message-media/video/${mockReq.file.filename}`;
    //   if (fileType === 'audio')
    //     data.audioUrl = `/uploads/message-media/audio/${mockReq.file.filename}`;
    // }
    let conversation = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });
    // if conversation is not available then create a new conversation----------
    if (!conversation) {
      conversation = await Conversation.create({
        sender: data?.sender,
        receiver: data?.receiver,
      });
    }
    const messageData = {
      text: data.text,
      // imageUrl: data.imageUrl,
      // videoUrl: data.videoUrl,
      // audioUrl: data.audioUrl,
      msgByUserId: data?.msgByUserId,
    };
    const saveMessage = await Message.create(messageData);
    // update the conversation
    await Conversation.updateOne(
      { _id: conversation?._id },
      {
        $push: { messages: saveMessage?._id },
      },
    );
    // get the conversation
    // const getConversationMessage = await Conversation.findOne({
    //   $or: [
    //     { sender: data?.sender, receiver: data?.receiver },
    //     { sender: data?.receiver, receiver: data?.sender },
    //   ],
    // })
    //   .populate('messages')
    //   .sort({ updatedAt: -1 });
    // send to the frontend only new message data ---------------
    io.to(data?.sender).emit('message', messageData);
    io.to(data?.receiver).emit('message', messageData);

    //send conversation
    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit('conversation', conversationSender);
    io.to(data?.receiver).emit('conversation', conversationReceiver);
  });

  // sidebar
  socket.on('chat-list', async (crntUserId) => {
    const conversation = await getConversation(crntUserId);
    socket.emit('conversation', conversation);
  });

  // send
  socket.on('seen', async (msgByUserId) => {
    const conversation = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: msgByUserId },
        { sender: msgByUserId, receiver: currentUserId },
      ],
    });

    const conversationMessageId = conversation?.messages || [];
    // update the messages
    await Message.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } },
    );

    //send conversation
    const conversationSender = await getConversation(currentUserId as string);
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(currentUserId as string).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });
};

export default handleChat;
