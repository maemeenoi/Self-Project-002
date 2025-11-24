/**
 * Credential Required Error Component
 * 
 * Displays user-friendly error messages when integration credentials are missing.
 * Provides actionable buttons to configure integrations.
 */

import React from 'react';
import Link from 'next/link';
import { parseCredentialError, isCredentialError, CredentialError } from '@/utils/credentialValidation';

interface CredentialRequiredErrorProps {
  error: Error;
  className?: string;
}

export const CredentialRequiredError: React.FC<CredentialRequiredErrorProps> = ({ 
  error, 
  className = '' 
}) => {
  // Only show this component for credential errors
  if (!isCredentialError(error)) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Service Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const credentialError: CredentialError = parseCredentialError(error);

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            {credentialError.title}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{credentialError.message}</p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <Link
                href={credentialError.actionUrl}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {credentialError.actionText}
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Simplified version for inline error display
 */
export const InlineCredentialError: React.FC<CredentialRequiredErrorProps> = ({ 
  error, 
  className = '' 
}) => {
  if (!isCredentialError(error)) {
    return (
      <div className={`text-red-600 text-sm p-2 bg-red-50 rounded ${className}`}>
        <p>⚠️ Service Error: {error.message}</p>
      </div>
    );
  }

  const credentialError = parseCredentialError(error);

  return (
    <div className={`text-yellow-700 text-sm p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">🔐 {credentialError.title}</p>
          <p className="mt-1 text-xs">{credentialError.message}</p>
        </div>
        <Link
          href={credentialError.actionUrl}
          className="ml-3 text-xs font-medium text-yellow-800 underline hover:text-yellow-900"
        >
          {credentialError.actionText}
        </Link>
      </div>
    </div>
  );
};

export default CredentialRequiredError;