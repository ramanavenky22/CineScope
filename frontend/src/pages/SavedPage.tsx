import { Bookmark } from 'lucide-react';

export function SavedPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>Saved Queries</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
          Your saved AI search queries will appear here.
        </p>
      </div>
      <div className="empty-state">
        <Bookmark size={40} />
        <p>No saved queries yet. Run an AI search and save results to see them here.</p>
      </div>
    </div>
  );
}
