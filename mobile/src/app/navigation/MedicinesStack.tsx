import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MedicinesStackParamList } from './types';
import { TodayDosesScreen } from '../../features/medicines/screens/TodayDosesScreen';
import { MedicineListScreen } from '../../features/medicines/screens/MedicineListScreen';
import { MedicineDetailScreen } from '../../features/medicines/screens/MedicineDetailScreen';
import { CreateMedicineScreen, EditMedicineScreen } from '../../features/medicines/screens/MedicineFormScreens';
import { makeStackScreenOptions } from './headerOptions';
import { useTheme } from '../../shared/theme/ThemeContext';

const Stack = createNativeStackNavigator<MedicinesStackParamList>();

export default function MedicinesStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={({ navigation }) => makeStackScreenOptions(navigation, colors)}>
      <Stack.Screen name="TodayDoses" component={TodayDosesScreen} options={{ title: "Today's Doses" }} />
      <Stack.Screen name="MedicineList" component={MedicineListScreen} options={{ title: 'Medicines' }} />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} options={{ title: 'Medicine' }} />
      <Stack.Screen name="CreateMedicine" component={CreateMedicineScreen} options={{ title: 'Add Medicine' }} />
      <Stack.Screen name="EditMedicine" component={EditMedicineScreen} options={{ title: 'Edit Medicine' }} />
    </Stack.Navigator>
  );
}
