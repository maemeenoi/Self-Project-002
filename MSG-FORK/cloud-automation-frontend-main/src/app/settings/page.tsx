'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-heading font-bold mb-6">Settings</h1>
        
        {/* Tabs */}
        <div className="tabs tabs-bordered mb-6">
          <a 
            className={`tab tab-lg ${activeTab === 'general' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </a>
          <a 
            className={`tab tab-lg ${activeTab === 'identity' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('identity')}
          >
            Identity Provider
          </a>
          <a 
            className={`tab tab-lg ${activeTab === 'notifications' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </a>
          <a 
            className={`tab tab-lg ${activeTab === 'webhooks' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('webhooks')}
          >
            Webhooks
          </a>
        </div>

        {/* Settings Content */}
        <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold">General Settings</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">System Name</span>
                </label>
                <input type="text" placeholder="makeStuffGo Admin Portal" className="input input-bordered" />
              </div>


              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date Format</span>
                </label>
                <select className="select select-bordered">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>

              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text font-medium">Enable Dark Mode</span>
                  <input type="checkbox" className="toggle toggle-primary" />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Session Duration (hours)</span>
                </label>
                <input type="number" placeholder="8" className="input input-bordered" />
                <label className="label">
                  <span className="label-text-alt">How long users stay logged in before re-authentication</span>
                </label>
              </div>
            </div>
          )}

          {/* Identity Provider Settings */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold">Identity Provider Configuration</h2>
              
              <div className="alert alert-info">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Authentication is managed by Azure AD B2C for enhanced security and compliance.</span>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Azure AD B2C Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title">Tenant ID</div>
                      <div className="stat-value text-sm font-mono">makestuffgo.onmicrosoft.com</div>
                      <div className="stat-desc text-success">Connected</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title">Active Users</div>
                      <div className="stat-value text-sm">6</div>
                      <div className="stat-desc">Synced 2 hours ago</div>
                    </div>
                  </div>

                  <div className="form-control mt-4">
                    <label className="cursor-pointer label">
                      <span className="label-text font-medium">Auto-sync User Data</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text font-medium">Multi-Factor Authentication Required</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked disabled />
                    </label>
                    <label className="label">
                      <span className="label-text-alt">Managed by Azure AD B2C policy</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="btn btn-primary">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12a9 9 0 11-6.219-8.56" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sync Now
                </button>
                <button className="btn btn-outline">View Azure AD B2C Portal</button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold">Notification Settings</h2>
              
              {/* Slack Integration */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523c0-1.393 1.127-2.52 2.52-2.52h2.52v2.52c0 1.396-1.127 2.523-2.52 2.523zM6.313 17.439a2.52 2.52 0 0 1 2.52-2.52 2.52 2.52 0 0 1 2.52 2.52v6.305a2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52v-6.305zM10.084 5.042a2.52 2.52 0 0 1-2.52-2.52A2.52 2.52 0 0 1 10.084 0h6.305a2.52 2.52 0 0 1 2.52 2.522 2.52 2.52 0 0 1-2.52 2.52h-6.305zM21.457 6.313a2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52V3.793a2.52 2.52 0 0 1 2.52-2.52c1.393 0 2.52 1.127 2.52 2.52v2.52z" fill="#E01E5A"/>
                          <path d="M8.563 18.958a2.52 2.52 0 0 1 2.52-2.52c1.393 0 2.52 1.127 2.52 2.52a2.52 2.52 0 0 1-2.52 2.52H8.563v-2.52zM18.958 15.165a2.52 2.52 0 0 1 2.52-2.52c1.393 0 2.52 1.127 2.52 2.52a2.52 2.52 0 0 1-2.52 2.523h-2.52v-2.523zM15.165 5.042a2.52 2.52 0 0 1 2.52 2.52v6.305a2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52V7.562a2.52 2.52 0 0 1 2.52-2.52z" fill="#36C5F0"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Slack Notifications</h3>
                        <p className="text-sm text-base-content/70">Send system alerts to Slack channels</p>
                      </div>
                    </div>
                    <div className="badge badge-success">Connected</div>
                  </div>

                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text font-medium">Default Channel</span>
                    </label>
                    <select className="select select-bordered">
                      <option>#admin-alerts</option>
                      <option>#system-health</option>
                      <option>#general</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">User Registration</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">System Errors</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Security Alerts</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Integration Changes</span>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Microsoft Teams Integration */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path d="M20.625 12.625v4.875a1.5 1.5 0 01-1.5 1.5h-4.875v-6.375h6.375z" fill="#5059C9"/>
                          <path d="M13.875 3.375v4.875h6.375V6.75a1.5 1.5 0 00-1.5-1.5h-4.875z" fill="#5059C9"/>
                          <path d="M13.875 9.75v8.625h4.875a1.5 1.5 0 001.5-1.5V9.75h-6.375z" fill="#7B83EB"/>
                          <path d="M3.375 12.625V6.75a1.5 1.5 0 011.5-1.5h7.5v7.375h-9z" fill="#5059C9"/>
                          <path d="M12.375 13.875v4.5h-7.5a1.5 1.5 0 01-1.5-1.5v-3h9z" fill="#7B83EB"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Microsoft Teams</h3>
                        <p className="text-sm text-base-content/70">Send notifications to Teams channels</p>
                      </div>
                    </div>
                    <div className="badge badge-outline">Not Connected</div>
                  </div>

                  <div className="mt-4">
                    <button className="btn btn-primary btn-sm">Connect Teams</button>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Email Notifications</h3>
                  
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text font-medium">Admin Email</span>
                    </label>
                    <input type="email" placeholder="admin@makestuffgo.com" className="input input-bordered" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Daily Reports</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Weekly Summaries</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Critical Alerts</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">User Activity</span>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Webhooks Settings */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold">Webhook Configuration</h2>
              
              <div className="alert alert-info">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Configure webhooks to receive real-time notifications from external services.</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Webhook Endpoint URL</span>
                </label>
                <input type="url" placeholder="https://api.makestuffgo.com/webhooks" className="input input-bordered" />
                <label className="label">
                  <span className="label-text-alt">Your system will receive POST requests at this URL</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Secret Key</span>
                </label>
                <div className="join">
                  <input type="password" placeholder="••••••••••••••••" className="input input-bordered join-item flex-1" />
                  <button className="btn btn-outline join-item">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12a9 9 0 11-6.219-8.56" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Generate
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt">Used to verify webhook authenticity</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Request Timeout (seconds)</span>
                </label>
                <input type="number" placeholder="30" className="input input-bordered" />
              </div>

              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text font-medium">Enable Retry on Failure</span>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Max Retry Attempts</span>
                </label>
                <input type="number" placeholder="3" className="input input-bordered" />
              </div>

              {/* Webhook Events */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Event Subscriptions</h3>
                  <p className="text-sm text-base-content/70 mb-4">Choose which events trigger webhook notifications</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">user.created</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">user.updated</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">user.deleted</span>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">integration.connected</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">integration.disconnected</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">system.alert</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Webhook Activity */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">Recent Activity</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Status</th>
                          <th>Response Time</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>user.created</td>
                          <td><div className="badge badge-success badge-sm">200</div></td>
                          <td>245ms</td>
                          <td>2 hours ago</td>
                        </tr>
                        <tr>
                          <td>integration.connected</td>
                          <td><div className="badge badge-success badge-sm">200</div></td>
                          <td>189ms</td>
                          <td>1 day ago</td>
                        </tr>
                        <tr>
                          <td>system.alert</td>
                          <td><div className="badge badge-error badge-sm">500</div></td>
                          <td>-</td>
                          <td>2 days ago</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="btn btn-primary">Test Webhook</button>
                <button className="btn btn-outline">View Logs</button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-2 pt-6 border-t border-base-300">
            <button className="btn btn-outline">Cancel</button>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
