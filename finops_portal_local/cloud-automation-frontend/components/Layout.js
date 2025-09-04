import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow hidden sm:block">
        <div className="p-4 font-bold text-lg border-b">FinOps Portal</div>
        <nav className="p-4 space-y-2">
          <a
            href="/dashboard"
            className={`block p-2 rounded hover:bg-blue-50 ${router.pathname === '/dashboard' ? 'font-semibold' : ''}`}
          >
            Dashboard
          </a>
          <a
            href="/upload"
            className={`block p-2 rounded hover:bg-blue-50 ${router.pathname === '/upload' ? 'font-semibold' : ''}`}
          >
            Upload Data
          </a>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white p-4 shadow">
          <div className="text-xl font-semibold">{user ? `Welcome, ${user.name}` : ''}</div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>
        <main className="p-4 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}