import { Slot } from 'expo-router';
import { AppProviders, AppShell } from '../ui/shell';

export default function RootLayout() {
  return <AppProviders><AppShell><Slot /></AppShell></AppProviders>;
}
