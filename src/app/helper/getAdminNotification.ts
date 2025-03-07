import Notification from '../modules/notification/notification.model';
import { USER_ROLE } from '../modules/user/user.constant';

const getAdminNotificationCount = async () => {
  const unseenCount = await Notification.countDocuments({
    seen: false,
    receiver: USER_ROLE.superAdmin,
  });
  const latestNotification = await Notification.findOne({
    receiver: USER_ROLE.superAdmin,
  })
    .sort({ createdAt: -1 })
    .lean();
  return { unseenCount, latestNotification };
};

export default getAdminNotificationCount;
