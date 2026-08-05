import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { API_BASE, setToken, isValidGmail } from '../../lib/api';

const ROLES = [
  'Chief Quality Engineer',
  'Chief Quality Inspector',
  'Quality Engineer',
  'Quality Inspector',
  'Engineer',
  'Inspector',
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Chief Quality Engineer');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) { Alert.alert('Error', 'Email and password are required'); return; }
    if (!isValidGmail(email)) { Alert.alert('Invalid Email', 'Only valid Gmail accounts (@gmail.com) are permitted to register.'); return; }
    if (password !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, full_name: name.trim(), role }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      await setToken(data.access_token);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError' || err.message?.includes('Network request failed')) {
        Alert.alert(
          'Connection Failed',
          `Could not connect to backend at ${API_BASE}.\n\nPlease ensure backend is running on 0.0.0.0:8000 and phone is connected to the same Wi-Fi network.`
        );
      } else {
        Alert.alert('Registration Failed', err.message || 'An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.icon}>⚙️</Text>
            <Text style={styles.title}>CastingAI</Text>
            <Text style={styles.sub}>Create Free Platform Account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#475569" value={name} onChangeText={setName} />
            
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput style={styles.input} placeholder="you@company.com" placeholderTextColor="#475569" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            
            <Text style={styles.label}>SELECT YOUR DESIGNATION / ROLE</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, role === r && styles.roleChipActive]}
                  onPress={() => setRole(r)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.roleNotice}>📌 Note: Designated once upon registration & permanently locked.</Text>

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput style={styles.input} placeholder="Min. 6 characters" placeholderTextColor="#475569" value={password} onChangeText={setPassword} secureTextEntry />
            
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput style={styles.input} placeholder="Repeat password" placeholderTextColor="#475569" value={confirm} onChangeText={setConfirm} secureTextEntry />

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Create Account →</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.link}>Already have an account? <Text style={{ color: '#06b6d4', fontWeight: '700' }}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050810' },
  container: { padding: 24, paddingVertical: 36, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  icon: { fontSize: 40, marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '900', color: '#06b6d4' },
  sub: { color: '#64748b', fontSize: 13, marginTop: 2 },
  card: { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  label: { color: '#94a3b8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1.5, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 12, padding: 14, color: '#f1f5f9', marginBottom: 14, fontSize: 15 },
  btn: { backgroundColor: '#06b6d4', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 18, shadowColor: '#06b6d4', shadowOpacity: 0.4, shadowRadius: 12 },
  btnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  link: { color: '#64748b', textAlign: 'center', fontSize: 13 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  roleChipActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4' },
  roleChipText: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  roleChipTextActive: { color: '#000000', fontWeight: '900' },
  roleNotice: { color: '#06b6d4', fontSize: 10, fontFamily: 'monospace', marginBottom: 14, marginTop: -6 },
});
