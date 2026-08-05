import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import { API_BASE, setToken, isValidGmail } from '../../lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'code'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please enter email and password'); return; }
    if (!isValidGmail(email)) { Alert.alert('Invalid Email', 'Only valid Gmail accounts (@gmail.com) are permitted to sign in.'); return; }
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const form = new URLSearchParams();
      form.append('username', email.trim());
      form.append('password', password);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      await setToken(data.access_token);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError' || err.message?.includes('Network request failed')) {
        Alert.alert(
          'Connection Failed',
          `Could not connect to backend at ${API_BASE}.\n\nPlease ensure backend is running on 0.0.0.0:8000.`
        );
      } else {
        Alert.alert('Login Failed', err.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotCode = async () => {
    if (!forgotEmail) { Alert.alert('Required', 'Please enter your email address'); return; }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');

      setResetCode(''); // Keep empty so user enters code manually from email
      setNewPassword('');
      setForgotStep('code');
      Alert.alert('Check Email Inbox', `Verification code sent to ${forgotEmail}. Please check your email inbox.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not request password reset');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) { Alert.alert('Required', 'Please enter both verification code and new password'); return; }
    if (newPassword.length < 6) { Alert.alert('Invalid', 'New password must be at least 6 characters'); return; }

    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: resetCode.trim(),
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed');

      setShowForgotModal(false);
      Alert.alert('Password Updated', 'Your password has been successfully reset! You can now log in with your new password.');
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Could not reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.icon}>⚙️</Text>
          <Text style={styles.title}>CastingAI</Text>
          <Text style={styles.sub}>Industrial Defect Platform</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back 👋</Text>
          <Text style={styles.cardSub}>Sign in to your CastingAI account</Text>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="you@company.com"
            placeholderTextColor="#475569"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passRow}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity onPress={() => {
              setForgotEmail(email);
              setForgotStep('email');
              setResetCode('');
              setNewPassword('');
              setShowForgotModal(true);
            }}>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Sign In →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.link}>Don't have an account? <Text style={{ color: '#06b6d4', fontWeight: '700' }}>Register</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Modal */}
        <Modal visible={showForgotModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.modalTitle}>🔑 Reset Password</Text>
                <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                  <Text style={{ color: '#94a3b8', fontSize: 18, fontWeight: '800' }}>✕</Text>
                </TouchableOpacity>
              </View>

              {forgotStep === 'email' ? (
                <>
                  <Text style={styles.modalSub}>Enter your registered email address to receive a 6-digit verification code:</Text>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@company.com"
                    placeholderTextColor="#475569"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.btn} onPress={handleSendForgotCode} disabled={forgotLoading}>
                    {forgotLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Send Code →</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalSub}>Check your email inbox for {forgotEmail} and enter the 6-digit code below:</Text>
                  <Text style={styles.label}>VERIFICATION CODE</Text>
                  <TextInput
                    style={[styles.input, { fontFamily: 'monospace', textAlign: 'center', letterSpacing: 4, fontSize: 18 }]}
                    placeholder="123456"
                    placeholderTextColor="#475569"
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#475569"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                  <TouchableOpacity style={styles.btn} onPress={handleResetPassword} disabled={forgotLoading}>
                    {forgotLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Confirm & Update →</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050810' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 44, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: '#06b6d4', letterSpacing: -0.5 },
  sub: { color: '#64748b', fontSize: 13, marginTop: 2 },
  card: { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  cardSub: { color: '#64748b', fontSize: 12, marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  passRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { color: '#06b6d4', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1.5, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 12, padding: 14, color: '#f1f5f9', marginBottom: 16, fontSize: 15 },
  btn: { backgroundColor: '#06b6d4', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 18, shadowColor: '#06b6d4', shadowOpacity: 0.4, shadowRadius: 12 },
  btnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  link: { color: '#64748b', textAlign: 'center', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#0d1117', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  modalSub: { color: '#94a3b8', fontSize: 12, marginBottom: 16, lineHeight: 18 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  roleChipActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4' },
  roleChipText: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  roleChipTextActive: { color: '#000000', fontWeight: '900' },
});
