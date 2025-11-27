'use client';

import { useAuth } from '@/context/AuthContext';
import { ExclamationTriangleIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function RoleAssignmentNeededPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Role Assignment Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your account needs a proper role assignment
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Role Assignment Issue
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your account ({user?.email}) has been successfully authenticated, but no valid role 
                      has been assigned. For security reasons, you cannot access any dashboard until 
                      a proper role is assigned by an administrator.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">
                What you need to do:
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 mr-3"></span>
                  Contact your system administrator or IT support
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 mr-3"></span>
                  Request a role assignment (CEO, CTO, CFO, CIO, CISO, Engineer, etc.)
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 mr-3"></span>
                  Provide your email address: <strong>{user?.email}</strong>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Your Account Information:
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Company:</strong> {user?.organizationName}</p>
                <p><strong>Account Status:</strong> 
                  <span className={user ? "text-green-600" : "text-red-600"}>
                    {user ? "Authenticated" : "Not Authenticated"}
                  </span>
                </p>
                <p><strong>Role Status:</strong> 
                  <span className="text-yellow-600">
                    {user?.primaryRole?.name === 'UNKNOWN' ? 'Unknown Role' : 
                     user?.primaryRole?.name ? `${user.primaryRole.name} (Invalid)` : 'No Role Assigned'}
                  </span>
                </p>
                {user?.roles && user.roles.length > 0 && (
                  <p><strong>Current Roles:</strong> {user.roles.map(role => role.name).join(', ')}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-3">
                Need Help? Contact Support:
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>support@makestuffgo.com</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>+44 20 7946 0958</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>
              <button
                onClick={logout}
                className="flex-1 justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          makeStuffGo Portal • Secure Role-Based Access Control
        </p>
      </div>
    </div>
  );
}