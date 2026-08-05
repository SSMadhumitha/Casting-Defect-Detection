import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { API_BASE, authFetch, removeToken } from '../../lib/api';

export default function ProfileScreen() {
  const [fullName, setFullName] = useState('Inspector Account');
  const [userRole, setUserRole] = useState('Chief Quality Engineer');
  const [userEmail, setUserEmail] = useState('inspector@castingai.com');
  
  const [serverStatus, setServerStatus] = useState('Operational');
  const [latency, setLatency] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);

  // Toggles
  const [autoPdf, setAutoPdf] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  // Password
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await authFetch('/auth/me');
      if (res.ok) {
        const u = await res.json();
        if (u.full_name) setFullName(u.full_name);
        if (u.role) setUserRole(u.role);
        if (u.email) setUserEmail(u.email);
      }
    } catch (e) {}
    pingServer();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const pingServer = async () => {
    setPinging(true);
    const start = Date.now();
    try {
      const res = await authFetch('/stats');
      const end = Date.now();
      setLatency(end - start);
      if (res.ok) setServerStatus('Operational');
      else setServerStatus('Degraded');
    } catch {
      setServerStatus('Offline');
      setLatency(null);
    } finally {
      setPinging(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPass || newPass.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoadingPass(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, code: 'DIRECT', new_password: newPass }),
      });
      if (res.ok) {
        Alert.alert('Success', 'Password updated successfully!');
        setNewPass('');
        setConfirmPass('');
      } else {
        Alert.alert('Error', 'Could not update password.');
      }
    } catch {
      Alert.alert('Network Error', 'Check backend server connectivity.');
    } finally {
      setLoadingPass(false);
    }
  };

  const handleLogout = async () => {
    await removeToken();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Identity Card */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 32 }}>👷‍♂️</Text>
          </View>
          <Text style={styles.nameText}>{fullName}</Text>
          <Text style={styles.roleSubText}>🔒 {userRole} (Locked)</Text>
          <Text style={styles.emailText}>{userEmail}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>ASNT Level III NDT</Text>
            </View>
            <View style={styles.plantBadge}>
              <Text style={styles.plantText}>Plant-04 (Metallics)</Text>
            </View>
          </View>
        </View>

        {/* API Server Health */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>🖥️</Text>
              <Text style={styles.sectionTitle}>API Server Health</Text>
            </View>
            <TouchableOpacity onPress={pingServer} style={styles.pingBtn} disabled={pinging}>
              {pinging ? (
                <ActivityIndicator color="#06b6d4" size="small" />
              ) : (
                <Text style={styles.pingBtnText}>Ping Server</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.diagBox}>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>FastAPI Gateway:</Text>
              <Text style={[styles.diagVal, { color: serverStatus === 'Operational' ? '#4ade80' : '#f87171' }]}>
                {serverStatus}
              </Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Response Latency:</Text>
              <Text style={[styles.diagVal, { color: '#06b6d4', fontFamily: 'monospace' }]}>
                {latency !== null ? `${latency} ms` : 'Calculating...'}
              </Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>AI Model Engine:</Text>
              <Text style={[styles.diagVal, { color: '#a855f7', fontFamily: 'monospace' }]}>
                YOLOv8 | U-Net v2.4
              </Text>
            </View>
          </View>
        </View>

        {/* Password Update */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔒 Change Password</Text>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#475569"
            secureTextEntry
            style={styles.input}
            value={newPass}
            onChangeText={setNewPass}
          />
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#475569"
            secureTextEntry
            style={styles.input}
            value={confirmPass}
            onChangeText={setConfirmPass}
          />
          <TouchableOpacity
            style={styles.btnCyan}
            onPress={handleUpdatePassword}
            disabled={loadingPass}
          >
            <Text style={styles.btnText}>{loadingPass ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout Inspector Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  scroll: { padding: 16, gap: 14 },
  card: {
    backgroundColor: 'rgba(13,17,23,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.4)',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameText: { color: '#ffffff', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  roleSubText: { color: '#06b6d4', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  emailText: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 2 },
  badgeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 10 },
  roleBadge: { backgroundColor: 'rgba(6,182,212,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  roleText: { color: '#06b6d4', fontSize: 10, fontWeight: '800' },
  plantBadge: { backgroundColor: 'rgba(168,85,247,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  plantText: { color: '#a855f7', fontSize: 10, fontWeight: '800' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  pingBtn: { backgroundColor: 'rgba(6,182,212,0.12)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pingBtnText: { color: '#06b6d4', fontSize: 11, fontWeight: '700' },
  linkText: { color: '#06b6d4', fontSize: 11, fontWeight: '700' },
  diagBox: { backgroundColor: 'rgba(5,8,16,0.6)', padding: 12, borderRadius: 10, gap: 8 },
  diagRow: { flexDirection: 'row', justifyContent: 'space-between' },
  diagLabel: { color: '#94a3b8', fontSize: 12 },
  diagVal: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  diagToast: { backgroundColor: 'rgba(6,182,212,0.12)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', padding: 10, borderRadius: 8, marginBottom: 8 },
  diagToastText: { color: '#06b6d4', fontSize: 11, fontWeight: '700', textAlign: 'center' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  toggleLabel: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  toggleSub: { color: '#64748b', fontSize: 10 },

  input: {
    backgroundColor: 'rgba(5,8,16,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 8,
  },
  btnCyan: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#000000', fontSize: 13, fontWeight: '900' },
  btnLogout: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  logoutText: { color: '#f87171', fontSize: 13, fontWeight: '800' },
});
