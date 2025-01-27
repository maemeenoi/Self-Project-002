'use client';

import { useState } from 'react';
import { Switch } from '@headlessui/react';
import {
  UserIcon,
  BellIcon,
  SunIcon,
  CurrencyDollarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    monthlyReport: boolean;
    budgetAlerts: boolean;
  };
  appearance: {
    darkMode: boolean;
  };
  currency: string;
  categories: string[];
}

const initialSettings: Settings = {
  notifications: {
    email: true,
    push: true,
    monthlyReport: true,
    budgetAlerts: true,
  },
  appearance: {
    darkMode: false,
  },
  currency: 'USD',
  categories: ['Housing', 'Utilities', 'Groceries', 'Transportation', 'Entertainment', 'Others'],
};

const currencies = [
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [newCategory, setNewCategory] = useState('');

  const toggleNotification = (key: keyof Settings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const addCategory = () => {
    if (newCategory && !settings.categories.includes(newCategory)) {
      setSettings(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-500">Update your profile information</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <BellIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Manage your notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, enabled]) => (
            <Switch.Group key={key} as="div" className="flex items-center justify-between">
              <Switch.Label as="span" className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-sm text-gray-500">
                  {`Receive ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications`}
                </span>
              </Switch.Label>
              <Switch
                checked={enabled}
                onChange={() => toggleNotification(key as keyof Settings['notifications'])}
                className={classNames(
                  enabled ? 'bg-blue-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    enabled ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </Switch.Group>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <SunIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
            <p className="text-sm text-gray-500">Customize your app appearance</p>
          </div>
        </div>

        <Switch.Group as="div" className="flex items-center justify-between">
          <Switch.Label as="span" className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Dark Mode</span>
            <span className="text-sm text-gray-500">Use dark theme</span>
          </Switch.Label>
          <Switch
            checked={settings.appearance.darkMode}
            onChange={(checked) => setSettings(prev => ({
              ...prev,
              appearance: { ...prev.appearance, darkMode: checked },
            }))}
            className={classNames(
              settings.appearance.darkMode ? 'bg-blue-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                settings.appearance.darkMode ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              )}
            />
          </Switch>
        </Switch.Group>
      </div>

      {/* Currency */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Currency</h2>
            <p className="text-sm text-gray-500">Select your preferred currency</p>
          </div>
        </div>

        <select
          value={settings.currency}
          onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <TagIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Budget Categories</h2>
            <p className="text-sm text-gray-500">Customize your budget categories</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {settings.categories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-md border border-gray-300 p-2"
              >
                <span className="text-sm text-gray-900">{category}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 