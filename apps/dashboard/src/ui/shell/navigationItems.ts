import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

export const navigationItems = [
  { href: '/', label: 'Home', icon: 'home-outline' },
  { href: '/orders', label: 'Orders', icon: 'receipt-outline' },
  { href: '/menu', label: 'Menu', icon: 'restaurant-outline' },
  { href: '/crm', label: 'CRM', icon: 'people-outline' },
  { href: '/settings', label: 'Settings', icon: 'settings-outline' },
  { href: '/ui-library', label: 'UI Library', icon: 'grid-outline' },
] as const satisfies readonly { href: Href; label: string; icon: ComponentProps<typeof Ionicons>['name'] }[];

export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}
