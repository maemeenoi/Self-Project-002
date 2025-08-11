export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">{children}</span>;
}
