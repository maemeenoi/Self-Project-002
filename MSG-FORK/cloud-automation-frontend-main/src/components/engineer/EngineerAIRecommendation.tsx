'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import API_URL from '@/config/environment';

// Chart.js imports
declare global {
  interface Window {
    Chart: any;
  }
}

// Types for AI Recommendation data
interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  type: string;
  source: string;
  category: string;
}

interface ForecastData {
  dates: string[];
  costs: number[];
  monthly_projection?: number;
  confidence_level?: number;
}

interface AIRecommendationData {
  daily_costs: {
    dates: string[];
    costs: number[];
  };
  forecast_and_recommendations: {
    forecast: ForecastData;
    recommendations: Recommendation[];
  };
  provider_used?: string;  // Which provider was actually used
}

interface TerraformPreview {
  files: { [key: string]: string };
  downloadUrl: string;
  isFallback: boolean;
  message?: string;
  recommendation: Recommendation;
}

const EngineerAIRecommendation: React.FC = () => {
  const { user } = useAuth();
  const [aiData, setAiData] = useState<AIRecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedProvider, setSelectedProvider] = useState<string>('aws');
  const [generatingTerraform, setGeneratingTerraform] = useState<{[key: string]: boolean}>({});
  const [terraformPreview, setTerraformPreview] = useState<TerraformPreview | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('main.tf');
  const [showExpertHelpModal, setShowExpertHelpModal] = useState(false);
  const [emailContent, setEmailContent] = useState<string>('');
  
  // Chart reference
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    // Load Chart.js if not already loaded
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        fetchAIRecommendations();
      };
      document.head.appendChild(script);
    } else {
      fetchAIRecommendations();
    }
  }, [selectedProvider]);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token from localStorage (like other working components)
      const authToken = localStorage.getItem('auth_token');
      
      if (!authToken) {
        throw new Error('Authentication required. Please log in to access cloud cost data.');
      }
      
      // Fetch real data from the Engineer AI endpoint
      // const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-makestuffgo-test-001-backend.azurewebsites.net';
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log('🔍 Fetching Engineer AI forecast data from:', `${baseUrl}/api/engineer/ai/forecast`);
      
      const response = await fetch(`${baseUrl}/api/engineer/ai/forecast`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          days: 30, 
          provider: selectedProvider 
        }),
      });
      
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again to access cloud cost data.');
        } else if (response.status === 503) {
          throw new Error('Cloud credentials not configured by admin. Please configure cloud credentials in the Admin Dashboard.');
        } else if (response.status === 501) {
          throw new Error('GCP support is not yet implemented. Please use AWS or Azure.');
        } else {
          throw new Error(`Failed to fetch forecast data: ${errorResult.error || errorResult.detail || 'API error'}`);
        }
      }

      const result = await response.json();
      console.log('✅ Successfully fetched Engineer AI forecast data:', result);
      
      // Debug the data structure
      console.log('🔍 Data structure check:', {
        hasDailyCosts: !!result.daily_costs,
        dailyCostsKeys: result.daily_costs ? Object.keys(result.daily_costs) : 'none',
        hasForecastRecs: !!result.forecast_and_recommendations,
        forecastKeys: result.forecast_and_recommendations ? Object.keys(result.forecast_and_recommendations) : 'none',
        hasRecommendations: result.forecast_and_recommendations?.recommendations?.length || 0,
        providerUsed: result.provider_used
      });
      
      setAiData(result);
      setLastUpdated(new Date());
      
      // Render chart after data is set
      setTimeout(() => {
        renderCostTrendChart(result);
      }, 100);
      
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const downloadTerraform = async () => {
    if (!terraformPreview) return;
    
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      // Download the file
      const response = await fetch(terraformPreview.downloadUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'terraform_optimization.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success message and close modal
      if (terraformPreview.isFallback) {
        alert(`⚠️ Basic Terraform template downloaded!\n\n${terraformPreview.message}\n\nNote: This is a starter template that you can customise for your needs.`);
      } else {
        alert('✅ AI-generated Terraform code downloaded successfully!');
      }
      
      setShowPreviewModal(false);
    } catch (err) {
      console.error('Error downloading Terraform:', err);
      alert(`❌ Failed to download: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleExpertHelp = () => {
    const recommendations = aiData?.forecast_and_recommendations?.recommendations || [];
    const dailyCostsData = aiData?.daily_costs;
    const totalCost = dailyCostsData?.costs?.reduce((sum, cost) => sum + cost, 0) || 0;
    const avgCost = dailyCostsData?.costs?.length ? totalCost / dailyCostsData.costs.length : 0;
    const provider = aiData?.provider_used || selectedProvider.toUpperCase();
    
    // Build email content
    const subject = 'Engineer Dashboard - Cost Optimization Help Request';
    
    const emailBody = 
      `Hello makeStuffGo Support Team,\n\n` +
      `I need assistance with cost optimization recommendations from the Engineer Dashboard.\n\n` +
      `--- Current Environment ---\n` +
      `Cloud Provider: ${provider}\n` +
      `Total Monthly Cost: $${totalCost.toFixed(2)}\n` +
      `Average Daily Cost: $${avgCost.toFixed(2)}\n` +
      `Number of Recommendations: ${recommendations.length}\n` +
      `Data Points: ${dailyCostsData?.costs?.length || 0} days\n\n` +
      `--- Top Recommendations ---\n` +
      recommendations.slice(0, 3).map((rec, idx) => 
        `${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.title}\n   ${rec.description}\n`
      ).join('\n') +
      `\n--- My Question/Issue ---\n` +
      `[Please describe what you need help with here]\n\n` +
      `Best regards,\n` +
      `${user?.email || 'Engineer Dashboard User'}`;

    setEmailContent(emailBody);
    setShowExpertHelpModal(true);
  };

  const copyEmailContent = async () => {
    try {
      await navigator.clipboard.writeText(emailContent);
      alert('✅ Email content copied to clipboard!\n\nNow you can paste it into your email client.');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      alert('Please manually copy the email content from the box above.');
    }
  };

  const generateTerraform = async (recommendation: Recommendation, key: string) => {
    try {
      // Set loading state for this specific recommendation
      setGeneratingTerraform(prev => ({ ...prev, [key]: true }));

      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      // const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-makestuffgo-test-001-backend.azurewebsites.net';
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      // Calculate cost summary from current data
      const totalCost = dailyCosts?.costs?.reduce((sum, cost) => sum + cost, 0) || 0;
      const avgCost = dailyCosts?.costs?.length ? totalCost / dailyCosts.costs.length : 0;
      
      const costSummary = {
        total_cost: totalCost,
        avg_cost: avgCost
      };

      console.log('🔧 Generating Terraform for recommendation:', recommendation.title);

      const response = await fetch(`${baseUrl}/api/engineer/ai/generate_terraform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          recommendation: recommendation,
          cost_summary: costSummary
        })
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to generate Terraform: ${errorResult.error || 'API error'}`);
      }

      const result = await response.json();
      
      if (result.success && result.download_url) {
        console.log('✅ Terraform generated successfully');
        
        // Show preview modal instead of auto-downloading
        setTerraformPreview({
          files: result.terraform_files || {},
          downloadUrl: `${baseUrl}${result.download_url}`,
          isFallback: result.fallback_used || false,
          message: result.message || '',
          recommendation: recommendation
        });
        setSelectedFile('main.tf');
        setShowPreviewModal(true);
      } else {
        throw new Error(result.error || 'Failed to generate Terraform');
      }
      
    } catch (err) {
      console.error('Error generating Terraform:', err);
      alert(`❌ Failed to generate Terraform: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeneratingTerraform(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderCostTrendChart = (data: AIRecommendationData) => {
    if (!chartRef.current || !window.Chart) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const forecast = data.forecast_and_recommendations.forecast;
    const historical = data.daily_costs;
    
    console.log('🔍 Rendering chart with data:', {
      historical: historical,
      forecast: forecast,
      historicalDates: historical.dates?.length,
      historicalCosts: historical.costs?.length,
      forecastDates: forecast.dates?.length,
      forecastCosts: forecast.costs?.length
    });

    // Safely handle data
    if (!historical.dates || !historical.costs || !forecast.dates || !forecast.costs) {
      console.error('❌ Missing required chart data');
      return;
    }
    
    // Combine historical and forecast data
    const allDates = [...historical.dates, ...forecast.dates];
    const historicalData = [...historical.costs, ...Array(forecast.dates.length).fill(null)];
    const forecastData = [...Array(historical.dates.length).fill(null), ...forecast.costs];

    chartInstance.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: allDates,
        datasets: [
          {
            label: 'Historical Cost',
            data: historicalData,
            borderColor: '#1e40af',
            backgroundColor: 'rgba(30, 64, 175, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#1e40af',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'AI Forecast',
            data: forecastData,
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#7c3aed',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#1e40af',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 11,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              color: '#666'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 11,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              color: '#666',
              callback: function(value: any) {
                return '$' + value.toFixed(2);
              }
            }
          }
        },
        elements: {
          point: {
            hoverBorderWidth: 3
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI Recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div>
            <h3 className="text-red-800 font-semibold mb-2">Error Loading AI Recommendations</h3>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button 
              onClick={fetchAIRecommendations}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recommendations = aiData?.forecast_and_recommendations?.recommendations || [];
  const forecast = aiData?.forecast_and_recommendations?.forecast;
  const dailyCosts = aiData?.daily_costs;
  const advisorRecommendations = recommendations.filter(rec => {
    const source = (rec.source || '').toLowerCase();
    return source.includes('advisor') || source.includes('cost explorer');
  });
  const aiRecommendations = recommendations.filter(rec => !advisorRecommendations.includes(rec));

  // Calculate stats from data - only if data exists
  const currentCost = dailyCosts?.costs?.[dailyCosts.costs.length - 1] || 0;
  const highestCost = dailyCosts?.costs?.length ? Math.max(...dailyCosts.costs) : 0;
  const lowestCost = dailyCosts?.costs?.length ? Math.min(...dailyCosts.costs) : 0;
  const avgCost = (dailyCosts?.costs?.length || 0) > 0 
    ? dailyCosts!.costs.reduce((sum, cost) => sum + cost, 0) / dailyCosts!.costs.length 
    : 0;

  const renderRecommendationCard = (rec: Recommendation, key: string) => (
    <div 
      key={key} 
      className={`recommendation-item priority-${rec.priority}`}
      style={{ margin: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          {rec.title}
        </h4>
        <span style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: rec.priority === 'high' ? '#dc2626' : (rec.priority === 'medium' ? '#d97706' : '#16a34a'),
          color: 'white'
        }}>
          {rec.priority.toUpperCase()}
        </span>
      </div>
      <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
        {rec.description}
      </p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '10px', 
        borderRadius: '4px',
        borderLeft: '3px solid #1e40af',
        marginBottom: '10px'
      }}>
        <strong style={{ fontSize: '12px', color: '#1e40af' }}>Action Required:</strong>
        <div style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>{rec.action}</div>
        <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>Source: {rec.source || 'HamIntelligence AI'}</div>
      </div>
      
      <button
        onClick={() => generateTerraform(rec, key)}
        disabled={generatingTerraform[key]}
        style={{
          width: '100%',
          background: generatingTerraform[key] 
            ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'
            : 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '6px',
          cursor: generatingTerraform[key] ? 'not-allowed' : 'pointer',
          fontWeight: '500',
          fontSize: '14px',
          transition: 'all 0.2s ease'
        }}
      >
        {generatingTerraform[key] ? 'Generating Terraform...' : 'Generate Terraform for this Recommendation'}
      </button>
    </div>
  );

  return (
    <div id="ctoDashboardSection" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      color: '#333'
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cto-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .cto-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          text-align: center;
        }
        .cto-title {
          font-size: 2.2em;
          margin-bottom: 10px;
          color: #333;
        }
        .cto-subtitle {
          color: #666;
          margin-bottom: 20px;
          font-size: 1.1em;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
        }
        .stat-value {
          font-size: 2.2em;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 0.9em;
          opacity: 0.9;
        }
        .chart-container {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .chart-title {
          font-size: 1.3em;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
          text-align: center;
        }
        .chart-canvas {
          position: relative;
          height: 300px;
        }
        .secondary-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .secondary-stat {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e9ecef;
        }
        .recommendations-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .recommendation-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .recommendation-column {
          background: #fdfdfd;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }
        .recommendation-column h4 {
          margin-bottom: 15px;
          text-align: center;
          font-size: 1.1em;
          color: #1e3a8a;
        }
        .recommendation-item {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }
        .recommendation-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .priority-high { border-left: 4px solid #dc3545; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 30px;
        }
        .action-btn {
          background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          text-align: center;
        }
        .action-btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }
        .expert-btn {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }
        .expert-btn:hover {
          background: linear-gradient(135deg, #218838 0%, #1ca085 100%);
        }
      `}</style>

      <div className="cto-container">
        {/* Header */}
        <div className="cto-header">
          <h1 className="cto-title">AI-Powered Cost Optimization</h1>
          <p className="cto-subtitle">Forecast and recommendations from AI models</p>
          
          {/* Provider selector and refresh */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            <div>
              <label htmlFor="provider-select" style={{ marginRight: '10px', fontWeight: '500' }}>Provider:</label>
              <select
                id="provider-select"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="gcp" disabled>GCP (Coming Soon)</option>
              </select>
            </div>
            <button 
              onClick={fetchAIRecommendations}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">${currentCost.toFixed(2)}</div>
            <div className="stat-label">Current Cost</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${highestCost.toFixed(2)}</div>
            <div className="stat-label">Highest Cost</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${lowestCost.toFixed(2)}</div>
            <div className="stat-label">Lowest Cost</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${avgCost.toFixed(2)}</div>
            <div className="stat-label">Average Cost</div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="chart-container">
          <h3 className="chart-title">Cost Trend & AI Forecast</h3>
          <div className="chart-canvas">
            <canvas ref={chartRef} id="ctoCostTrendChart"></canvas>
          </div>
          
          {/* Secondary Stats */}
          <div className="secondary-stats">
            <div className="secondary-stat">
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e40af' }}>
                {forecast?.confidence_level || 85}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Confidence Level</div>
            </div>
            <div className="secondary-stat">
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                {currentCost < avgCost ? 'Decreasing' : 'Stable'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Trend Analysis</div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="recommendations-section">
          <h3 style={{ fontSize: '1.5em', marginBottom: '25px', textAlign: 'center' }}>
            Recommendations
          </h3>
          
          {recommendations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>AI Recommendations Loading...</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {aiData ? 'No recommendations generated from your cost data yet.' : 'Fetching your cloud cost data for analysis...'}
              </p>
              {aiData && (
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
                  <div>Provider: {aiData.provider_used || selectedProvider.toUpperCase()}</div>
                  <div>Daily costs: {aiData.daily_costs?.costs?.length || 0} days</div>
                  <div>Total cost: ${(aiData.daily_costs?.costs?.reduce((sum, cost) => sum + cost, 0) || 0).toFixed(2)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="recommendation-columns">
              <div className="recommendation-column">
                <h4>
                  {advisorRecommendations.some(rec => (rec.source || '').toLowerCase().includes('cost explorer')) 
                    ? 'Provider Cost Explorer Recommendations'
                    : 'Provider Advisor Recommendations'}
                  <span style={{ fontSize: '0.8em', color: '#666' }}>
                    ({aiData?.provider_used || selectedProvider.toUpperCase()})
                  </span>
                </h4>
                {advisorRecommendations.length ? advisorRecommendations.map((rec, index) =>
                  renderRecommendationCard(rec, `advisor-${index}`)
                ) : (
                  <p style={{ textAlign: 'center', color: '#777', fontSize: '14px' }}>
                    No advisor insights available for this provider.
                  </p>
                )}
              </div>
              <div className="recommendation-column">
                <h4>HamIntelligence AI Recommendations</h4>
                {aiRecommendations.length ? aiRecommendations.map((rec, index) =>
                  renderRecommendationCard(rec, `ai-${index}`)
                ) : (
                  <p style={{ textAlign: 'center', color: '#777', fontSize: '14px' }}>
                    AI recommendations will appear here once enough cost data is collected.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Expert Help Button */}
          {recommendations.length > 0 && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button 
                className="action-btn expert-btn"
                onClick={handleExpertHelp}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
              >
                📧 Get Expert Help
                <div style={{ fontSize: '12px', opacity: '0.9', marginTop: '4px' }}>
                  Email us with your cost optimization questions
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Terraform Preview Modal */}
      {showPreviewModal && terraformPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={() => setShowPreviewModal(false)}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
                  {terraformPreview.isFallback ? 'Terraform Template Preview' : 'Generated Terraform Code'}
                </h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                  {terraformPreview.recommendation.title}
                </p>
                {terraformPreview.isFallback && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#856404'
                  }}>
                    {terraformPreview.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* File Tabs */}
            <div style={{
              padding: '15px 30px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              backgroundColor: '#f8f9fa'
            }}>
              {Object.keys(terraformPreview.files).sort().map(filename => (
                <button
                  key={filename}
                  onClick={() => setSelectedFile(filename)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderBottom: selectedFile === filename ? '3px solid #1e40af' : '3px solid transparent',
                    borderRadius: '6px 6px 0 0',
                    backgroundColor: selectedFile === filename ? 'white' : 'transparent',
                    color: selectedFile === filename ? '#1e40af' : '#666',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selectedFile === filename ? '600' : '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    minWidth: 'fit-content'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFile !== filename) {
                      e.currentTarget.style.backgroundColor = '#ffffff80';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFile !== filename) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📄</span>
                  <span>{filename}</span>
                </button>
              ))}
            </div>

            {/* File Content */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px 30px'
            }}>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                border: '1px solid #e9ecef',
                maxHeight: '100%',
                overflow: 'auto'
              }}>
                {terraformPreview.files[selectedFile] || '// File content not available'}
              </pre>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {Object.keys(terraformPreview.files).length} files ready to download
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e9ecef';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={downloadTerraform}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span>Download ZIP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expert Help Modal */}
      {showExpertHelpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={() => setShowExpertHelpModal(false)}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '25px 30px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
                  📧 Get Expert Help
                </h2>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Copy this message and send it to us at <strong>hamish@makestuffgo.com</strong>
                </p>
              </div>
              <button
                onClick={() => setShowExpertHelpModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Email Content */}
            <div style={{
              flex: 1,
              padding: '25px 30px',
              overflow: 'auto'
            }}>
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                borderLeft: '4px solid #1e40af'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '16px' }}>
                  📋 Instructions:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#495057' }}>
                  <li>Click "Copy Email Content" button below</li>
                  <li>Open your email client (Gmail, Outlook, etc.)</li>
                  <li>Create new email to: <strong style={{ color: '#1e40af' }}>hamish@makestuffgo.com</strong></li>
                  <li>Paste the content and add your specific question</li>
                  <li>Send! We'll get back to you!</li>
                </ol>
              </div>

              <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>
                Email Content (ready to copy):
              </h4>
              
              <textarea
                value={emailContent}
                readOnly
                style={{
                  width: '100%',
                  height: '300px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  lineHeight: '1.5',
                  backgroundColor: '#f8f9fa',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Click the text area above to select all, or use the copy button →
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowExpertHelpModal(false)}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#6c757d',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#adb5bd';
                    e.currentTarget.style.color = '#495057';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#dee2e6';
                    e.currentTarget.style.color = '#6c757d';
                  }}
                >
                  Close
                </button>
                <button
                  onClick={copyEmailContent}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 64, 175, 0.2)';
                  }}
                >
                  📋 Copy Email Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerAIRecommendation;
