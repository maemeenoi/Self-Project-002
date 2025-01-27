'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, getDocs, deleteDoc, doc, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Budget, Transaction } from '@/types/models';
import { ArrowTrendingDownIcon, BanknotesIcon, ChartBarIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch all transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('date', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(transactionsData);

      // Fetch all budgets
      const budgetsQuery = query(collection(db, 'budgets'));
      const budgetsSnapshot = await getDocs(budgetsQuery);
      const budgetsData = budgetsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(Math.abs(amount));
  };

  const calculateTotalExpenses = () => {
    return transactions.reduce((total, t) => total + Math.abs(t.amount), 0);
  };

  const calculateRemaining = (budget: Budget) => {
    const remaining = budget.amount - (budget.spent || 0);
    return Math.max(0, remaining); // Ensure we don't show negative remaining
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await deleteDoc(doc(db, 'transactions', id));
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Expenses</h3>
                <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(calculateTotalExpenses())}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 transform origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-110"></div>
        </div>

        <div className="relative group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Budgets</h3>
                <p className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400">
                  {budgets.length}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 transform origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-110"></div>
        </div>

        <div className="relative group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Biggest Expense</h3>
                <p className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                  {transactions.length > 0
                    ? formatCurrency(Math.max(...transactions.map(t => Math.abs(t.amount))))
                    : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 transform origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-110"></div>
        </div>

        <div className="relative group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shared Budgets</h3>
                <p className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400">
                  {budgets.filter(b => b.isShared).length}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 transform origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-110"></div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Budget Progress
          </h2>
          <div className="mt-6 flow-root">
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget.id} className="group relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {budget.category}
                      </p>
                      {budget.isShared && (
                        <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/30 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                          <UserGroupIcon className="mr-1 h-3 w-3" />
                          Shared by {budget.ownerName}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(calculateRemaining(budget))} remaining
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        style={{ width: `${Math.min(((budget.spent || 0) / budget.amount) * 100, 100)}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-in-out ${
                          ((budget.spent || 0) / budget.amount) * 100 >= 100
                            ? 'bg-red-500'
                            : ((budget.spent || 0) / budget.amount) * 100 >= 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {budgets.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No budgets set yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Expenses</h2>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <BanknotesIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <div className="flex items-center space-x-1">
                      <div className="h-4 w-4 rounded-full overflow-hidden">
                        <Image
                          src={`/icons/${transaction.icon || 'koala'}.svg`}
                          alt="User icon"
                          width={16}
                          height={16}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Added by {transaction.displayName || transaction.userName.split('@')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No expenses yet. Start by adding your expenses!
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 