import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { authFetch, removeToken } from '../../lib/api';

const actions = [
  { icon: '🚀', label: 'Upload Inspection',   sub: 'Start a new AI scan',    route: '/(tabs)/upload',    color: '#06b6d4' },
  { icon: '📊', label: 'View Results',   sub: 'Inspect latest output',  route: '/(tabs)/results',   color: '#f87171' },
  { icon: '📈', label: 'Analytics',      sub: 'Trends & precision metrics', route: '/(tabs)/analytics', color: '#fbbf24' },
  { icon: '📄', label: 'Reports',        sub: 'Audit history logs',      route: '/(tabs)/reports',   color: '#4ade80' },
];

export default function DashboardScreen() {
  const [user, setUser]   = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(() => {
    Promise.all([
      authFetch('/auth/me').then(r => r.json()),
      authFetch('/stats').then(r => r.json()),
    ])
      .then(([u, s]) => { setUser(u); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const logout = async () => {
    await removeToken();
    router.replace('/auth/welcome');
  };

  const statCards = stats
    ? [
        { label: 'Total Scans',    value: String(stats.total_inspections), color: '#06b6d4' },
        { label: 'Defects Found',  value: String(stats.defects_detected),  color: '#f87171' },
        { label: 'Pass Rate',      value: `${stats.pass_rate}%`,           color: '#4ade80' },
        { label: 'Avg Confidence', value: `${stats.avg_confidence}%`,      color: '#fbbf24' },
      ]
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OPERATIONS ACTIVE</Text>
            </View>
            <Text style={styles.greeting}>Hi, {user?.full_name?.split(' ')[0] || 'Inspector'} 👋</Text>
            <Text style={styles.headerSub}>Industrial AI Inspection Platform</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#06b6d4" size="large" />
            <Text style={styles.loadingText}>Fetching AI telemetry...</Text>
          </View>
        ) : stats?.total_inspections === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No inspections yet. Upload an X-Ray scan to start!</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statCards.map((s, i) => (
              <View key={i} style={[styles.statCard, { borderColor: s.color + '30' }]}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <Text style={styles.sectionTitle}>WORKSPACES & ACTIONS</Text>
        {actions.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, { borderLeftColor: a.color }]}
            activeOpacity={0.8}
            onPress={() => router.push(a.route as any)}
          >
            <View style={[styles.cardIconBox, { backgroundColor: a.color + '15', borderColor: a.color + '30' }]}>
              <Text style={styles.cardIcon}>{a.icon}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: a.color }]}>{a.label}</Text>
              <Text style={styles.cardSub}>{a.sub}</Text>
            </View>
            <Text style={{ color: a.color, fontSize: 18, fontWeight: '900' }}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Pipeline */}
        <View style={styles.workflowBox}>
          <Text style={styles.sectionTitle}>AI PIPELINE STAGES</Text>
          <View style={styles.workflow}>
            {['📤 Upload', '🧠 U-Net', '🎯 YOLO', '📊 Analytics', '📄 Report'].map((s, i) => (
              <View key={i} style={styles.stepPill}>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050810' },
  container: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  badge: { backgroundColor: 'rgba(6,182,212,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', alignSelf: 'flex-start', marginBottom: 6 },
  badgeText: { color: '#06b6d4', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#f1f5f9' },
  headerSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.08)' },
  logoutText: { color: '#f87171', fontSize: 11, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 28, gap: 12, marginBottom: 24 },
  loadingText: { color: '#64748b', fontSize: 13 },
  emptyBox: { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 14, padding: 20, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  emptyText: { color: '#64748b', fontSize: 13, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '46%', backgroundColor: 'rgba(13,17,23,0.85)', padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 10, fontWeight: '700', marginBottom: 6, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 28, fontWeight: '900' },
  sectionTitle: { color: '#64748b', fontWeight: '800', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: 'rgba(13,17,23,0.85)', padding: 14, borderRadius: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderLeftWidth: 3 },
  cardIconBox: { width: 42, height: 42, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardIcon: { fontSize: 22 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  cardSub: { color: '#64748b', fontSize: 12 },
  workflowBox: { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(6,182,212,0.15)' },
  workflow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  stepPill: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)' },
  stepText: { color: '#06b6d4', fontSize: 11, fontWeight: '600' },
});
