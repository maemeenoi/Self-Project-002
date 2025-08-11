export function Alert({ variant = 'info', title, children }: { variant?: 'info'|'success'|'warning'|'error'; title: string; children?: React.ReactNode }) {
  const styles: Record<string, string> = {
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    error: 'bg-red-50 text-red-900 border-red-200'
  };
  return (
    <div role="status" className={`rounded-xl border p-4 ${styles[variant]}`}>
      <div className="font-medium">{title}</div>
      {children && <div className="text-sm mt-1">{children}</div>}
    </div>
  );
}
