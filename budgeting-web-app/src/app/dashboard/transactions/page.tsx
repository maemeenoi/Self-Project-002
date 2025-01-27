'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, getDocs, deleteDoc, doc, orderBy, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types/models';
import { BanknotesIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import TransactionModal from '@/components/TransactionModal';
import Image from 'next/image';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      // Fetch all transactions, ordered by date
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
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      // Get the transaction before deleting it
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;

      // Delete the transaction
      await deleteDoc(doc(db, 'transactions', id));
      
      // Update the budget's spent amount
      const budgetQuery = query(
        collection(db, 'budgets'),
        where('category', '==', transaction.category),
        where('isShared', '==', true)
      );
      
      const budgetSnapshot = await getDocs(budgetQuery);
      if (!budgetSnapshot.empty) {
        const budgetDoc = budgetSnapshot.docs[0];
        const budget = budgetDoc.data();
        const newSpent = (budget.spent || 0) - Math.abs(transaction.amount);
        
        await updateDoc(doc(db, 'budgets', budgetDoc.id), {
          spent: Math.max(0, newSpent) // Ensure spent doesn't go below 0
        });
      }

      // Update local state
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(Math.abs(amount));
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Track and manage your expenses
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setSelectedTransaction(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg">
        <div className="p-6">
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="relative group overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <BanknotesIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        {transaction.userId !== user?.uid && (
                          <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/30 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                            <UserGroupIcon className="mr-1 h-3 w-3" />
                            Shared
                          </span>
                        )}
                      </div>
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
                            Added by {transaction.user?.customDisplayName || transaction.userName.split('@')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    {transaction.userId === user?.uid && (
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 transform origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-110"></div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No expenses</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by adding your first expense
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSelectedTransaction(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                  >
                    Add Expense
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        userId={user?.uid || ''}
        userName={user?.email || 'Anonymous'}
        onSave={fetchTransactions}
      />
    </div>
  );
}