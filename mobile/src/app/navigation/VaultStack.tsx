import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { VaultStackParamList } from './types';
import { VaultHomeScreen } from '../../features/documents/screens/VaultHomeScreen';
import { CategoryDocumentsScreen } from '../../features/documents/screens/CategoryDocumentsScreen';
import { DocumentDetailScreen } from '../../features/documents/screens/DocumentDetailScreen';
import { CreateDocumentScreen, EditDocumentScreen } from '../../features/documents/screens/DocumentFormScreens';
import { stackScreenOptions } from './headerOptions';

const Stack = createNativeStackNavigator<VaultStackParamList>();

export default function VaultStack() {
  return (
    <Stack.Navigator screenOptions={({ navigation }) => stackScreenOptions(navigation)}>
      <Stack.Screen name="VaultHome" component={VaultHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CategoryDocuments"
        component={CategoryDocumentsScreen}
        options={({ route }) => ({ title: route.params.label })}
      />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Document' }} />
      <Stack.Screen name="CreateDocument" component={CreateDocumentScreen} options={{ title: 'Upload Document' }} />
      <Stack.Screen name="EditDocument" component={EditDocumentScreen} options={{ title: 'Edit Document' }} />
    </Stack.Navigator>
  );
}
