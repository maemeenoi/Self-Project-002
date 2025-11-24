// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Eye, EyeOff, Settings, RefreshCw } from 'lucide-react';
// import { IntegrationConfigForm } from './IntegrationConfigForm';
// import { 
//   integrationApi, 
//   Integration, 
//   IntegrationWithSecrets,
//   CreateIntegrationRequest,
//   UpdateIntegrationRequest,
//   IntegrationConfig,
//   IntegrationSecrets
// } from '@/services/integration-api';

// const INTEGRATION_TYPE_LABELS = {
//   aws: 'AWS',
//   azure: 'Azure',
//   github: 'GitHub',
//   jira: 'Jira'
// };

// const INTEGRATION_TYPE_COLORS = {
//   aws: 'bg-orange-500',
//   azure: 'bg-blue-500',
//   github: 'bg-gray-800',
//   jira: 'bg-blue-600'
// };

// export function IntegrationManagement() {
//   const [integrations, setIntegrations] = useState<Integration[]>([]);
//   const [integrationTypes, setIntegrationTypes] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   // Form state for create/edit modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
//   const [formData, setFormData] = useState({
//     integration_type: '',
//     integration_name: '',
//     config_json: {} as IntegrationConfig,
//     secrets_json: {} as IntegrationSecrets,
//     is_active: true
//   });

//   // Sync options
//   const [syncAfterSave, setSyncAfterSave] = useState(false);
//   const [syncing, setSyncing] = useState<Record<number, boolean>>({});

//   // Secrets viewing
//   const [viewingSecrets, setViewingSecrets] = useState<Record<number, IntegrationWithSecrets>>({});
//   const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [integrationsData, typesData] = await Promise.all([
//         integrationApi.listIntegrations(),
//         integrationApi.getIntegrationTypes()
//       ]);
//       setIntegrations(integrationsData);
//       setIntegrationTypes(typesData);
//       setError(null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load integrations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = () => {
//     setEditingIntegration(null);
//     setFormData({
//       integration_type: '',
//       integration_name: '',
//       config_json: {},
//       secrets_json: {},
//       is_active: true
//     });
//     setIsModalOpen(true);
//   };

//   const handleEdit = (integration: Integration) => {
//     setEditingIntegration(integration);
//     setFormData({
//       integration_type: integration.integration_type,
//       integration_name: integration.integration_name,
//       config_json: integration.config_json || {},
//       secrets_json: {},
//       is_active: integration.is_active
//     });
//     setIsModalOpen(true);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       let savedIntegration: Integration;
      
//       if (editingIntegration) {
//         // Update existing integration
//         const updateData: UpdateIntegrationRequest = {
//           integration_name: formData.integration_name,
//           config_json: formData.config_json,
//           is_active: formData.is_active
//         };
        
//         // Only include secrets if they were modified
//         if (Object.keys(formData.secrets_json).some(key => formData.secrets_json[key])) {
//           updateData.secrets_json = formData.secrets_json;
//         }

//         savedIntegration = await integrationApi.updateIntegration(editingIntegration.integration_id, updateData);
//         setSuccess('Integration updated successfully');
        
//         // Trigger sync for updated integration if requested
//         if (syncAfterSave && ['github', 'jira'].includes(savedIntegration.integration_type)) {
//           try {
//             await handleSyncIntegration(savedIntegration.integration_id);
//             setSuccess(prev => prev + ' - Data sync started');
//           } catch (syncErr) {
//             console.warn('Sync failed after update:', syncErr);
//             setSuccess(prev => prev + ' (sync failed to start)');
//           }
//         }
//       } else {
//         // Create new integration - use trigger_sync parameter for GitHub/Jira
//         const createData: CreateIntegrationRequest = {
//           integration_type: formData.integration_type,
//           integration_name: formData.integration_name,
//           config_json: formData.config_json,
//           secrets_json: formData.secrets_json,
//           is_active: formData.is_active
//         };

//         // For GitHub/Jira integrations, we can trigger sync directly during creation
//         if (syncAfterSave && ['github', 'jira'].includes(formData.integration_type)) {
//           // Get JWT token from localStorage
//           const authToken = localStorage.getItem('auth_token');
//           if (!authToken) {
//             throw new Error('No authentication token found');
//           }

//           // Use the backend's trigger_sync parameter
//           const response = await fetch(`https://app-makestuffgo-test-001-backend.azurewebsites.net/api/integrations/managed?trigger_sync=true`, {
//             method: 'POST',
//             headers: { 
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${authToken}`
//             },
//             body: JSON.stringify(createData)
//           });
          
//           if (!response.ok) throw new Error('Failed to create integration');
//           savedIntegration = await response.json();
//           setSuccess('Integration created successfully - Data sync started');
//         } else {
//           savedIntegration = await integrationApi.createIntegration(createData);
//           setSuccess('Integration created successfully');
//         }
//       }

//       setIsModalOpen(false);
//       setSyncAfterSave(false); // Reset sync option
//       loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to save integration');
//     }
//   };

//   const handleSyncIntegration = async (integrationId: number) => {
//     try {
//       setSyncing(prev => ({ ...prev, [integrationId]: true }));

//       // Get JWT token from localStorage
//       const authToken = localStorage.getItem('auth_token');
//       if (!authToken) {
//         throw new Error('No authentication token found');
//       }

//       const response = await fetch(`https://app-makestuffgo-test-001-backend.azurewebsites.net/api/integrations/managed/${integrationId}/sync?force_full_sync=true`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`
//         }
//       });
      
//       if (!response.ok) throw new Error('Failed to start sync');
      
//       const result = await response.json();
//       setSuccess(`Data sync started for integration: ${result.message}`);
      
//       // Auto-hide success message after 5 seconds
//       setTimeout(() => setSuccess(null), 5000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to start sync');
//     } finally {
//       setSyncing(prev => ({ ...prev, [integrationId]: false }));
//     }
//   };

//   const handleDelete = async (integration: Integration) => {
//     if (!confirm(`Are you sure you want to delete "${integration.integration_name}"?`)) {
//       return;
//     }

//     try {
//       await integrationApi.deleteIntegration(integration.integration_id);
//       setSuccess('Integration deleted successfully');
//       loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to delete integration');
//     }
//   };

//   const handleViewSecrets = async (integration: Integration) => {
//     try {
//       if (viewingSecrets[integration.integration_id]) {
//         // Already loaded, just toggle visibility
//         setShowSecrets(prev => ({
//           ...prev,
//           [integration.integration_id]: !prev[integration.integration_id]
//         }));
//       } else {
//         // Load secrets from API
//         const integrationWithSecrets = await integrationApi.getIntegrationWithSecrets(integration.integration_id);
//         setViewingSecrets(prev => ({
//           ...prev,
//           [integration.integration_id]: integrationWithSecrets
//         }));
//         setShowSecrets(prev => ({
//           ...prev,
//           [integration.integration_id]: true
//         }));
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load secrets');
//     }
//   };

//   const handleIntegrationTypeChange = (type: string) => {
//     setFormData(prev => ({
//       ...prev,
//       integration_type: type,
//       config_json: integrationApi.getConfigTemplate(type),
//       secrets_json: integrationApi.getSecretsTemplate(type)
//     }));
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <RefreshCw className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">Integration Management</h1>
//           <p className="text-gray-600 mt-2">
//             Manage secure integrations with external services and APIs
//           </p>
//         </div>
//         <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
//           <Plus className="h-4 w-4" />
//           Add Integration
//         </button>
//       </div>

//       {/* Alerts */}
//       {error && (
//         <div className="alert alert-error">
//           <span>{error}</span>
//         </div>
//       )}
      
//       {success && (
//         <div className="alert alert-success">
//           <span>{success}</span>
//         </div>
//       )}

//       {/* Integrations Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {integrations.map((integration) => (
//           <div key={integration.integration_id} className="card bg-base-100 shadow-xl relative">
//             <div className="card-body pb-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className={`w-3 h-3 rounded-full ${INTEGRATION_TYPE_COLORS[integration.integration_type as keyof typeof INTEGRATION_TYPE_COLORS] || 'bg-gray-500'}`} />
//                   <h2 className="card-title text-lg">{integration.integration_name}</h2>
//                 </div>
//                 <span className={`badge ${integration.is_active ? 'badge-primary' : 'badge-secondary'}`}>
//                   {integration.is_active ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//               <span className="badge badge-outline w-fit">
//                 {INTEGRATION_TYPE_LABELS[integration.integration_type as keyof typeof INTEGRATION_TYPE_LABELS] || integration.integration_type}
//               </span>
            
//             <div className="space-y-4 mt-4">
//               {/* Configuration Preview */}
//               {integration.config_json && Object.keys(integration.config_json).length > 0 && (
//                 <div>
//                   <h4 className="font-medium text-sm mb-2">Configuration</h4>
//                   <div className="text-xs bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
//                     {Object.entries(integration.config_json).map(([key, value]) => (
//                       <div key={key} className="flex justify-between">
//                         <span className="font-mono">{key}:</span>
//                         <span className="font-mono text-gray-600">{String(value)}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Secrets Preview */}
//               {viewingSecrets[integration.integration_id] && (
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-medium text-sm">Secrets</h4>
//                     <button
//                       className="btn btn-ghost btn-sm"
//                       onClick={() => setShowSecrets(prev => ({
//                         ...prev,
//                         [integration.integration_id]: !prev[integration.integration_id]
//                       }))}
//                     >
//                       {showSecrets[integration.integration_id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
//                     </button>
//                   </div>
//                   {viewingSecrets[integration.integration_id].secrets_json && (
//                     <div className="text-xs bg-red-50 p-2 rounded max-h-20 overflow-y-auto">
//                       {Object.entries(viewingSecrets[integration.integration_id].secrets_json!).map(([key, value]) => (
//                         <div key={key} className="flex justify-between">
//                           <span className="font-mono">{key}:</span>
//                           <span className="font-mono text-red-600">
//                             {showSecrets[integration.integration_id] ? String(value) : '••••••••'}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Metadata */}
//               <div className="text-xs text-gray-500 space-y-1">
//                 <div>Created: {new Date(integration.created_at).toLocaleDateString()}</div>
//                 {integration.updated_at && (
//                   <div>Updated: {new Date(integration.updated_at).toLocaleDateString()}</div>
//                 )}
//               </div>

//               {/* Actions */}
//               <div className="flex gap-2 pt-2 flex-wrap">
//                 <button
//                   className="btn btn-outline btn-sm flex items-center gap-1"
//                   onClick={() => handleViewSecrets(integration)}
//                 >
//                   <Eye className="h-3 w-3" />
//                   Secrets
//                 </button>
                
//                 {/* Sync Button (only for GitHub/Jira) */}
//                 {['github', 'jira'].includes(integration.integration_type) && (
//                   <button
//                     className="btn btn-outline btn-sm flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
//                     onClick={() => handleSyncIntegration(integration.integration_id)}
//                     disabled={syncing[integration.integration_id] || !integration.is_active}
//                   >
//                     <RefreshCw className={`h-3 w-3 ${syncing[integration.integration_id] ? 'animate-spin' : ''}`} />
//                     {syncing[integration.integration_id] ? 'Syncing...' : 'Sync Data'}
//                   </button>
//                 )}
                
//                 <button
//                   className="btn btn-outline btn-sm flex items-center gap-1"
//                   onClick={() => handleEdit(integration)}
//                 >
//                   <Edit className="h-3 w-3" />
//                   Edit
//                 </button>
//                 <button
//                   className="btn btn-error btn-sm flex items-center gap-1"
//                   onClick={() => handleDelete(integration)}
//                 >
//                   <Trash2 className="h-3 w-3" />
//                   Delete
//                 </button>
//               </div>
//             </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {integrations.length === 0 && (
//         <div className="card bg-base-100 shadow-xl">
//           <div className="card-body flex flex-col items-center justify-center py-12">
//             <Settings className="h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations configured</h3>
//             <p className="text-gray-500 text-center mb-4">
//               Get started by adding your first integration to connect with external services.
//             </p>
//             <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
//               <Plus className="h-4 w-4" />
//               Add Integration
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Create/Edit Modal */}
//       {isModalOpen && (
//         <div className="modal modal-open">
//           <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
//             <h3 className="font-bold text-lg mb-4">
//               {editingIntegration ? 'Edit Integration' : 'Create Integration'}
//             </h3>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Basic Information */}
//               <div className="card bg-base-100 shadow-sm">
//                 <div className="card-header">
//                   <h2 className="card-title">Basic Information</h2>
//                 </div>
//                 <div className="card-body space-y-4">
//                   <div>
//                     <label className="label">
//                       <span className="label-text">Integration Type *</span>
//                     </label>
//                     <select
//                       className="select select-bordered w-full"
//                       value={formData.integration_type}
//                       onChange={(e) => handleIntegrationTypeChange(e.target.value)}
//                       disabled={!!editingIntegration}
//                     >
//                       <option value="">Select integration type</option>
//                       {integrationTypes.map((type) => (
//                         <option key={type} value={type}>
//                           {INTEGRATION_TYPE_LABELS[type as keyof typeof INTEGRATION_TYPE_LABELS] || type}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="label">
//                       <span className="label-text">Integration Name *</span>
//                     </label>
//                     <input
//                       type="text"
//                       className="input input-bordered w-full"
//                       value={formData.integration_name}
//                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, integration_name: e.target.value }))}
//                       placeholder="e.g., AWS Production, Main GitHub"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Configuration Form */}
//               {formData.integration_type && (
//                 <IntegrationConfigForm
//                   integrationType={formData.integration_type}
//                   config={formData.config_json}
//                   secrets={formData.secrets_json}
//                   onConfigChange={(config) => setFormData(prev => ({ ...prev, config_json: config }))}
//                   onSecretsChange={(secrets) => setFormData(prev => ({ ...prev, secrets_json: secrets }))}
//                   showSecrets={!editingIntegration || Object.keys(formData.secrets_json).some(key => formData.secrets_json[key])}
//                 />
//               )}

//               {/* Sync Option (only for GitHub/Jira) */}
//               {['github', 'jira'].includes(formData.integration_type) && (
//                 <div className="card bg-base-100 shadow-sm">
//                   <div className="card-body pt-6">
//                     <div className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         id="sync-after-save"
//                         checked={syncAfterSave}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSyncAfterSave(e.target.checked)}
//                         className="checkbox checkbox-primary"
//                       />
//                       <label htmlFor="sync-after-save" className="label-text font-medium text-gray-700">
//                         Start data sync immediately after saving
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1 ml-6">
//                       This will automatically fetch data from {formData.integration_type === 'github' ? 'GitHub' : 'Jira'} and upload it to your data warehouse.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Form Actions */}
//               <div className="modal-action">
//                 <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="btn btn-primary"
//                   disabled={!formData.integration_type || !formData.integration_name}
//                 >
//                   {editingIntegration ? 'Update Integration' : 'Create Integration'}
//                   {syncAfterSave && ['github', 'jira'].includes(formData.integration_type) && ' & Sync'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


