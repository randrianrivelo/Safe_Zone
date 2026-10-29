import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Fonction pour obtenir le label du type
const getTypeLabel = (type, fr) => {
  const labels = {
    route_endommagee: fr ? 'Route endommagée' : 'Lalana simba',
    zone_danger: fr ? 'Zone dangereuse' : 'Toerana mampidi-doza',
    refuge_plein: fr ? 'Refuge saturé' : 'Toerana feno',
    inondation: fr ? 'Inondation' : 'Tondra-drano',
    besoin_urgent: fr ? 'Besoin urgent' : 'Ilaina haingana',
    alerte_cyclone: fr ? 'Alerte cyclone' : 'Fampitandremana rivo-doza',
    autre: fr ? 'Autre' : 'Hafa'
  }
  return labels[type] || type
}

// Fonction pour obtenir le label du statut
const getStatusLabel = (status, fr) => {
  const labels = {
    en_attente: fr ? 'En attente' : 'Miandry',
    verifie: fr ? 'Vérifié' : 'Voamarina',
    rejete: fr ? 'Rejeté' : 'Nolavina'
  }
  return labels[status] || status
}

// Fonction principale d'export PDF
export const exportReportsToPDF = async (reports, stats, fr) => {
  if (!reports || reports.length === 0) {
    alert(fr ? 'Aucun signalement à exporter' : 'Tsy misy fampandrenesana hatao export')
    return false
  }

  try {
    // Créer le document PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // === COULEURS ===
    const primaryColor = [168, 85, 247] // #a855f7
    const secondaryColor = [57, 255, 136] // #39ff88
    const dangerColor = [255, 59, 48] // #ff3b30
    const warningColor = [255, 149, 0] // #ff9500

    // === EN-TÊTE ===
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 50, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Smart SafeZone Analamanga 2035', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(fr ? 'Rapport des signalements citoyens' : 'Rapport des signalements citoyens', 105, 33, { align: 'center' })
    doc.text(fr ? 'Document officiel - Administration' : 'Document officiel - Administration', 105, 42, { align: 'center' })

    // === DATE D'EXPORT ===
    const now = new Date()
    const dateStr = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const timeStr = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text(fr ? `Généré le : ${dateStr} à ${timeStr}` : `Généré le : ${dateStr} à ${timeStr}`, 14, 60)

    // === STATISTIQUES ===
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(245, 245, 245)
    doc.rect(14, 68, 182, 45, 'F')
    doc.rect(14, 68, 182, 45, 'D')

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(fr ? 'Résumé des signalements' : 'Résumé des signalements', 20, 78)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // Lignes de stats
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text(`• ${fr ? 'Total signalements' : 'Total signalements'} : ${reports.length}`, 20, 88)

    doc.setTextColor(warningColor[0], warningColor[1], warningColor[2])
    doc.text(`• ${fr ? 'En attente' : 'En attente'} : ${stats.pending || reports.filter(r => r.status === 'en_attente').length}`, 20, 96)

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(`• ${fr ? 'Vérifiés' : 'Vérifiés'} : ${stats.verified || reports.filter(r => r.status === 'verifie').length}`, 20, 104)

    doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2])
    doc.text(`• ${fr ? 'Rejetés' : 'Rejetés'} : ${stats.rejected || reports.filter(r => r.status === 'rejete').length}`, 20, 112)

    let currentY = 120

    // === TABLEAU DES SIGNALEMENTS ===
    const tableColumn = [
      { header: 'ID', dataKey: 'id', width: 15 },
      { header: fr ? 'Type' : 'Type', dataKey: 'type', width: 40 },
      { header: fr ? 'Description' : 'Description', dataKey: 'description', width: 70 },
      { header: fr ? 'Statut' : 'Statut', dataKey: 'status', width: 30 },
      { header: fr ? 'Date' : 'Date', dataKey: 'date', width: 35 }
    ]

    const tableRows = reports.slice(0, 30).map(r => ({
      id: `#${r.id}`,
      type: getTypeLabel(r.report_type, fr),
      description: r.description?.substring(0, 80) || '—',
      status: getStatusLabel(r.status, fr),
      date: new Date(r.created_at).toLocaleDateString('fr-FR')
    }))

    // Ajouter le tableau
    doc.autoTable({
      startY: currentY + 5,
      head: [tableColumn.map(c => c.header)],
      body: tableRows.map(row => tableColumn.map(c => row[c.dataKey])),
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 70 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 }
      }
    })

    // === PIED DE PAGE ===
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setDrawColor(200, 200, 200)
      doc.line(14, 287, 196, 287)

      doc.setTextColor(150, 150, 150)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(fr ? 'SafeZone Analamanga 2035 - Document confidentiel' : 'SafeZone Analamanga 2035 - Document confidentiel', 105, 292, { align: 'center' })
      doc.text(fr ? `Page ${i} / ${pageCount}` : `Page ${i} / ${pageCount}`, 196, 292, { align: 'right' })
    }

    // === SAUVEGARDE ===
    const fileName = `rapport_signalements_${dateStr.replace(/\//g, '-')}.pdf`
    doc.save(fileName)

    return true
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    alert(fr ? 'Erreur lors de la génération du PDF' : 'Olana tamin\'ny famoronana PDF')
    return false
  }
}