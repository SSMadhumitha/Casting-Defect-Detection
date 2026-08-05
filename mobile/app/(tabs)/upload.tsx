import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { API_BASE, getToken } from '../../lib/api';

export default function UploadScreen() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo library access'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.9 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const runInspection = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const token = await getToken();
      
      const formData = new FormData();
      const filename = image.uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('file', {
        uri: image.uri,
        name: filename,
        type: type,
      } as any);

      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const responseText = await res.text();
      if (!res.ok) {
        let errorMsg = 'Prediction failed';
        try {
          const errData = JSON.parse(responseText);
          errorMsg = errData.detail || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = JSON.parse(responseText);
      router.push({ pathname: '/(tabs)/results', params: { result: JSON.stringify(data) } });
    } catch (err: any) {
      console.error('[Upload Error]', err);
      const msg = err?.message || '';
      
      if (msg.includes('timed out') || msg.includes('Network request failed') || msg.includes('Could not connect')) {
        Alert.alert(
          'Connection Error',
          `Could not connect to backend server at:\n${API_BASE}\n\nTroubleshooting Checklist:\n1. Ensure FastAPI backend is running (uvicorn main:app --host 0.0.0.0 --port 8000).\n2. If using Expo Go on a physical phone, verify your phone is connected to the same Wi-Fi network as your computer (turn off 5G/cellular data).\n3. Check that firewall allows incoming port 8000 connections.`
        );
      } else {
        Alert.alert('Inspection Failed', msg || 'An unknown error occurred during image processing.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Upload X-Ray Scan</Text>
        <Text style={styles.sub}>Select or capture an industrial X-ray scan for AI analysis</Text>

        <View style={styles.dropBox}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 32 }}>📤</Text>
              </View>
              <Text style={styles.dropText}>No image selected</Text>
              <Text style={styles.dropHint}>Choose Gallery or Camera below</Text>
            </View>
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>🖼  Photo Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={takePhoto} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>📷  Camera Scan</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.fileCard}>
            <View style={styles.fileInfo}>
              <Text style={styles.fileLabel}>FILE NAME: <Text style={{ color: '#f1f5f9' }}>{image.uri.split('/').pop()}</Text></Text>
              <Text style={styles.fileLabel}>EST. SIZE: <Text style={{ color: '#f1f5f9' }}>{((image.fileSize || 0) / 1024).toFixed(1)} KB</Text></Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={runInspection} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.primaryBtnText}>🎯  Run AI Inspection</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={() => setImage(null)}>
              <Text style={styles.clearBtnText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050810' },
  container: { padding: 20, paddingBottom: 48, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#06b6d4', alignSelf: 'flex-start', marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 13, alignSelf: 'flex-start', marginBottom: 20 },
  dropBox: { width: '100%', minHeight: 220, backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 20, borderWidth: 2, borderColor: 'rgba(6,182,212,0.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 16, padding: 16 },
  iconCircle: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(6,182,212,0.12)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  dropText: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  dropHint: { color: '#64748b', fontSize: 12 },
  preview: { width: '100%', height: 230, borderRadius: 12 },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(13,17,23,0.85)', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' },
  secondaryBtnText: { color: '#06b6d4', fontWeight: '700', fontSize: 13 },
  fileCard: { width: '100%', backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  fileInfo: { marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  fileLabel: { color: '#64748b', fontSize: 11, marginBottom: 4, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#06b6d4', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', shadowColor: '#06b6d4', shadowOpacity: 0.4, shadowRadius: 12, marginBottom: 10 },
  primaryBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  clearBtn: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  clearBtnText: { color: '#f87171', fontSize: 12, fontWeight: '700' },
});
