import RefugeCard from './RefugeCard'

export default function RefugeList({ refuges, selectedId, onSelect, onRoute }) {
  if (!refuges?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        <i className="bi bi-house-slash" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 10 }}></i>
        <p>Aucun refuge trouve</p>
      </div>
    )
  }

  return (
    <div>
      {refuges.map(r => (
        <RefugeCard key={r.id} refuge={r} isSelected={selectedId === r.id}
          onSelect={onSelect} onRoute={onRoute} />
      ))}
    </div>
  )
}