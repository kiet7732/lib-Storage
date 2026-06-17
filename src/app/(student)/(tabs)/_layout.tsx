import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/navigation/floating-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="books" />
      <Tabs.Screen name="my-library" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
