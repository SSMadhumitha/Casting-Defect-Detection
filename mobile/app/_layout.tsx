import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050810' } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: 'Sign In', headerShown: true, headerStyle: { backgroundColor: '#050810' }, headerTintColor: '#06b6d4', headerTitleStyle: { fontWeight: '900', color: '#06b6d4' } }} />
      <Stack.Screen name="auth/register" options={{ title: 'Create Account', headerShown: true, headerStyle: { backgroundColor: '#050810' }, headerTintColor: '#06b6d4', headerTitleStyle: { fontWeight: '900', color: '#06b6d4' } }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
