import React from 'react';
import { useData } from '../contexts/DataContext';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

export default function FinanceView() {
  const { tasks, settings } = useData();
  const { t } = useTranslation(settings?.language || 'tr');

  const convertToTRY = (amount: number, currency?: string) => {
    if (!amount) return 0;
    if (!currency || currency === 'TRY') return amount;
    const rate = settings?.exchangeRates?.[currency as keyof typeof settings.exchangeRates] || 1;
    return amount * rate;
  };

  const totalExpectedRevenue = tasks.reduce((sum, t) => sum + convertToTRY(t.expectedRevenue || 0, t.currency), 0);
  const totalExpenses = tasks.reduce((sum, t) => {
    const taskExpenses = t.expenses?.reduce((eSum, e) => eSum + e.amount, 0) || 0;
    return sum + taskExpenses;
  }, 0);
  const netProfit = totalExpectedRevenue - totalExpenses;

  // Get all expenses flat list
  const allExpenses = tasks.flatMap(t => 
    (t.expenses || []).map(e => ({ ...e, taskTitle: t.title, taskId: t.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (amount: number, currency?: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₺';
    return `${symbol}${amount.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')}`;
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('finance')}</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{t('expected_revenue')}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">₺{totalExpectedRevenue.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="font-medium">{t('total_expense')}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">₺{totalExpenses.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">{t('net_profit')}</span>
          </div>
          <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            ₺{netProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Financials */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('task_finance')}</h2>
          <div className="space-y-3">
            {tasks.filter(t => t.expectedRevenue || (t.expenses && t.expenses.length > 0)).map(task => {
              const taskExpenses = task.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
              const convertedRevenue = convertToTRY(task.expectedRevenue || 0, task.currency);
              const taskProfit = convertedRevenue - taskExpenses;
              return (
                <Link key={task.id} to={`/tasks/${task.id}`} className="block p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('revenue')}: <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(task.expectedRevenue || 0, task.currency)} {task.currency && task.currency !== 'TRY' ? `(₺${convertedRevenue.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')})` : ''}</span></span>
                    <span className="text-gray-500 dark:text-gray-400">{t('expense')}: <span className="text-red-600 dark:text-red-400 font-medium">₺{taskExpenses}</span></span>
                    <span className="text-gray-500 dark:text-gray-400">{t('profit')}: <span className={taskProfit >= 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>₺{taskProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')}</span></span>
                  </div>
                </Link>
              );
            })}
            {tasks.filter(t => t.expectedRevenue || (t.expenses && t.expenses.length > 0)).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_finance_data')}</p>
            )}
          </div>
        </div>

        {/* All Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('expense_history')}</h2>
          <div className="space-y-3">
            {allExpenses.map(expense => (
              <div key={expense.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{expense.description}</div>
                  <Link to={`/tasks/${expense.taskId}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    {expense.taskTitle}
                  </Link>
                </div>
                <div className="font-bold text-red-600 dark:text-red-400">
                  -₺{expense.amount.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')}
                </div>
              </div>
            ))}
            {allExpenses.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_expense_data')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
