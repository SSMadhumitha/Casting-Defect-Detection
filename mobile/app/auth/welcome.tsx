import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const features = [
  { icon: '🔬', title: 'U-Net Enhancement', desc: 'Denoising & resolution enhancement', color: '#06b6d4' },
  { icon: '🎯', title: 'YOLO Detection', desc: 'Real-time defect classification', color: '#f87171' },
  { icon: '📊', title: 'Live Analytics', desc: 'Pass/fail ratios & accuracy statistics', color: '#fbbf24' },
  { icon: '📄', title: 'PDF Reports', desc: 'Instant downloadable audit logs', color: '#4ade80' },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050810" />
      <View style={styles.inner}>
        <View style={styles.logoBadge}>
          <Text style={styles.emoji}>⚙️</Text>
        </View>

        <Text style={styles.title}>CastingAI</Text>
        <Text style={styles.sub}>Industrial Defect Detection Platform</Text>

        <View style={styles.card}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.iconBg, { backgroundColor: f.color + '15', borderColor: f.color + '30' }]}>
                <Text style={{ fontSize: 18 }}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: f.color }]}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.primaryBtnText}>🚀  Get Started Free</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.secondaryBtnText}>Sign In to Account →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  logoBadge: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(6,182,212,0.12)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emoji: { fontSize: 36 },
  title: { fontSize: 36, fontWeight: '900', color: '#06b6d4', letterSpacing: -1 },
  sub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  card: { width: '100%', backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(6,182,212,0.15)', marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconBg: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureTitle: { fontSize: 14, fontWeight: '700', marginBottom: 1 },
  featureDesc: { fontSize: 11, color: '#64748b' },
  primaryBtn: { backgroundColor: '#06b6d4', width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12, shadowColor: '#06b6d4', shadowOpacity: 0.4, shadowRadius: 14 },
  primaryBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  secondaryBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(6,182,212,0.4)' },
  secondaryBtnText: { color: '#06b6d4', fontWeight: '700', fontSize: 15 },
});
