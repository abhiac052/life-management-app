import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { remindersService, CreateReminderPayload, Reminder } from '../services/reminders.service';
import { scheduleLocalNotification, cancelLocalNotification } from '../../../shared/services/notification.service';

export const REMINDERS_KEY = ['reminders'];
const reminderKey = (id: string) => ['reminders', id];

export function useReminders(status?: string) {
  return useQuery({
    queryKey: [...REMINDERS_KEY, status],
    queryFn: () => remindersService.getAll({ status }),
  });
}

export function useReminderDetail(id: string) {
  return useQuery({
    queryKey: reminderKey(id),
    queryFn: () => remindersService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReminderPayload) => remindersService.create(data),
    onSuccess: async (reminder: Reminder) => {
      qc.invalidateQueries({ queryKey: REMINDERS_KEY });
      // Schedule local notification
      if (reminder.notifyBefore?.length) {
        for (const minutesBefore of reminder.notifyBefore) {
          const fireDate = new Date(new Date(reminder.dueDate).getTime() - minutesBefore * 60 * 1000);
          if (fireDate > new Date()) {
            await scheduleLocalNotification({
              id: `reminder_${reminder.id}_${minutesBefore}`,
              title: reminder.title,
              body: reminder.description ?? 'Reminder due soon',
              fireDate,
              data: { type: 'reminder', reminderId: reminder.id },
            });
          }
        }
      }
    },
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReminderPayload> }) =>
      remindersService.update(id, data),
    onSuccess: (reminder: Reminder) => {
      qc.setQueryData(reminderKey(reminder.id), reminder);
      qc.invalidateQueries({ queryKey: REMINDERS_KEY });
    },
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersService.remove(id),
    onSuccess: (_: unknown, id: string) => {
      void cancelLocalNotification(`reminder_${id}`);
      qc.invalidateQueries({ queryKey: REMINDERS_KEY });
    },
  });
}

export function useReminderActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: REMINDERS_KEY });

  const complete = useMutation({ mutationFn: remindersService.complete, onSuccess: invalidate });
  const skip = useMutation({ mutationFn: remindersService.skip, onSuccess: invalidate });
  const snooze = useMutation({
    mutationFn: ({ id, duration }: { id: string; duration: number }) =>
      remindersService.snooze(id, duration),
    onSuccess: invalidate,
  });
  const pause = useMutation({ mutationFn: remindersService.pause, onSuccess: invalidate });
  const resume = useMutation({ mutationFn: remindersService.resume, onSuccess: invalidate });

  return { complete, skip, snooze, pause, resume };
}
