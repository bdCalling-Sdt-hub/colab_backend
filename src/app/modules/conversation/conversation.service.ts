/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import NormalUser from '../normalUser/normalUser.model';
import Conversation from './conversation.model';

const getConversation = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const searchTerm = query.searchTerm as string;
  let userSearchFilter = {};

  if (searchTerm) {
    const matchingUsers = await NormalUser.find(
      { name: { $regex: searchTerm, $options: 'i' } },
      '_id',
    );

    const matchingUserIds = matchingUsers.map((user) => user._id);
    userSearchFilter = {
      $or: [
        { sender: { $in: matchingUserIds } },
        { receiver: { $in: matchingUserIds } },
      ],
    };
  }

  const currentUserConversationQuery = new QueryBuilder(
    Conversation.find({
      $or: [{ sender: profileId }, { receiver: profileId }],
      ...userSearchFilter,
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'messages',
        model: 'Message',
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .populate('sender')
      .populate('receiver'),
    query,
  )
    .fields()
    .filter()
    .paginate()
    .sort();

  const currentUserConversation = await currentUserConversationQuery.modelQuery;
  const conversationList = await Promise.all(
    currentUserConversation.map(async (conv: any) => {
      const countUnseenMessage = conv.messages?.reduce(
        (prev: number, curr: any) =>
          curr.msgByUserId.toString() !== profileId && !curr.seen
            ? prev + 1
            : prev,
        0,
      );

      const otherUser =
        conv.sender._id.toString() == profileId ? conv.receiver : conv.sender;
      return {
        _id: conv._id,
        userData: {
          _id: otherUser._id,
          name: otherUser.name,
          profileImage: otherUser.profile_image,
        },
        unseenMsg: countUnseenMessage,
        lastMsg: conv.messages[conv.messages.length - 1],
      };
    }),
  );

  const meta = await currentUserConversationQuery.countTotal();

  return {
    meta,
    result: conversationList,
  };
};

const ConversationService = {
  getConversation,
};

export default ConversationService;
