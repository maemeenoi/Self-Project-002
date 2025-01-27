'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Budget } from '@/types/models';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import BudgetModal from '@/components/BudgetModal';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    if (!user) return;
    try {
      const budgetsQuery = query(collection(db, 'budgets'));
      const budgetsSnapshot = await getDocs(budgetsQuery);
      const budgetsData = budgetsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];

      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await deleteDoc(doc(db, 'budgets', id));
      setBudgets(budgets.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount);
  };

  const calculateRemaining = (budget: Budget) => {
    const remaining = budget.amount - (budget.spent || 0);
    return Math.max(0, remaining);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your spending limits by category
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="relative group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {budget.category}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Added by {budget.ownerName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedBudget(budget);
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Spent</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}
                  </span>
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
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {budget.period}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatCurrency(calculateRemaining(budget))} remaining
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 transform origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-110"></div>
          </div>
        ))}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No budgets</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first budget
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setSelectedBudget(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Budget
            </button>
          </div>
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        onSave={fetchBudgets}
        userId={user?.uid || ''}
        userName={user?.email || ''}
      />
    </div>
  );
} 