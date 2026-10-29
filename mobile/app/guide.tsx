import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../src/stores/themeStore'
import ThemeToggle from '../src/components/ThemeToggle'

export default function GuideScreen() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [activeSection, setActiveSection] = useState<'cyclone' | 'inondation' | 'app'>('cyclone')

  const sections = [
    { id: 'cyclone' as const, icon: 'tornado-outline', label: 'Cyclone', color: '#ff9500' },
    { id: 'inondation' as const, icon: 'water-outline', label: 'Inondation', color: '#38bdf8' },
    { id: 'app' as const, icon: 'phone-portrait-outline', label: 'Guide App', color: '#a855f7' },
  ]

  const cycloneGuide = {
    before: [
      'Preparer un kit d\'urgence (eau, nourriture, medicaments, lampe)',
      'Charger tous vos appareils electroniques',
      'Securiser les fenetres et les portes',
      'Identifier le refuge le plus proche via SafeZone',
      'Stocker de l\'eau potable (3 jours minimum)',
      'Mettre les documents importants dans un sac etanche',
      'Ecouter la radio pour les bulletins meteo officiels',
      'Couper les branches mortes autour de la maison',
    ],
    during: [
      'Restez a l\'interieur - NE SORTEZ PAS',
      'Eloignez-vous des fenetres et murs exterieurs',
      'Refugiez-vous dans la piece la plus sure (cave, salle de bain)',
      'Coupez l\'electricite et le gaz si necessaire',
      'Utilisez SafeZone pour trouver un refuge si besoin',
      'N\'utilisez pas l\'ascenseur',
      'Gardez votre telephone charge et accessible',
      'Attendez le signal officiel de fin d\'alerte',
    ],
    after: [
      'Attendez la confirmation officielle avant de sortir',
      'Verifiez votre maison pour les degats structurels',
      'Ne touchez pas les fils electriques au sol',
      'Ne buvez pas l\'eau du robinet sans confirmation',
      'Signalez les degats via SafeZone',
      'Aidez vos voisins si possible',
      'Ecoutez les instructions des autorites',
      'Photographiez les degats pour l\'assurance',
    ],
  }

  const inondationGuide = {
    before: [
      'Surveillez les alertes meteo',
      'Preparez un sac d\'evacuation',
      'Deplacez les objets de valeur en hauteur',
      'Identifiez les zones surlevees proches',
      'Connaissez les numeros d\'urgence',
      'Prevoyez des sacs de sable si necessaire',
      'Fermez les vannes du gaz et de l\'electricite',
      'Ayez une radio a piles',
    ],
    during: [
      'Montez immediatement en hauteur',
      'Ne traversez JAMAIS une zone inondee a pied ou en voiture',
      'Coupez l\'electricite',
      'Evacuez les personnes vulnerables (enfants, personnes agees)',
      'Ecoutez les consignes des autorites',
      'Ne buvez pas l\'eau du robinet',
      'Evitez les ponts et les rivieres',
      'Protegez-vous des animaux dangereux (serpents)',
    ],
    after: [
      'Ne rentrez chez vous que si les autorites le permettent',
      'Verifiez les degats structurels',
      'Faites secher votre maison pour eviter les moisissures',
      'Desinfectez tout ce qui a ete en contact avec l\'eau',
      'Signalez les degats a votre assurance',
      'Faites appel a des professionnels pour l\'electricite',
      'Surveillez votre sante (infections)',
      'Evitez les eaux stagnantes (moustiques)',
    ],
  }

  const appGuide = {
    title: 'Guide d\'utilisation de SafeZone',
    steps: [
      {
        icon: 'person-add-outline',
        title: '1. Creer un compte',
        desc: 'Inscrivez-vous avec votre email et mot de passe. Vous pouvez aussi utiliser Google ou Facebook.',
      },
      {
        icon: 'map-outline',
        title: '2. Trouver un refuge',
        desc: 'Activez votre GPS et cliquez sur "Trouver refuge". L\'app calcule le meilleur itineraire (Dijkstra ou A*).',
      },
      {
        icon: 'flash-outline',
        title: '3. Mode urgence',
        desc: 'Configurez votre code PIN dans le profil. En situation critique, utilisez ce mode pour acceder rapidement a la carte.',
      },
      {
        icon: 'alert-circle-outline',
        title: '4. Alertes en temps reel',
        desc: 'Recevez les notifications des autorites (cyclones, inondations, routes coupees).',
      },
      {
        icon: 'flag-outline',
        title: '5. Signaler un danger',
        desc: 'Photographiez et signalez les zones dangereuses pour aider la communaute.',
      },
      {
        icon: 'person-outline',
        title: '6. Profil et code PIN',
        desc: 'Personnalisez votre profil et definissez votre code d\'urgence a 4 chiffres.',
      },
    ],
    tips: [
      'Activez les notifications pour ne rien rater',
      'Testez votre code PIN avant une situation reelle',
      'Consultez la meteo chaque matin',
      'Participez aux exercices d\'evacuation',
    ],
  }

  const emergencyNumbers = [
    { name: 'BNGRC', number: '123', desc: 'Catastrophes naturelles', icon: 'shield-outline' },
    { name: 'Pompiers', number: '118', desc: 'Incendies et secours', icon: 'flame-outline' },
    { name: 'SAMU', number: '124', desc: 'Urgences medicales', icon: 'heart-outline' },
    { name: 'Police', number: '117', desc: 'Securite publique', icon: 'shield-checkmark-outline' },
  ]

  const renderCycloneGuide = () => (
    <>
      <View style={[styles.guideCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
        <View style={[styles.cardHeader, { backgroundColor: '#ff950015', borderColor: '#ff950030' }]}>
          <Ionicons name="time-outline" size={24} color="#ff9500" />
          <Text style={[styles.cardHeaderText, { color: '#ff9500' }]}>AVANT le cyclone</Text>
        </View>
        {cycloneGuide.before.map((item, i) => (
          <View key={i} style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={20} color="#39ff88" />
            <Text style={[styles.guideText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.guideCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
        <View style={[styles.cardHeader, { backgroundColor: '#ff3b3015', borderColor: '#ff3b3030' }]}>
          <Ionicons name="warning-outline" size={24} color="#ff3b30" />
          <Text style={[styles.cardHeaderText, { color: '#ff3b30' }]}>PENDANT le cyclone</Text>
        </View>
        {cycloneGuide.during.map((item, i) => (
          <View key={i} style={styles.guideItem}>
            <Ionicons name="alert-circle" size={20} color="#ff3b30" />
            <Text style={[styles.guideText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.guideCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
        <View style={[styles.cardHeader, { backgroundColor: '#39ff8815', borderColor: '#39ff8830' }]}>
          <Ionicons name="checkmark-done-outline" size={24} color="#39ff88" />
          <Text style={[styles.cardHeaderText, { color: '#39ff88' }]}>APRES le cyclone</Text>
        </View>
        {cycloneGuide.after.map((item, i) => (
          <View key={i} style={styles.guideItem}>
            <Ionicons name="arrow-forward-circle" size={20} color="#39ff88" />
            <Text style={[styles.guideText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{item}</Text>
          </View>
        ))}
      </View>
    </>
  )

  const renderInondationGuide = () => (
    <>
      <View style={[styles.guideCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
        <View style={[styles.cardHeader, { backgroundColor: '#38bdf815', borderColor: '#38bdf830' }]}>
          <Ionicons name="time-outline" size={24} color="#38bdf8" />
          <Text style={[styles.cardHeaderText, { color: '#38bdf8' }]}>AVANT l'inondation</Text>
        </View>
        {inondationGuide.before.map((item, i) => (
          <View key={i} style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={20} color="#39ff88" />
            <Text style={[styles.guideText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.guideCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
        <View style={[styles.cardHeader, { backgroundColor: '#ff3b3015', borderColor: '#ff3b3030' }]}>
          <Ionicons name="warning-outline" size={24} color="#ff3b30" />
          <Text style={[styles.cardHeaderText, { color: '#ff3b30' }]}>PENDANT l'inondation</Text>
        </View>
        {inondationGuide.during.map((item, i) => (
          <View key={i} style={styles.guideItem}>
            <Ionicons name="alert-circle" size={20} color="#ff3b30" />
            <Text style={[styles.guideText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.guideCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
        <View style={[styles.cardHeader, { backgroundColor: '#39ff8815', borderColor: '#39ff8830' }]}>
          <Ionicons name="checkmark-done-outline" size={24} color="#39ff88" />
          <Text style={[styles.cardHeaderText, { color: '#39ff88' }]}>APRES l'inondation</Text>
        </View>
        {inondationGuide.after.map((item, i) => (
          <View key={i} style={styles.guideItem}>
            <Ionicons name="arrow-forward-circle" size={20} color="#39ff88" />
            <Text style={[styles.guideText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{item}</Text>
          </View>
        ))}
      </View>
    </>
  )

  const renderAppGuide = () => (
    <>
      <View style={[styles.guideCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
        <Text style={[styles.appGuideTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{appGuide.title}</Text>
        {appGuide.steps.map((step, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepIcon, { backgroundColor: '#a855f715' }]}>
              <Ionicons name={step.icon as any} size={24} color="#a855f7" />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.tipsCard, { backgroundColor: isDark ? 'rgba(57,255,136,0.05)' : 'rgba(57,255,136,0.08)' }]}>
        <Text style={[styles.tipsTitle, { color: '#39ff88' }]}>Conseils pratiques</Text>
        {appGuide.tips.map((tip, i) => (
          <Text key={i} style={[styles.tipText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{tip}</Text>
        ))}
      </View>

      <Text style={[styles.sectionSubtitle, { color: isDark ? '#ffffff' : '#1a2c3e', marginTop: 20 }]}>
        Numeros d'urgence
      </Text>
      <View style={styles.emergencyGrid}>
        {emergencyNumbers.map((num, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.emergencyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}
            onPress={() => Linking.openURL(`tel:${num.number}`)}
          >
            <Ionicons name={num.icon as any} size={28} color="#ff3b30" />
            <Text style={[styles.emergencyNumber, { color: '#ff3b30' }]}>{num.number}</Text>
            <Text style={[styles.emergencyName, { color: isDark ? '#94a3b8' : '#64748b' }]}>{num.name}</Text>
            <Text style={[styles.emergencyDesc, { color: isDark ? '#64748b' : '#94a3b8' }]}>{num.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Guide</Text>
        <ThemeToggle />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>
          Guide catastrophes
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Tout ce qu'il faut savoir pour rester en securite
        </Text>

        <View style={styles.sectionSelector}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionButton,
                activeSection === section.id && styles.sectionButtonActive,
                { borderColor: activeSection === section.id ? section.color : 'transparent' },
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Ionicons name={section.icon as any} size={20} color={activeSection === section.id ? section.color : '#94a3b8'} />
              <Text style={[styles.sectionButtonText, { color: activeSection === section.id ? section.color : '#94a3b8' }]}>
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeSection === 'cyclone' && renderCycloneGuide()}
        {activeSection === 'inondation' && renderInondationGuide()}
        {activeSection === 'app' && renderAppGuide()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },

  sectionSelector: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  sectionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, borderWidth: 1 },
  sectionButtonActive: { backgroundColor: 'rgba(168,85,247,0.1)' },
  sectionButtonText: { fontSize: 14, fontWeight: '500' },

  guideCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  cardHeaderText: { fontSize: 14, fontWeight: '700' },
  guideItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  guideText: { flex: 1, fontSize: 13, lineHeight: 18 },

  appGuideTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  stepItem: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  stepIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  stepDesc: { fontSize: 13, lineHeight: 18 },

  tipsCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tipText: { fontSize: 13, paddingVertical: 4 },

  sectionSubtitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  emergencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  emergencyCard: { flex: 1, minWidth: '45%', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 },
  emergencyNumber: { fontSize: 18, fontWeight: 'bold' },
  emergencyName: { fontSize: 12, fontWeight: '600' },
  emergencyDesc: { fontSize: 10, textAlign: 'center' },
})