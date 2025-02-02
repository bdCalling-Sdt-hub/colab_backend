/* eslint-disable @typescript-eslint/no-explicit-any */
// import Conversation from '../modules/conversation/conversation.model';

import Conversation from '../modules/conversation/conversation.model';

// export const getConversation = async (crntUserId: string) => {
//   if (crntUserId) {
//     const currentUserConversation = await Conversation.find({
//       $or: [{ sender: crntUserId }, { receiver: crntUserId }],
//     })
//       .sort({ updatedAt: -1 })
//       .populate({
//         path: 'messages',
//         model: 'Message',
//       })
//       .populate('sender')
//       .populate('receiver');
//     // return conversation;
//     const conversationList = await Promise.all(
//       currentUserConversation?.map(async (conv: any) => {
//         const countUnseenMessage = conv.messages?.reduce(
//           (prev: number, curr: any) =>
//             curr.msgByUserId.toString() !== crntUserId && !curr.seen
//               ? prev + 1
//               : prev,
//           0,
//         );

//         // Identify the other user in the conversation
//         const otherUser =
//           conv.sender._id.toString() === crntUserId
//             ? conv.receiver
//             : conv.sender;

//         return {
//           _id: conv._id,
//           userData: {
//             _id: otherUser._id,
//             name: otherUser.name,
//             profileImage: otherUser.profile_image,
//           },
//           unseenMsg: countUnseenMessage,
//           lastMsg: conv.messages[conv.messages.length - 1],
//         };
//       }),
//     );

//     return conversationList;
//   } else {
//     return [];
//   }
// };

// for search
export const getConversation = async (
  crntUserId: string,
  searchTerm: string = '',
) => {
  if (!crntUserId) return [];

  // Fetch conversations involving the current user
  const currentUserConversation = await Conversation.find({
    $or: [{ sender: crntUserId }, { receiver: crntUserId }],
  })
    .sort({ updatedAt: -1 })
    .populate({
      path: 'messages',
      model: 'Message',
    })
    .populate('sender')
    .populate('receiver');

  // Map through conversations and prepare filtered results
  const conversationList = await Promise.all(
    currentUserConversation.map(async (conv: any) => {
      const countUnseenMessage = conv.messages?.reduce(
        (prev: number, curr: any) =>
          curr.msgByUserId.toString() !== crntUserId && !curr.seen
            ? prev + 1
            : prev,
        0,
      );

      // Identify the other user in the conversation
      const otherUser =
        conv.sender._id.toString() === crntUserId ? conv.receiver : conv.sender;

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

  // Filter by search term
  const filteredConversationList = searchTerm
    ? conversationList.filter((conv) =>
        conv.userData.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : conversationList;

  return filteredConversationList;
};
