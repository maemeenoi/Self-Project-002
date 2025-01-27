'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SavingsGoal } from '@/types/models';
import { PlusIcon } from '@heroicons/react/24/outline';
import SavingsGoalModal from '@/components/SavingsGoalModal';

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const q = query(
        collection(db, 'savingsGoals'),
        where('userId', '==', user?.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedGoals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavingsGoal[];
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Track your progress towards your savings goals.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleAddGoal}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Goal
          </button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          return (
            <div
              key={goal.id}
              className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEditGoal(goal)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{goal.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>${goal.currentAmount.toFixed(2)}</span>
                    <span>${goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                {goal.deadline && (
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Target Date: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No savings goals</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new savings goal.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {user && (
        <SavingsGoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          goal={selectedGoal}
          userId={user.uid}
          onSave={fetchGoals}
        />
      )}
    </div>
  );
} 