'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { addDoc, collection, query, where, getDocs, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction, Budget } from '@/types/models';
import { useAuth } from '@/context/AuthContext';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface FormData {
  amount: number;
  description: string;
  category: string;
  date: string;
  isFixed: boolean;
  notes: string;
  paymentMethod: string;
  type: 'expense' | 'income';
  budgetId: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  userId: string;
  userName: string;
  onSave: () => void;
}

export default function TransactionModal({
  isOpen,
  onClose,
  transaction,
  userId,
  userName,
  onSave,
}: TransactionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    isFixed: false,
    notes: '',
    paymentMethod: 'cash',
    type: 'expense',
    budgetId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: Math.abs(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split('T')[0],
        type: transaction.amount > 0 ? 'income' : 'expense',
        isFixed: false,
        notes: '',
        paymentMethod: 'cash',
        budgetId: transaction.budgetId
      });
    } else {
      setFormData({
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        isFixed: false,
        notes: '',
        paymentMethod: 'cash',
        type: 'expense',
        budgetId: ''
      });
    }
  }, [transaction]);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBudgets = async () => {
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
    }
  };

  const updateBudgetSpending = async (category: string, amount: number) => {
    try {
      const budgetQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', userId),
        where('category', '==', category)
      );
      const snapshot = await getDocs(budgetQuery);
      
      if (!snapshot.empty) {
        const budgetDoc = snapshot.docs[0];
        const budget = budgetDoc.data() as Budget;
        await updateDoc(doc(db, 'budgets', budgetDoc.id), {
          spent: (budget.spent || 0) + Math.abs(amount)
        });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      // Validate budget selection
      if (!formData.budgetId) {
        setError('Please select a budget');
        setLoading(false);
        return;
      }

      // Get the selected budget
      const budgetRef = doc(db, 'budgets', formData.budgetId);
      const budgetSnap = await getDoc(budgetRef);
      
      if (!budgetSnap.exists()) {
        setError('Selected budget does not exist');
        setLoading(false);
        return;
      }

      const budget = budgetSnap.data() as Budget;
      const amount = Number(formData.amount);

      // Check if there's enough budget remaining
      if (formData.type === 'expense') {
        const remaining = budget.amount - (budget.spent || 0);
        if (amount > remaining) {
          setError(`Not enough budget remaining. Available: ${new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD'
          }).format(remaining)}`);
          setLoading(false);
          return;
        }
      }

      const newTransaction = {
        description: formData.description.trim(),
        amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category: budget.category, // Use the budget's category
        date: new Date(formData.date).toISOString(),
        budgetId: formData.budgetId,
        userId: user.uid,
        userName: user.email || '',
        user: {
          customDisplayName: user.customDisplayName
        },
        type: formData.type,
        icon: user.icon || 'koala'
      };

      // Create the transaction
      await addDoc(collection(db, 'transactions'), newTransaction);

      // Update the budget's spent amount
      await updateDoc(budgetRef, {
        spent: increment(formData.type === 'expense' ? amount : -amount)
      });

      onClose();
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      {transaction ? 'Edit Expense' : 'Add Expense'}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                      )}

                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Amount
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={formData.amount.toString()}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-7 pr-12 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <input
                          type="text"
                          name="description"
                          id="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          required
                        >
                          <option value="">Select a category</option>
                          {filteredCategories.map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Payment Method
                        </label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                          <option value="cash">Cash</option>
                          <option value="credit">Credit Card</option>
                          <option value="debit">Debit Card</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="budgetId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Budget
                        </label>
                        <select
                          id="budgetId"
                          name="budgetId"
                          value={formData.budgetId}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          required
                        >
                          <option value="">Select a budget</option>
                          {budgets.map((budget) => (
                            <option key={budget.id} value={budget.id}>
                              {budget.category} ({new Intl.NumberFormat('en-NZ', {
                                style: 'currency',
                                currency: 'NZD'
                              }).format(budget.amount - (budget.spent || 0))} remaining)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="isFixed"
                            name="isFixed"
                            type="checkbox"
                            checked={formData.isFixed}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="isFixed" className="font-medium text-gray-700 dark:text-gray-300">
                            Fixed Expense
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">Mark this as a recurring fixed expense</p>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 