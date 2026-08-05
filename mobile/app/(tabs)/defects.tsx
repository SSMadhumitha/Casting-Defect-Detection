import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Defect {
  id: string;
  name: string;
  category: string;
  severity: string;
  severityColor: string;
  astm: string;
  icon: string;
  desc: string;
  causes: string[];
  prevention: string[];
  remediation: string;
}

const CATALOG: Defect[] = [
  {
    id: 'porosity',
    name: 'Gas Porosity & Micro-Voids',
    category: 'Gas Voids',
    severity: 'High',
    severityColor: '#f87171',
    astm: 'ASTM E155 Vol 1',
    icon: '🫧',
    desc: 'Spherical cavities caused by trapped gas/hydrogen during pouring.',
    causes: ['Moisture in molding sand', 'High pouring temperature', 'Poor mold venting'],
    prevention: ['Purge liquid metal with argon', 'Preheat ladles', 'Increase riser vents'],
    remediation: 'Vacuum resin impregnation for surface micro-voids.',
  },
  {
    id: 'shrinkage',
    name: 'Shrinkage Cavity',
    category: 'Thermal',
    severity: 'Critical',
    severityColor: '#ef4444',
    astm: 'ASTM E155 Vol 2',
    icon: '⚡',
    desc: 'Jagged internal voids formed from thermal liquid contraction.',
    causes: ['Improper riser volume', 'Abrupt section changes', 'Ingate freezing'],
    prevention: ['Apply directional solidification', 'Redesign fillets', 'Optimize pouring speed'],
    remediation: 'Structural rejection; non-critical weld repair per AWS D1.1.',
  },
  {
    id: 'inclusion',
    name: 'Sand & Slag Inclusions',
    category: 'Inclusion',
    severity: 'Medium',
    severityColor: '#f59e0b',
    astm: 'ASTM E155 Vol 1',
    icon: '🪨',
    desc: 'Non-metallic particles trapped in molten stream.',
    causes: ['Runner sand erosion', 'Inadequate skimming', 'Turbulent mold filling'],
    prevention: ['Use ceramic foam filters', 'Apply zircon coatings', 'Pressurized gating'],
    remediation: 'Grind out surface particles within tolerances.',
  },
  {
    id: 'crack',
    name: 'Hot Tears & Cracks',
    category: 'Fracture',
    severity: 'Critical',
    severityColor: '#dc2626',
    astm: 'ASTM E155 Vol 3',
    icon: '💥',
    desc: 'Intergranular stress tears occurring near solidus temperature.',
    causes: ['Rigid core constraint', 'Extreme section thickness differences', 'High sulfur content'],
    prevention: ['Increase core collapsibility', 'Grain refinement additives', 'Uniform wall radii'],
    remediation: 'Immediate scrap for pressure parts; dye penetrant testing (PT).',
  },
  {
    id: 'blowhole',
    name: 'Surface Blowholes',
    category: 'Gas Voids',
    severity: 'Medium',
    severityColor: '#f59e0b',
    astm: 'ASTM E155 Vol 1',
    icon: '🕳️',
    desc: 'Smooth gas bubbles exposed during machining.',
    causes: ['Core binder gas', 'Mold interface oxides', 'Permanent mold moisture'],
    prevention: ['Bake sand cores thoroughly', 'Low-gas binder', 'Preheat mold >180°C'],
    remediation: 'Cosmetic micro-TIG welding with stress relief.',
  },
  {
    id: 'coldshut',
    name: 'Cold Shut & Flow Lap',
    category: 'Discontinuity',
    severity: 'High',
    severityColor: '#f87171',
    astm: 'ASTM E155 Vol 2',
    icon: '🌊',
    desc: 'Unfused interface between two converging metal streams.',
    causes: ['Low pour temperature', 'Interrupted stream', 'Long runner flow path'],
    prevention: ['Increase pour temp', 'Automated ladle stream', 'Optimize runner length'],
    remediation: 'Ultrasonic testing (UT) required to verify joint strength.',
  },
];

export default function DefectsScreen() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = CATALOG.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>📖 NDT KNOWLEDGE BASE</Text>
          <Text style={styles.title}>Defect Catalog</Text>
          <Text style={styles.subtitle}>ASTM E155 & ISO 9001 Industrial Standards</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search defect type or standard..."
            placeholderTextColor="#475569"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* List */}
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.astmText}>{item.astm}</Text>
                </View>
                <View style={[styles.riskTag, { backgroundColor: `${item.severityColor}20`, borderColor: `${item.severityColor}50` }]}>
                  <Text style={[styles.riskText, { color: item.severityColor }]}>{item.severity}</Text>
                </View>
              </View>

              <Text style={styles.descText}>{item.desc}</Text>

              {/* Expanded details */}
              {isExpanded && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.sectionHeader}>⚠️ Primary Causes:</Text>
                  {item.causes.map((c, i) => (
                    <Text key={i} style={styles.detailItem}>• {c}</Text>
                  ))}

                  <Text style={[styles.sectionHeader, { marginTop: 10, color: '#10b981' }]}>🛡️ Prevention:</Text>
                  {item.prevention.map((p, i) => (
                    <Text key={i} style={styles.detailItem}>✓ {p}</Text>
                  ))}

                  <View style={styles.remediationBox}>
                    <Text style={styles.remediationTitle}>🔧 Remediation:</Text>
                    <Text style={styles.remediationText}>{item.remediation}</Text>
                  </View>
                </View>
              )}

              <Text style={styles.tapPrompt}>{isExpanded ? '▲ Hide Details' : '▼ Tap for Protocol & Remediation'}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  scroll: { padding: 16, gap: 14 },
  header: { marginBottom: 6 },
  badge: { color: '#06b6d4', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 },
  subtitle: { color: '#94a3b8', fontSize: 12 },
  searchBox: {
    backgroundColor: 'rgba(13,17,23,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { color: '#ffffff', fontSize: 13 },
  card: {
    backgroundColor: 'rgba(13,17,23,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  astmText: { color: '#06b6d4', fontSize: 11, fontWeight: '600', marginTop: 1 },
  riskTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  riskText: { fontSize: 10, fontWeight: '800' },
  descText: { color: '#cbd5e1', fontSize: 12, marginTop: 10, lineHeight: 18 },
  tapPrompt: { color: '#06b6d4', fontSize: 11, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  detailsContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  sectionHeader: { color: '#f87171', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  detailItem: { color: '#cbd5e1', fontSize: 11, marginLeft: 6, marginBottom: 2 },
  remediationBox: { marginTop: 10, backgroundColor: 'rgba(6,182,212,0.08)', padding: 10, borderRadius: 8 },
  remediationTitle: { color: '#06b6d4', fontSize: 11, fontWeight: '800' },
  remediationText: { color: '#e2e8f0', fontSize: 11, marginTop: 2 },
});
