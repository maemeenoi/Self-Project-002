import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3001/api/upload-cost-data', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload');
      setMessage(`Upload successful. ${data.recordCount} records processed.`);
      setFile(null);
      // optionally reload dashboard data after upload
      // router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Upload Cost Data</h1>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <div>
            <label className="block text-sm font-medium">Select CSV or JSON File</label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-2"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </form>
      </div>
    </Layout>
  );
}