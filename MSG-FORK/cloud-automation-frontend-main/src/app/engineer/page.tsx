'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import EngineerAIRecommendation from '@/components/engineer/EngineerAIRecommendation';
import { useState, useEffect } from 'react';
import { engineerDashboardApi, JiraStats, JiraIssue, GitHubIntegrationStatus, JiraIntegrationStatus, GitHubStats, GitHubRepository, GitHubActivity } from '@/services/engineerDashboard';

export default function EngineerDashboard() {
  const [activeTab, setActiveTab] = useState("github");
  const [githubStatus, setGithubStatus] = useState<GitHubIntegrationStatus>({ configured: false });
  const [jiraStatus, setJiraStatus] = useState<JiraIntegrationStatus>({ configured: false });
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [githubActivity, setGithubActivity] = useState<GitHubActivity[]>([]);
  const [jiraStats, setJiraStats] = useState<JiraStats | null>(null);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const tabs = [
    { id: "github", name: "GitHub Analytics" },
    { id: "jira", name: "Jira Analytics" },
    { id: "ai", name: "AI Recommendations" },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Check integration statuses
        const [githubCheck, jiraCheck] = await Promise.all([
          engineerDashboardApi.checkGitHubIntegration(),
          engineerDashboardApi.checkJiraIntegration()
        ]);

        setGithubStatus(githubCheck);
        setJiraStatus(jiraCheck);

        // If GitHub is configured, fetch data
        if (githubCheck.configured) {
          const [githubStatsData, githubReposData, githubActivityData] = await Promise.all([
            engineerDashboardApi.fetchGitHubStats(),
            engineerDashboardApi.fetchGitHubRepositories(100), // High limit to get all repos
            engineerDashboardApi.fetchGitHubActivity(100)
          ]);
          
          setGithubStats(githubStatsData);
          setGithubRepos(githubReposData.repositories);
          setGithubActivity(githubActivityData.activities);
        }

        // If Jira is configured, fetch data
        if (jiraCheck.configured) {
          const [stats, issues] = await Promise.all([
            engineerDashboardApi.fetchJiraStats(),
            engineerDashboardApi.fetchJiraIssues(20, 0)
          ]);
          setJiraStats(stats);
          setJiraIssues(issues.issues);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "github":
        if (loading) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">GitHub Analytics</h2>
                <p className="text-gray-600">Repository insights and development metrics</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Checking GitHub integration...</p>
                </div>
              </div>
            </div>
          );
        }

        if (!githubStatus.configured) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">GitHub Analytics</h2>
                <p className="text-gray-600">Repository insights and development metrics</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">GitHub Integration Not Available</h3>
                  <p className="text-gray-600">{githubStatus.message}</p>
                </div>
              </div>
            </div>
          );
        }

        // Show real GitHub data
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">GitHub Analytics</h2>
              <p className="text-gray-600">Repository insights and development metrics</p>
            </div>

            <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 space-y-6">
            {/* Repository Filter */}
            <div className="bg-white border border-blue-100 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Repository
              </label>
              <select
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
              >
                <option value="">-- All Repositories --</option>
                {githubRepos.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name} {repo.private ? "(private)" : ""}
                  </option>
                ))}
              </select>
            </div>
            
            {/* GitHub Statistics */}
            {githubStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {githubRepos.length}
                  </div>
                  <div className="text-sm text-gray-600">Repositories</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {githubRepos.reduce((sum, repo) => sum + repo.open_issues, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Open Issues</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {githubRepos.reduce((sum, repo) => sum + repo.recent_commits, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Recent Activity</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{githubStats.organization || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Organisation</div>
                </div>
              </div>
            )}

            {/* Repositories */}
            <div className="bg-white border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                {selectedRepo ? `Repository: ${selectedRepo}` : `Repositories (${githubRepos.length})`}
              </h3>
              {githubRepos.length > 0 ? (
                <div className="space-y-3">
                  {(selectedRepo 
                    ? githubRepos.filter(repo => repo.full_name === selectedRepo)
                    : githubRepos
                  ).map((repo) => (
                    <div key={repo.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{repo.name}</span>
                          {repo.description && (
                            <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <span className={`w-3 h-3 rounded-full ${
                                  repo.language === 'JavaScript' ? 'bg-yellow-400' :
                                  repo.language === 'TypeScript' ? 'bg-blue-500' :
                                  repo.language === 'Python' ? 'bg-green-500' :
                                  repo.language === 'Java' ? 'bg-orange-500' :
                                  repo.language === 'Go' ? 'bg-cyan-500' :
                                  repo.language === 'Rust' ? 'bg-orange-600' :
                                  repo.language === 'C#' ? 'bg-purple-500' :
                                  'bg-gray-400'
                                }`}></span>
                                {repo.language}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              Repository
                            </span>
                            {repo.open_issues > 0 && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                {repo.open_issues} Open Issues
                              </span>
                            )}
                            {repo.recent_commits > 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {repo.recent_commits} Recent Activity
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Last updated: {(() => {
                          try {
                            if (!repo.updated_at) {
                              return 'Unknown';
                            }
                            const date = new Date(repo.updated_at);
                            if (isNaN(date.getTime())) {
                              return 'Unknown';
                            }
                            return date.toLocaleDateString('en-GB', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            return 'Unknown';
                          }
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No repositories found
                </div>
              )}
            </div>

            {/* Recent Activity */}
            {githubActivity.length > 0 && (
              <div className="bg-white border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  {selectedRepo ? `Activity in ${selectedRepo}` : "Recent Activity"}
                </h3>
                <div className="space-y-3">
                  {(selectedRepo 
                    ? githubActivity.filter(activity => activity.repository === selectedRepo)
                    : githubActivity
                  ).slice(0, 15).map((activity, index) => (
                    <div key={`${activity.id}-${index}`} className="border border-blue-100 rounded-lg p-3 hover:bg-blue-50">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-medium text-gray-900">{activity.title}</span>
                          <div className="text-sm text-gray-600">
                            {!selectedRepo && activity.repository} {!selectedRepo && "•"} by {activity.author}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          activity.type === 'commit' ? 'bg-blue-100 text-blue-800' :
                          activity.type === 'issue' ? 'bg-orange-100 text-orange-800' :
                          activity.type === 'pull_request' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString('en-GB')} at {new Date(activity.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </section>
          </div>
        );
      
      case "jira":
        if (loading) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Jira Analytics</h2>
                <p className="text-gray-600">Project management and issue tracking insights</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Checking Jira integration...</p>
                </div>
              </div>
            </div>
          );
        }

        if (!jiraStatus.configured) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Jira Analytics</h2>
                <p className="text-gray-600">Project management and issue tracking insights</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Jira Integration Not Available</h3>
                  <p className="text-gray-600">{jiraStatus.message}</p>
                </div>
              </div>
            </div>
          );
        }

        // Show real Jira data
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Jira Analytics</h2>
              <p className="text-gray-600">Project management and issue tracking insights</p>
            </div>
            
            <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 space-y-6">
            {/* Jira Statistics */}
            {jiraStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{jiraStats.total_issues || 0}</div>
                  <div className="text-sm text-gray-600">Total Issues</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{jiraStats.projects ? Object.keys(jiraStats.projects).length : 0}</div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{jiraStats.statuses ? Object.keys(jiraStats.statuses).length : 0}</div>
                  <div className="text-sm text-gray-600">Status Types</div>
                </div>
              </div>
            )}

            {/* Status Breakdown Charts */}
            {jiraStats && jiraStats.statuses && Object.keys(jiraStats.statuses).length > 0 && (
              <div className="bg-white border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Status Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {Object.entries(jiraStats.statuses).map(([status, count]) => {
                    const percentage = jiraStats.total_issues ? Math.round((count / jiraStats.total_issues) * 100) : 0;
                    return (
                      <div key={status} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{status}</span>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {count} issues
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{percentage}% of total</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Issue Status Filter */}
            {jiraStats && jiraStats.statuses && Object.keys(jiraStats.statuses).length > 0 && (
              <div className="bg-white border border-blue-100 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">-- All Statuses --</option>
                  {Object.keys(jiraStats.statuses).map((status) => (
                    <option key={status} value={status}>
                      {status} ({jiraStats.statuses![status]} issues)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Recent Issues */}
            <div className="bg-white border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                {selectedStatus ? `Issues: ${selectedStatus}` : "Recent Issues"}
              </h3>
              {(() => {
                const filteredIssues = selectedStatus 
                  ? jiraIssues.filter(issue => issue.status === selectedStatus)
                  : jiraIssues;
                
                return filteredIssues.length > 0 ? (
                  <div className="space-y-3">
                    {filteredIssues.slice(0, 10).map((issue) => (
                      <div key={issue.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-medium text-gray-900">{issue.key}: {issue.summary}</span>
                            <div className="text-sm text-gray-600 mt-1">
                              Project: {issue.project_key} • Type: {issue.issue_type}
                              {issue.priority && ` • Priority: ${issue.priority}`}
                            </div>
                            {issue.assignee && (
                              <div className="text-xs text-gray-500">Assigned to: {issue.assignee}</div>
                            )}
                            {issue.labels && issue.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {issue.labels.slice(0, 3).map((label, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {label}
                                  </span>
                                ))}
                                {issue.labels.length > 3 && (
                                  <span className="text-xs text-gray-500">+{issue.labels.length - 3} more</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {issue.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Created: {new Date(issue.created_date).toLocaleDateString()}
                          {issue.updated_date && ` • Updated: ${new Date(issue.updated_date).toLocaleDateString()}`}
                        </div>
                      </div>
                    ))}
                    {filteredIssues.length > 10 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        Showing 10 of {filteredIssues.length} issues
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {selectedStatus ? `No issues found with status "${selectedStatus}"` : "No issues found"}
                  </div>
                );
              })()}
            </div>

            {/* Project Breakdown */}
            {jiraStats && jiraStats.projects && Object.keys(jiraStats.projects).length > 0 && (
              <div className="bg-white border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Project Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(jiraStats.projects).map(([project, count]) => {
                    const percentage = jiraStats.total_issues ? Math.round((count / jiraStats.total_issues) * 100) : 0;
                    return (
                      <div key={project} className="bg-blue-50 border border-blue-100 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-blue-700">{project}</span>
                          <span className="text-sm font-medium text-gray-900">{count} issues</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600">{percentage}% of total issues</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Issue Type Analysis */}
            {jiraIssues.length > 0 && (
              <div className="bg-white border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Issue Type Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(() => {
                    const issueTypes = jiraIssues.reduce((acc, issue) => {
                      acc[issue.issue_type] = (acc[issue.issue_type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return Object.entries(issueTypes).map(([type, count]) => (
                      <div key={type} className="text-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="text-xl font-bold text-blue-700">{count}</div>
                        <div className="text-sm text-gray-600">{type}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
            </section>
          </div>
        );
      
      case "ai":
        return <EngineerAIRecommendation />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['Engineer', 'Client Admin']}>
      <SimpleLayout title="Engineer Dashboard" subtitle="Personal productivity and development tasks">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </SimpleLayout>
    </ProtectedRoute>
  );
}
