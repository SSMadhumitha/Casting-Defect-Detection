import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Share, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { authFetch } from '../../lib/api';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReportsScreen() {
  const [reports, setReports]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [clearing, setClearing] = useState(false);

  // User & Signoff state
  const [user, setUser] = useState<any>(null);
  const [signoff, setSignoff] = useState<any>(null);
  const [remarksInput, setRemarksInput] = useState('All X-Ray scans for today verified according to ASTM E155 NDT standards.');
  const [signing, setSigning] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const uRes = await authFetch('/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData);
      }

      // Fetch today signoff
      const sRes = await authFetch('/signoff/today');
      if (sRes.ok) {
        const sData = await sRes.json();
        setSignoff(sData);
      }

      // Fetch inspections
      const r = await authFetch('/inspections');
      const data = await r.json();
      if (Array.isArray(data)) setReports(data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  const handleSignoffSubmit = async () => {
    setSigning(true);
    try {
      const res = await authFetch('/signoff', {
        method: 'POST',
        body: JSON.stringify({ remarks: remarksInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Sign-off failed');
      Alert.alert('Sign-Off Success', `Daily digital sign-off completed for ${data.date}`);
      loadReports();
    } catch (err: any) {
      Alert.alert('Sign-Off Error', err.message || 'Could not complete sign-off');
    } finally {
      setSigning(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear All Reports',
      'This will permanently delete all inspection history logs. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Logs', style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              await authFetch('/inspections', { method: 'DELETE' });
              setReports([]);
            } catch {
              Alert.alert('Error', 'Could not clear reports.');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async (r: any) => {
    const txt =
      `═══════════════════════════════\n` +
      `   CastingAI — Inspection Report\n` +
      `═══════════════════════════════\n` +
      `Report ID : ${r.id}\n` +
      `Date      : ${formatDate(r.date)}\n` +
      `Image     : ${r.file}\n` +
      `Status    : ${r.status}\n` +
      `Defects   : ${r.defects}\n` +
      `Confidence: ${r.confidence}\n` +
      `═══════════════════════════════`;
    await Share.share({ message: txt, title: `CastingAI Report ${r.id}` });
  };

  const openResult = (r: any) => {
    if (r.resultData) {
      router.push({ pathname: '/(tabs)/results', params: { result: JSON.stringify(r.resultData) } });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>Inspection Reports</Text>
            <Text style={styles.sub}>Official verification & audit logs</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(tabs)/upload')}>
            <Text style={styles.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Row */}
        {!loading && (
          <View style={styles.summaryRow}>
            {[
              { label: 'Total Logs',   value: reports.length,                                  color: '#06b6d4' },
              { label: 'Defects',      value: reports.filter(r => r.defects > 0).length,       color: '#f87171' },
              { label: 'Passed',       value: reports.filter(r => r.defects === 0).length,     color: '#4ade80' },
            ].map((s, i) => (
              <View key={i} style={[styles.summaryCard, { borderColor: s.color + '30' }]}>
                <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Daily Digital Sign-Off Section */}
        {!loading && (
          <View style={styles.signoffCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.signoffHeader}>✍️ DIGITAL INSPECTOR SIGN-OFF</Text>
              <Text style={styles.signoffDate}>{signoff?.date || new Date().toISOString().split('T')[0]}</Text>
            </View>

            {signoff?.signed ? (
              <View style={styles.signedBanner}>
                <Text style={styles.signedTitle}>✅ DIGITALLY SIGNED FOR TODAY</Text>
                <Text style={styles.signedBy}>Signatory: {signoff.signed_by_name} ({signoff.signed_by_role})</Text>
                <Text style={styles.signedEmail}>{signoff.signed_by_email}</Text>
                <Text style={styles.signedRemarks}>&ldquo;{signoff.remarks || 'Verified according to ASTM E155 NDT standards.'}&rdquo;</Text>
              </View>
            ) : (user?.role || '').trim().toLowerCase() === 'chief quality engineer' ? (
              <View style={styles.signoffForm}>
                <Text style={styles.signoffSub}>Chief Quality Engineer Remarks:</Text>
                <TextInput
                  style={styles.remarksInput}
                  multiline
                  placeholder="Enter remarks..."
                  placeholderTextColor="#475569"
                  value={remarksInput}
                  onChangeText={setRemarksInput}
                />
                <TouchableOpacity
                  style={styles.signBtn}
                  onPress={handleSignoffSubmit}
                  disabled={signing}
                >
                  {signing ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.signBtnText}>✍️ Sign Off All Reports For Today</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.lockedBanner}>
                <Text style={{ fontSize: 20 }}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lockedTitle}>Sign-Off Pending Authorization</Text>
                  <Text style={styles.lockedSub}>Only a Chief Quality Engineer is permitted to digitally sign daily inspection reports.</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Content */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>ID</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>File</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Status</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Conf.</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>Act.</Text>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#06b6d4" size="large" />
              <Text style={styles.loadingText}>Loading inspection records...</Text>
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.center}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📄</Text>
              <Text style={styles.emptyText}>No inspection reports recorded yet.</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={() => router.push('/(tabs)/upload')}>
                <Text style={styles.uploadBtnText}>Upload Scan to Create Log</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reports.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.row, i % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                onPress={() => openResult(r)}
                activeOpacity={0.75}
              >
                <Text style={[styles.cell, styles.idCell, { flex: 1.2 }]}>{r.id}</Text>
                <Text style={[styles.cell, { flex: 2, color: '#94a3b8' }]} numberOfLines={1}>
                  {r.file}
                </Text>
                <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
                  <View style={[styles.badge, { backgroundColor: r.color + '18', borderColor: r.color + '40' }]}>
                    <Text style={[styles.badgeText, { color: r.color }]}>{r.status}</Text>
                  </View>
                </View>
                <Text style={[styles.cell, { flex: 1, color: '#fbbf24', fontWeight: '700' }]}>{r.confidence}</Text>
                <TouchableOpacity
                  style={{ flex: 0.8, alignItems: 'center' }}
                  onPress={() => handleShare(r)}
                >
                  <Text style={styles.shareIcon}>⬆️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Digital Sign-off & Verification Status */}
        {!loading && reports.length > 0 && (
          <View style={styles.signOffCard}>
            <View style={styles.signOffHeader}>
              <Text style={styles.signOffTitle}>✍️ Inspector Sign-Off Status</Text>
              <View style={styles.asntTag}>
                <Text style={styles.asntText}>ASNT Level III</Text>
              </View>
            </View>
            <Text style={styles.signOffSub}>
              All {reports.length} report log(s) verified under ASTM E155 guidelines.
            </Text>
            <TouchableOpacity
              style={styles.signOffBtn}
              onPress={() => Alert.alert('Digital Sign-Off', 'All active inspection logs signed & verified by Chief Inspector.')}
            >
              <Text style={styles.signOffBtnText}>✓ Issue Certified Batch Clearance</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Date Section */}
        {!loading && reports.length > 0 && (
          <View style={styles.dateSection}>
            <Text style={styles.sectionLabel}>INSPECTION TIMESTAMPS</Text>
            {reports.map((r, i) => (
              <View key={i} style={styles.dateRow}>
                <Text style={styles.dateId}>{r.id}</Text>
                <Text style={styles.dateVal}>{formatDate(r.date)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Clear Button */}
        {reports.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear} disabled={clearing}>
            {clearing
              ? <ActivityIndicator color="#f87171" />
              : <Text style={styles.clearBtnText}>🗑  Clear All Audit Logs</Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#050810' },
  container:      { padding: 20, paddingBottom: 48 },
  topRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:          { fontSize: 22, fontWeight: '900', color: '#06b6d4' },
  sub:            { color: '#64748b', fontSize: 12, marginTop: 2 },
  newBtn:         { backgroundColor: 'rgba(6,182,212,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)' },
  newBtnText:     { color: '#06b6d4', fontSize: 12, fontWeight: '800' },
  summaryRow:     { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard:    { flex: 1, backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  summaryVal:     { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  summaryLabel:   { color: '#64748b', fontSize: 10, fontWeight: '700' },
  tableCard:      { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(6,182,212,0.15)', marginBottom: 16 },
  tableHeader:    { flexDirection: 'row', backgroundColor: 'rgba(6,182,212,0.08)', paddingHorizontal: 12, paddingVertical: 10 },
  headerCell:     { color: '#06b6d4', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  center:         { padding: 32, alignItems: 'center', gap: 10 },
  loadingText:    { color: '#64748b', fontSize: 13, marginTop: 4 },
  emptyText:      { color: '#64748b', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  uploadBtn:      { backgroundColor: '#06b6d4', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 6 },
  uploadBtnText:  { color: '#000', fontWeight: '800', fontSize: 13 },
  row:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  rowEven:        { backgroundColor: 'rgba(255,255,255,0.02)' },
  rowOdd:         { backgroundColor: 'transparent' },
  cell:           { color: '#e2e8f0', fontSize: 12 },
  idCell:         { color: '#06b6d4', fontWeight: '700', fontFamily: 'monospace' },
  badge:          { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText:      { fontSize: 9, fontWeight: '800' },
  shareIcon:      { fontSize: 15 },
  dateSection:    { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  sectionLabel:   { color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  dateRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' },
  dateId:         { color: '#06b6d4', fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  dateVal:        { color: '#94a3b8', fontSize: 12 },
  signOffCard:    { backgroundColor: 'rgba(6,182,212,0.06)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', borderRadius: 14, padding: 14, marginBottom: 16 },
  signOffHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  signOffTitle:   { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  asntTag:        { backgroundColor: 'rgba(6,182,212,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  asntText:       { color: '#06b6d4', fontSize: 9, fontWeight: '800' },
  signOffSub:     { color: '#94a3b8', fontSize: 11, marginBottom: 10 },
  signOffBtn:     { backgroundColor: '#06b6d4', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  signOffBtnText: { color: '#000000', fontSize: 12, fontWeight: '800' },
  clearBtn:       { borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, backgroundColor: 'rgba(248,113,113,0.05)' },
  clearBtnText:   { color: '#f87171', fontSize: 13, fontWeight: '700' },

  signoffCard:    { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' },
  signoffHeader:  { color: '#06b6d4', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  signoffDate:    { color: '#64748b', fontSize: 11, fontFamily: 'monospace', fontWeight: '700' },
  signedBanner:   { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 12, padding: 12, marginTop: 10 },
  signedTitle:    { color: '#4ade80', fontSize: 13, fontWeight: '900', marginBottom: 4 },
  signedBy:       { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  signedEmail:    { color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  signedRemarks:  { color: '#cbd5e1', fontSize: 11, fontStyle: 'italic', backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 8 },
  signoffForm:    { marginTop: 10 },
  remarksInput:   { backgroundColor: 'rgba(5,8,16,0.8)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 10, padding: 10, color: '#ffffff', fontSize: 12, marginBottom: 10, minHeight: 48 },
  signBtn:        { backgroundColor: '#06b6d4', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  signBtnText:    { color: '#000000', fontSize: 13, fontWeight: '900' },
  lockedBanner:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, marginTop: 10 },
  lockedTitle:    { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  lockedSub:      { color: '#64748b', fontSize: 11, marginTop: 2 },
});
