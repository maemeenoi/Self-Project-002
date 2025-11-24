// // Integration configuration forms
// 'use client';

// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { 
//   IntegrationConfig, 
//   IntegrationSecrets,
//   AWSConfig,
//   AWSSecrets,
//   AzureConfig,
//   AzureSecrets,
//   GitHubConfig,
//   GitHubSecrets,
//   JiraConfig,
//   JiraSecrets
// } from '@/services/integration-api';

// interface ConfigFormProps {
//   integrationType: string;
//   config: IntegrationConfig;
//   secrets: IntegrationSecrets;
//   onConfigChange: (config: IntegrationConfig) => void;
//   onSecretsChange: (secrets: IntegrationSecrets) => void;
//   showSecrets?: boolean;
// }

// export function IntegrationConfigForm({
//   integrationType,
//   config,
//   secrets,
//   onConfigChange,
//   onSecretsChange,
//   showSecrets = true
// }: ConfigFormProps) {
//   const updateConfig = (key: string, value: string) => {
//     onConfigChange({ ...config, [key]: value });
//   };

//   const updateSecrets = (key: string, value: string) => {
//     onSecretsChange({ ...secrets, [key]: value });
//   };

//   const renderAWSForm = () => (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>AWS Configuration</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="aws-region">Region *</Label>
//             <Input
//               id="aws-region"
//               value={(config as AWSConfig)?.region || ''}
//               onChange={(e) => updateConfig('region', e.target.value)}
//               placeholder="us-east-1"
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="aws-account">Account ID (optional)</Label>
//             <Input
//               id="aws-account"
//               value={(config as AWSConfig)?.account_id || ''}
//               onChange={(e) => updateConfig('account_id', e.target.value)}
//               placeholder="123456789012"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {showSecrets && (
//         <Card>
//           <CardHeader>
//             <CardTitle>AWS Credentials</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="aws-access-key">Access Key ID *</Label>
//               <Input
//                 id="aws-access-key"
//                 type="password"
//                 value={(secrets as AWSSecrets)?.aws_access_key_id || ''}
//                 onChange={(e) => updateSecrets('aws_access_key_id', e.target.value)}
//                 placeholder="AKIA..."
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="aws-secret-key">Secret Access Key *</Label>
//               <Input
//                 id="aws-secret-key"
//                 type="password"
//                 value={(secrets as AWSSecrets)?.aws_secret_access_key || ''}
//                 onChange={(e) => updateSecrets('aws_secret_access_key', e.target.value)}
//                 placeholder="Secret key"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="aws-session-token">Session Token (optional)</Label>
//               <Input
//                 id="aws-session-token"
//                 type="password"
//                 value={(secrets as AWSSecrets)?.aws_session_token || ''}
//                 onChange={(e) => updateSecrets('aws_session_token', e.target.value)}
//                 placeholder="Temporary session token"
//               />
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </>
//   );

//   const renderAzureForm = () => (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>Azure Configuration</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="azure-subscription">Subscription ID *</Label>
//             <Input
//               id="azure-subscription"
//               value={(config as AzureConfig)?.subscription_id || ''}
//               onChange={(e) => updateConfig('subscription_id', e.target.value)}
//               placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="azure-rg">Resource Group (optional)</Label>
//             <Input
//               id="azure-rg"
//               value={(config as AzureConfig)?.resource_group || ''}
//               onChange={(e) => updateConfig('resource_group', e.target.value)}
//               placeholder="my-resource-group"
//             />
//           </div>
//           <div>
//             <Label htmlFor="azure-storage">Storage Account (optional)</Label>
//             <Input
//               id="azure-storage"
//               value={(config as AzureConfig)?.storage_account || ''}
//               onChange={(e) => updateConfig('storage_account', e.target.value)}
//               placeholder="mystorageaccount"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {showSecrets && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Azure Service Principal</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="azure-client-id">Client ID *</Label>
//               <Input
//                 id="azure-client-id"
//                 type="password"
//                 value={(secrets as AzureSecrets)?.client_id || ''}
//                 onChange={(e) => updateSecrets('client_id', e.target.value)}
//                 placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="azure-client-secret">Client Secret *</Label>
//               <Input
//                 id="azure-client-secret"
//                 type="password"
//                 value={(secrets as AzureSecrets)?.client_secret || ''}
//                 onChange={(e) => updateSecrets('client_secret', e.target.value)}
//                 placeholder="Client secret value"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="azure-tenant">Tenant ID *</Label>
//               <Input
//                 id="azure-tenant"
//                 type="password"
//                 value={(secrets as AzureSecrets)?.tenant_id || ''}
//                 onChange={(e) => updateSecrets('tenant_id', e.target.value)}
//                 placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
//                 required
//               />
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </>
//   );

//   const renderGitHubForm = () => (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>GitHub Configuration</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="github-owner">Owner/Organization *</Label>
//             <Input
//               id="github-owner"
//               value={(config as GitHubConfig)?.owner || ''}
//               onChange={(e) => updateConfig('owner', e.target.value)}
//               placeholder="octocat"
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="github-repo">Repository (optional)</Label>
//             <Input
//               id="github-repo"
//               value={(config as GitHubConfig)?.repo || ''}
//               onChange={(e) => updateConfig('repo', e.target.value)}
//               placeholder="Leave empty for all repositories"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {showSecrets && (
//         <Card>
//           <CardHeader>
//             <CardTitle>GitHub Access Token</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="github-token">Personal Access Token *</Label>
//               <Input
//                 id="github-token"
//                 type="password"
//                 value={(secrets as GitHubSecrets)?.github_token || ''}
//                 onChange={(e) => updateSecrets('github_token', e.target.value)}
//                 placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
//                 required
//               />
//               <p className="text-sm text-gray-500 mt-1">
//                 Create a token at: Settings → Developer settings → Personal access tokens
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </>
//   );

//   const renderJiraForm = () => (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>Jira Configuration</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="jira-url">Base URL *</Label>
//             <Input
//               id="jira-url"
//               value={(config as JiraConfig)?.base_url || ''}
//               onChange={(e) => updateConfig('base_url', e.target.value)}
//               placeholder="https://yourcompany.atlassian.net"
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="jira-projects">Project Keys (optional)</Label>
//             <Input
//               id="jira-projects"
//               value={(config as JiraConfig)?.project_keys || ''}
//               onChange={(e) => updateConfig('project_keys', e.target.value)}
//               placeholder="PROJ1,PROJ2 (comma-separated)"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {showSecrets && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Jira API Credentials</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="jira-email">Email *</Label>
//               <Input
//                 id="jira-email"
//                 type="email"
//                 value={(secrets as JiraSecrets)?.email || ''}
//                 onChange={(e) => updateSecrets('email', e.target.value)}
//                 placeholder="you@company.com"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="jira-token">API Token *</Label>
//               <Input
//                 id="jira-token"
//                 type="password"
//                 value={(secrets as JiraSecrets)?.api_token || ''}
//                 onChange={(e) => updateSecrets('api_token', e.target.value)}
//                 placeholder="API token from account settings"
//                 required
//               />
//               <p className="text-sm text-gray-500 mt-1">
//                 Create a token at: Account Settings → Security → API tokens
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </>
//   );

//   switch (integrationType) {
//     case 'aws':
//       return renderAWSForm();
//     case 'azure':
//       return renderAzureForm();
//     case 'github':
//       return renderGitHubForm();
//     case 'jira':
//       return renderJiraForm();
//     default:
//       return (
//         <Card>
//           <CardHeader>
//             <CardTitle>Generic Configuration</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="generic-config">Configuration (JSON)</Label>
//               <Textarea
//                 id="generic-config"
//                 value={JSON.stringify(config, null, 2)}
//                 onChange={(e) => {
//                   try {
//                     const parsed = JSON.parse(e.target.value);
//                     onConfigChange(parsed);
//                   } catch {
//                     // Invalid JSON, ignore
//                   }
//                 }}
//                 placeholder='{"key": "value"}'
//                 rows={4}
//               />
//             </div>
//             {showSecrets && (
//               <div>
//                 <Label htmlFor="generic-secrets">Secrets (JSON)</Label>
//                 <Textarea
//                   id="generic-secrets"
//                   value={JSON.stringify(secrets, null, 2)}
//                   onChange={(e) => {
//                     try {
//                       const parsed = JSON.parse(e.target.value);
//                       onSecretsChange(parsed);
//                     } catch {
//                       // Invalid JSON, ignore
//                     }
//                   }}
//                   placeholder='{"secret_key": "secret_value"}'
//                   rows={4}
//                 />
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       );
//   }
// }