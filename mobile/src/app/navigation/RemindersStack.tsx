import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RemindersStackParamList } from './types';
import { ReminderListScreen } from '../../features/reminders/screens/ReminderListScreen';
import { ReminderDetailScreen } from '../../features/reminders/screens/ReminderDetailScreen';
import { CreateReminderScreen, EditReminderScreen } from '../../features/reminders/screens/ReminderFormScreens';

const Stack = createNativeStackNavigator<RemindersStackParamList>();

export default function RemindersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ReminderList" component={ReminderListScreen} options={{ title: 'Reminders' }} />
      <Stack.Screen name="ReminderDetail" component={ReminderDetailScreen} options={{ title: 'Reminder' }} />
      <Stack.Screen name="CreateReminder" component={CreateReminderScreen} options={{ title: 'New Reminder' }} />
      <Stack.Screen name="EditReminder" component={EditReminderScreen} options={{ title: 'Edit Reminder' }} />
    </Stack.Navigator>
  );
}
