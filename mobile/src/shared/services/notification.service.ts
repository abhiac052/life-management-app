import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';

const CHANNEL_ID = 'reminders';

async function ensureChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Reminders',
    importance: AndroidImportance.HIGH,
  });
}

export async function scheduleLocalNotification(opts: {
  id: string;
  title: string;
  body: string;
  fireDate: Date;
  data?: Record<string, string>;
}) {
  await ensureChannel();
  await notifee.createTriggerNotification(
    {
      id: opts.id,
      title: opts.title,
      body: opts.body,
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      data: opts.data,
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: opts.fireDate.getTime(),
    },
  );
}

export async function cancelLocalNotification(id: string) {
  await notifee.cancelNotification(id);
}

export async function cancelAllNotificationsWithPrefix(prefix: string) {
  const notifications = await notifee.getTriggerNotifications();
  await Promise.all(
    notifications
      .filter(n => n.notification.id?.startsWith(prefix))
      .map(n => notifee.cancelNotification(n.notification.id!)),
  );
}

export async function requestNotificationPermission() {
  await notifee.requestPermission();
}
