import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#050810',
          borderTopColor: 'rgba(6,182,212,0.2)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        headerStyle: { backgroundColor: '#050810', borderBottomWidth: 1, borderBottomColor: 'rgba(6,182,212,0.15)' },
        headerTintColor: '#06b6d4',
        headerTitleStyle: { fontWeight: '900', fontSize: 18, color: '#06b6d4' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text> }}
      />
      <Tabs.Screen
        name="upload"
        options={{ title: 'Upload', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📤</Text> }}
      />
      <Tabs.Screen
        name="results"
        options={{ title: 'Results', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📈</Text> }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: 'Reports', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📄</Text> }}
      />
      <Tabs.Screen
        name="defects"
        options={{ title: 'Catalog', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📖</Text> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text> }}
      />
    </Tabs>
  );
}
