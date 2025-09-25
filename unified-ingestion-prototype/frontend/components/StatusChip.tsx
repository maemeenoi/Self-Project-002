export default function StatusChip({ label }: { label: string }) {
  // Handle undefined/null labels safely
  const safeLabel = label || 'unknown';
  const lowerLabel = safeLabel.toLowerCase();
  
  const cls = lowerLabel.includes('open') || lowerLabel.includes('progress')
    ? 'bg-green-100 text-green-800'
    : lowerLabel.includes('merged') || lowerLabel.includes('done')
      ? 'bg-purple-100 text-purple-800'
      : 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{safeLabel}</span>;
}
