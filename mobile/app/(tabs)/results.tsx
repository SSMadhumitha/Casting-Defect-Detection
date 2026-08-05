import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { makeUrlDynamic } from '../../lib/api';

export default function ResultsScreen() {
  const { result: raw } = useLocalSearchParams();
  const result = raw ? JSON.parse(raw as string) : null;

  if (!result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
          </View>
          <Text style={styles.emptyText}>No Inspection Results Available</Text>
          <Text style={styles.emptySub}>Process a scan in the Upload tab to generate output</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/upload')}>
            <Text style={styles.primaryBtnText}>Upload Image for Scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isValidCasting = result.is_valid_casting !== false;
  const hasDefects = isValidCasting && result.detections?.length > 0;

  const bannerColor = !isValidCasting ? '#f59e0b' : hasDefects ? '#f87171' : '#4ade80';
  const bannerIcon = !isValidCasting ? '⚠️' : hasDefects ? '🔴' : '🟢';
  const bannerTitle = !isValidCasting ? 'NON-CASTING SCAN DETECTED' : hasDefects ? 'DEFECT DETECTED' : 'CASTING PASSED';
  const bannerSub = !isValidCasting
    ? (result.validation_message || 'Image does not appear to be an industrial casting X-ray scan. Please capture or upload a clear radiograph.')
    : hasDefects
    ? `${result.detections.length} defect area(s) found in scan`
    : 'Zero defects detected by computer vision models';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.banner, { borderColor: `${bannerColor}80`, backgroundColor: `${bannerColor}12` }]}>
          <Text style={{ fontSize: 36, marginBottom: 6 }}>{bannerIcon}</Text>
          <Text style={[styles.bannerTitle, { color: bannerColor }]}>
            {bannerTitle}
          </Text>
          <Text style={styles.bannerSub}>
            {bannerSub}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'DEFECTS FOUND', value: !isValidCasting ? 'N/A' : String(result.detections?.length || 0), color: !isValidCasting ? '#f59e0b' : '#f87171' },
            { label: 'VERDICT', value: !isValidCasting ? 'INVALID' : hasDefects ? 'FAIL' : 'PASS', color: bannerColor },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>PIPELINE OUTPUT SCANS</Text>

        {[
          { src: makeUrlDynamic(result.original_image), label: '📷 RAW INPUT SCAN', color: '#06b6d4' },
          { src: makeUrlDynamic(result.filtered_image), label: '🧠 U-NET ENHANCED', color: '#fbbf24' },
          { src: makeUrlDynamic(result.output_image), label: '🎯 YOLO DEFECT OVERLAY', color: '#f87171' },
        ].map((img, i) => img.src && (
          <View key={i} style={[styles.imageCard, { borderColor: img.color + '30' }]}>
            <Text style={[styles.imageLabel, { color: img.color }]}>{img.label}</Text>
            <Image source={{ uri: img.src }} style={styles.image} resizeMode="contain" />
          </View>
        ))}

        {hasDefects && (
          <View style={styles.detectionCard}>
            <Text style={styles.detectionTitle}>DETECTION PARAMETERS</Text>
            {result.detections.map((d: any, i: number) => (
              <View key={i} style={styles.detectionRow}>
                <Text style={styles.detectionIdx}>#{i + 1}</Text>
                <Text style={styles.detectionClass}>{d.class_name}</Text>
                <Text style={styles.detectionConf}>{(d.confidence * 100).toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/upload')}>
          <Text style={styles.primaryBtnText}>New Inspection Scan →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050810' },
  container: { padding: 20, paddingBottom: 48 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  iconCircle: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(6,182,212,0.12)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyText: { color: '#f1f5f9', fontSize: 18, fontWeight: '800' },
  emptySub: { color: '#64748b', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  banner: { borderRadius: 16, borderWidth: 2, padding: 20, alignItems: 'center', marginBottom: 20 },
  bannerTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  bannerSub: { color: '#94a3b8', fontSize: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: 'rgba(13,17,23,0.85)', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statLabel: { color: '#64748b', fontSize: 10, fontWeight: '700', marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '900' },
  sectionTitle: { color: '#64748b', fontWeight: '800', fontSize: 11, marginBottom: 10, letterSpacing: 1 },
  imageCard: { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  imageLabel: { fontWeight: '800', fontSize: 11, marginBottom: 8, letterSpacing: 0.5 },
  image: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#050810' },
  detectionCard: { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  detectionTitle: { color: '#06b6d4', fontWeight: '800', fontSize: 11, letterSpacing: 1, marginBottom: 12 },
  detectionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  detectionIdx: { color: '#64748b', width: 24, fontSize: 12, fontFamily: 'monospace' },
  detectionClass: { color: '#f1f5f9', flex: 1, fontWeight: '600', fontSize: 13 },
  detectionConf: { color: '#fbbf24', fontWeight: '700', fontSize: 13 },
  primaryBtn: { backgroundColor: '#06b6d4', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
});
