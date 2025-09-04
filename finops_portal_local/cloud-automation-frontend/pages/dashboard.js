import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState({ byService: [], byTime: [], byCategory: [] });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const chartRef = useRef(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (category) params.append('category', category);
    try {
      const res = await fetch(`http://localhost:3001/api/dashboard-data?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDownloadCSV = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3001/api/normalized-data', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'normalized-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    const element = chartRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // calculate width and height to maintain aspect ratio
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('dashboard.pdf');
  };

  // Prepare chart data
  const barData = {
    labels: data.byService.map((d) => d.service),
    datasets: [
      {
        label: 'Cost by Service',
        data: data.byService.map((d) => d.totalCost),
        backgroundColor: '#3b82f6',
      },
    ],
  };
  const lineData = {
    labels: data.byTime.map((d) => d.time_period),
    datasets: [
      {
        label: 'Cost Over Time',
        data: data.byTime.map((d) => d.totalCost),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(34,197,94,0.2)',
      },
    ],
  };
  const pieData = {
    labels: data.byCategory.map((d) => d.category || 'Uncategorized'),
    datasets: [
      {
        label: 'Cost by Category',
        data: data.byCategory.map((d) => d.totalCost),
        backgroundColor: ['#f97316', '#7c3aed', '#ec4899', '#14b8a6', '#ef4444'],
      },
    ],
  };

  return (
    <Layout>
      <div className="space-y-6" ref={chartRef}>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end bg-white p-4 rounded shadow">
          <div className="flex flex-col">
            <label className="text-sm">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-gray-300 rounded p-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-gray-300 rounded p-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Production"
              className="border-gray-300 rounded p-2"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Apply
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Export PDF
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded shadow">
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Cost by Service' } } }} />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Cost Over Time' } } }} />
          </div>
          <div className="bg-white p-4 rounded shadow md:col-span-2 lg:col-span-1">
            <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Cost by Category' } } }} />
          </div>
        </div>
      </div>
    </Layout>
  );
}