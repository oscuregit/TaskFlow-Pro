import React from 'react';
import { useData } from '../contexts/DataContext';
import { format, isToday, isThisWeek } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { CheckCircle2, Clock, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

export default function Dashboard() {
  const { tasks, clients, generalExpenses, loading, settings, convertCurrency } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  const prefCurrency = settings?.preferredCurrency || 'TRY';

  if (loading) {
    return <div className="flex justify-center py-20">{t('loading')}</div>;
  }

  // Calculate metrics
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  const todayTasks = activeTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));

  // Financials
  const totalExpectedRevenue = tasks.reduce((sum, t) => sum + convertCurrency(t.expectedRevenue || 0, t.currency || 'TRY', prefCurrency), 0);
  
  const taskExpenses = tasks.reduce((sum, t) => {
    const tExpenses = t.expenses?.reduce((eSum, e) => eSum + e.amount, 0) || 0;
    return sum + convertCurrency(tExpenses, t.currency || 'TRY', prefCurrency);
  }, 0);

  const totalGeneralExpenses = generalExpenses.reduce((sum, e) => {
    return sum + convertCurrency(e.amount, e.currency || 'TRY', prefCurrency);
  }, 0);

  const totalExpenses = taskExpenses + totalGeneralExpenses;
  const netProfit = totalExpectedRevenue - totalExpenses;

  // Priority Scoring (Simple algorithm: Difficulty * 2 + (ExpectedRevenue / 1000) - (Days until due * 5))
  // For simplicity, we just sort by difficulty and revenue if due date is close
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const scoreA = (a.difficulty * 2) + (convertCurrency(a.expectedRevenue || 0, a.currency || 'TRY', prefCurrency) / 1000);
    const scoreB = (b.difficulty * 2) + (convertCurrency(b.expectedRevenue || 0, b.currency || 'TRY', prefCurrency) / 1000);
    return scoreB - scoreA;
  });

  const topPriorityTasks = sortedTasks.slice(0, 3);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'PLN': return 'zł';
      case 'TRY': default: return '₺';
    }
  };
  const prefSymbol = getCurrencySymbol(prefCurrency);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{t('active_tasks')}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeTasks.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">{t('completed')}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{t('expected_revenue')}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{prefSymbol}{totalExpectedRevenue.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">{t('net_profit')}</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{prefSymbol}{netProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            {t('due_today')}
          </h2>
          {todayTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_due_today')}</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <Link key={task.id} to={`/tasks/${task.id}`} className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {clients.find(c => c.id === task.clientId)?.name || t('unassigned')}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Priority Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {t('top_priority')}
          </h2>
          {topPriorityTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_active_tasks')}</p>
          ) : (
            <div className="space-y-3">
              {topPriorityTasks.map(task => (
                <Link key={task.id} to={`/tasks/${task.id}`} className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('difficulty')}: {task.difficulty}/10 | {t('expected_revenue')}: {getCurrencySymbol(task.currency || 'TRY')}{task.expectedRevenue || 0}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                      {t('urgent')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

