import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../src/stores/themeStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AdminAlerts() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', severity: 'moyen', target_district: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAlerts() }, [])

  const loadAlerts = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')
      const res = await fetch(`${API_BASE_URL}/api/alerts/active`, { headers: { 'Authorization': `Bearer ${cleanToken}` } })
      setAlerts(await res.json())
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const createAlert = async () => {
    if (!form.title || !form.message) { Alert.alert('Erreur', 'Veuillez remplir tous les champs'); return }
    setSaving(true)
    try {
      const token = await AsyncStorage.getItem('token')
      await fetch(`${API_BASE_URL}/api/alerts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      setShowModal(false)
      setForm({ title: '', message: '', severity: 'moyen', target_district: '' })
      await loadAlerts()
      Alert.alert('Succès', 'Alerte créée')
    } catch (error) { Alert.alert('Erreur', 'Impossible de créer l\'alerte') }
    finally { setSaving(false) }
  }

  const deleteAlert = async (id: number) => {
    Alert.alert('Confirmation', 'Supprimer cette alerte ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        const token = await AsyncStorage.getItem('token')
        await fetch(`${API_BASE_URL}/api/alerts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        await loadAlerts()
      }}
    ])
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critique': return '#ff3b30'
      case 'eleve': return '#ff9500'
      case 'moyen': return '#ffd60a'
      default: return '#39ff88'
    }
  }

  if (loading) return <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}><ActivityIndicator size="large" color="#a855f7" /></SafeAreaView>

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="alert-circle-outline" size={24} /> Gestion des alertes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}><Ionicons name="add-outline" size={24} color="#ffffff" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}><Ionicons name="notifications-off-outline" size={64} color={isDark ? '#64748b' : '#94a3b8'} /><Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Aucune alerte active</Text></View>
        ) : (
          alerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderLeftColor: getSeverityColor(alert.severity) }]}>
              <View style={styles.alertHeader}>
                <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(alert.severity)}20` }]}><Text style={[styles.severityText, { color: getSeverityColor(alert.severity) }]}>{alert.severity}</Text></View>
                <TouchableOpacity onPress={() => deleteAlert(alert.id)}><Ionicons name="trash-outline" size={20} color="#ff3b30" /></TouchableOpacity>
              </View>
              <Text style={[styles.alertTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{alert.title}</Text>
              <Text style={[styles.alertMessage, { color: isDark ? '#94a3b8' : '#64748b' }]}>{alert.message}</Text>
              <Text style={[styles.alertDate, { color: isDark ? '#64748b' : '#94a3b8' }]}>{new Date(alert.created_at).toLocaleString('fr-FR')}</Text>
              {alert.target_district && <View style={styles.districtBadge}><Ionicons name="location-outline" size={14} color="#a855f7" /><Text style={[styles.districtText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{alert.target_district}</Text></View>}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#0b1023' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Nouvelle alerte</Text>
            <TextInput style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e' }]} placeholder="Titre" placeholderTextColor="#94a3b8" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
            <TextInput style={[styles.input, styles.textArea, { color: isDark ? '#ffffff' : '#1a2c3e' }]} placeholder="Message" placeholderTextColor="#94a3b8" multiline numberOfLines={3} value={form.message} onChangeText={(t) => setForm({ ...form, message: t })} />
            <TextInput style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e' }]} placeholder="District cible (optionnel)" placeholderTextColor="#94a3b8" value={form.target_district} onChangeText={(t) => setForm({ ...form, target_district: t })} />
            <View style={styles.severityContainer}>
              <Text style={[styles.severityLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Sévérité :</Text>
              <View style={styles.severityOptions}>
                {['faible', 'moyen', 'eleve', 'critique'].map(sev => (
                  <TouchableOpacity key={sev} style={[styles.severityOption, form.severity === sev && { backgroundColor: `${getSeverityColor(sev)}20`, borderColor: getSeverityColor(sev) }]} onPress={() => setForm({ ...form, severity: sev })}>
                    <Text style={[styles.severityOptionText, { color: form.severity === sev ? getSeverityColor(sev) : '#94a3b8' }]}>{sev}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelBtnText}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={createAlert} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.confirmBtnText}>Publier</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  alertCard: { borderRadius: 16, padding: 16, borderLeftWidth: 4 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { fontSize: 11, fontWeight: '600' },
  alertTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  alertMessage: { fontSize: 13, marginBottom: 8, lineHeight: 18 },
  alertDate: { fontSize: 11 },
  districtBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  districtText: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, fontSize: 16, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  severityContainer: { marginBottom: 16 },
  severityLabel: { fontSize: 14, marginBottom: 8 },
  severityOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  severityOption: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  severityOptionText: { fontSize: 13 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#64748b' },
  cancelBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#a855f7' },
  confirmBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
})