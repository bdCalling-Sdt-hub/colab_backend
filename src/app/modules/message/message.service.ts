import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Conversation from '../conversation/conversation.model';
import Message from './message.model';
import QueryBuilder from '../../builder/QueryBuilder';

const getMessages = async (
  profileId: string,
  userId: string,
  query: Record<string, unknown>,
) => {
  const conversation = await Conversation.findOne({
    $or: [
      { sender: profileId, receiver: userId },
      { sender: userId, receiver: profileId },
    ],
  });
  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  }

  const messageQuery = new QueryBuilder(
    Message.find({ conversationId: conversation?._id }),
    query,
  )
    .search(['text'])
    .fields()
    .filter()
    .paginate()
    .sort();
  const result = await messageQuery.modelQuery;
  const meta = await messageQuery.countTotal();
  return {
    meta,
    result,
  };
};

const MessageService = {
  getMessages,
};

export default MessageService;
