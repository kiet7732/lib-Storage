import { Tabs } from 'expo-router';

import { LibrarianTabBar } from '@/features/librarian/components/librarian-tab-bar';

export default function LibrarianTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <LibrarianTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="requests" />
      <Tabs.Screen name="returns" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="reports" />
    </Tabs>
  );
}
