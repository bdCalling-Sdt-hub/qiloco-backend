import { JwtPayload } from 'jsonwebtoken';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';

// get notifications
const getNotificationFromDB = async (user: JwtPayload): Promise<{ result: INotification[]; unreadCount: number }> => {
     const result = await Notification.find({ receiver: user.id }).sort({ createdAt: -1 }).exec();

     const unreadCount = await Notification.countDocuments({
          receiver: user.id,
          read: false,
     });

     return { result, unreadCount };
};

// read notifications only for user
const readNotificationToDB = async (user: JwtPayload, id: string): Promise<INotification | undefined> => {
     const result: any = await Notification.updateOne({ _id: id, receiver: user.id, read: false }, { $set: { read: true } });
     return result;
};
const readAllNotifications = async (user: JwtPayload): Promise<INotification | undefined> => {
     const result: any = await Notification.updateMany({ receiver: user.id, read: false }, { $set: { read: true } });
     return result;
};

// get notifications for admin
const adminNotificationFromDB = async () => {
     const result = await Notification.find({ type: 'ADMIN' });
     return result;
};

// read notifications only for admin
const adminReadNotificationToDB = async (): Promise<INotification | null> => {
     const result: any = await Notification.updateMany({ type: 'ADMIN', read: false }, { $set: { read: true } }, { new: true });
     return result;
};

export const NotificationService = {
     adminNotificationFromDB,
     getNotificationFromDB,
     readNotificationToDB,
     adminReadNotificationToDB,
     readAllNotifications,
};
