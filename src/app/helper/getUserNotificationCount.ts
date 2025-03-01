import Notification from '../modules/notification/notification.model';

const getUserNotificationCount = async (receiver: string) => {
  const unseenCount = await Notification.countDocuments({
    seen: false,
    receiver: receiver,
  });
  return unseenCount;
};

export default getUserNotificationCount;
