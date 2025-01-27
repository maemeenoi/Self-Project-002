'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreditCard } from '@/types/models';
import { PlusIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import CreditCardModal from '../../../components/CreditCardModal';

export default function CreditCardsPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      const q = query(
        collection(db, 'creditCards'),
        where('userId', '==', user?.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedCards = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CreditCard[];
      setCards(fetchedCards);
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    setSelectedCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const calculateUtilization = (currentBalance: number, creditLimit: number) => {
    return creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Credit Cards</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your credit cards and track their balances.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleAddCard}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Card
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const utilization = calculateUtilization(card.currentBalance, card.creditLimit);
          return (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEditCard(card)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CreditCardIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{card.name}</h3>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    utilization > 75 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                    utilization > 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  }`}>
                    {utilization.toFixed(1)}% Used
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Current Balance</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${card.currentBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Credit Limit</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${card.creditLimit.toFixed(2)}
                    </span>
                  </div>
                  {card.billDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Bill Date</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(card.billDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        utilization > 75 ? 'bg-red-600' :
                        utilization > 50 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {cards.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No credit cards</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new credit card.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddCard}
                  className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {user && (
        <CreditCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          card={selectedCard}
          userId={user.uid}
          onSave={fetchCards}
        />
      )}
    </div>
  );
} 