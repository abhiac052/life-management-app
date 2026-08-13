import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { VaultStackParamList } from './types';
import { VaultHomeScreen } from '../../features/documents/screens/VaultHomeScreen';
import { DocumentDetailScreen } from '../../features/documents/screens/DocumentDetailScreen';
import { CreateDocumentScreen, EditDocumentScreen } from '../../features/documents/screens/DocumentFormScreens';

const Stack = createNativeStackNavigator<VaultStackParamList>();

export default function VaultStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="VaultHome" component={VaultHomeScreen} options={{ title: 'Document Vault' }} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Document' }} />
      <Stack.Screen name="CreateDocument" component={CreateDocumentScreen} options={{ title: 'Upload Document' }} />
      <Stack.Screen name="EditDocument" component={EditDocumentScreen} options={{ title: 'Edit Document' }} />
    </Stack.Navigator>
  );
}
