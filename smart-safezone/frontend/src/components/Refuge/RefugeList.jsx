// src/components/Refuge/RefugeList.jsx
import RefugeCard from './RefugeCard'

export default function RefugeList({ refuges, selectedId, onSelect, onRoute }) {
  if (!refuges || refuges.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-house-slash" style={{ fontSize: '3rem' }}></i>
        <p className="mt-2">Aucun refuge trouvé à proximité</p>
      </div>
    )
  }

  return (
    <div>
      {refuges.map((refuge) => (
        <RefugeCard
          key={refuge.id}
          refuge={refuge}
          isSelected={selectedId === refuge.id}
          onSelect={onSelect}
          onRoute={onRoute}
        />
      ))}
    </div>
  )
}