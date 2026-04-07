import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { format, isToday, isThisWeek } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { CheckCircle2, Clock, TrendingUp, AlertCircle, DollarSign, Edit3, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

export default function Dashboard() {
  const { tasks, clients, generalExpenses, loading, settings, convertCurrency } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  const prefCurrency = settings?.preferredCurrency || 'TRY';

  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboardCardOrder');
    return saved ? JSON.parse(saved) : ['active_tasks', 'completed', 'expected_revenue', 'net_profit'];
  });
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboardSectionOrder');
    return saved ? JSON.parse(saved) : ['due_today', 'top_priority', 'upcoming_payments'];
  });

  useEffect(() => {
    localStorage.setItem('dashboardCardOrder', JSON.stringify(cardOrder));
  }, [cardOrder]);

  useEffect(() => {
    localStorage.setItem('dashboardSectionOrder', JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  if (loading) {
    return <div className="flex justify-center py-20">{t('loading')}</div>;
  }

  // Calculate metrics
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  const todayTasks = activeTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));

  // Financials
  const totalExpectedRevenue = tasks.reduce((sum, t) => {
    const mainRev = t.expectedRevenue || 0;
    const subRev = t.subtasks?.reduce((sSum, sub) => sSum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0;
    return sum + convertCurrency(mainRev + subRev, t.currency || 'TRY', prefCurrency);
  }, 0);
  
  const taskExpenses = tasks.reduce((sum, t) => {
    const mainExp = t.expenses?.reduce((eSum, e) => eSum + e.amount, 0) || 0;
    const subExp = t.subtasks?.reduce((sSum, sub) => sSum + (sub.expenses?.reduce((eSum, e) => eSum + e.amount, 0) || 0), 0) || 0;
    return sum + convertCurrency(mainExp + subExp, t.currency || 'TRY', prefCurrency);
  }, 0);

  const totalGeneralExpenses = generalExpenses.reduce((sum, e) => {
    return sum + convertCurrency(e.amount, e.currency || 'TRY', prefCurrency);
  }, 0);

  const totalExpenses = taskExpenses + totalGeneralExpenses;
  const netProfit = totalExpectedRevenue - totalExpenses;

  // Priority Scoring
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const totalPriorityA = a.difficulty + (a.subtasks?.reduce((sum, sub) => sum + (sub.priority || 5), 0) || 0);
    const totalPriorityB = b.difficulty + (b.subtasks?.reduce((sum, sub) => sum + (sub.priority || 5), 0) || 0);
    
    const revenueA = (a.expectedRevenue || 0) + (a.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0);
    const revenueB = (b.expectedRevenue || 0) + (b.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0);

    const scoreA = (totalPriorityA * 2) + (convertCurrency(revenueA, a.currency || 'TRY', prefCurrency) / 1000);
    const scoreB = (totalPriorityB * 2) + (convertCurrency(revenueB, b.currency || 'TRY', prefCurrency) / 1000);
    return scoreB - scoreA;
  });

  const topPriorityTasks = sortedTasks.slice(0, 3);

  // Upcoming Payments
  const generateInstances = (expense: any) => {
    if (!expense.recurrence || expense.recurrence === 'one_time') {
      return [{ ...expense, originalId: expense.id, isFuture: new Date(expense.date) > new Date() }];
    }
    
    const instances = [];
    const startDate = new Date(expense.date);
    const now = new Date();
    const endLimit = new Date(now.getFullYear(), now.getMonth() + 2, 0); // Look ahead a bit
    
    if (expense.recurrence === 'monthly') {
      let currentDate = new Date(startDate);
      while (currentDate <= endLimit) {
        instances.push({
          ...expense,
          id: `${expense.id}_${currentDate.getTime()}`,
          originalId: expense.id,
          date: currentDate.toISOString().split('T')[0],
          isFuture: currentDate > now
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else if (expense.recurrence === 'yearly') {
      let currentDate = new Date(startDate);
      while (currentDate <= endLimit) {
        instances.push({
          ...expense,
          id: `${expense.id}_${currentDate.getTime()}`,
          originalId: expense.id,
          date: currentDate.toISOString().split('T')[0],
          isFuture: currentDate > now
        });
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }
    
    return instances;
  };

  const expandedGeneralExpenses = generalExpenses.flatMap(e => generateInstances(e));
  const upcomingPayments = expandedGeneralExpenses
    .filter(e => e.isFuture)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

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

  const moveCard = (index: number, direction: 'left' | 'right') => {
    const newOrder = [...cardOrder];
    if (direction === 'left' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'right' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setCardOrder(newOrder);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setSectionOrder(newOrder);
  };

  const renderCard = (id: string, index: number) => {
    let content = null;
    switch (id) {
      case 'active_tasks':
        content = (
          <>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{t('active_tasks')}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeTasks.length}</div>
          </>
        );
        break;
      case 'completed':
        content = (
          <>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">{t('completed')}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks.length}</div>
          </>
        );
        break;
      case 'expected_revenue':
        content = (
          <>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{t('expected_revenue')}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{prefSymbol}{totalExpectedRevenue.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</div>
          </>
        );
        break;
      case 'net_profit':
        content = (
          <>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">{t('net_profit')}</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{prefSymbol}{netProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</div>
          </>
        );
        break;
    }

    return (
      <div key={id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
        {content}
        {isEditingLayout && (
          <div className="absolute top-2 right-2 flex gap-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <button onClick={() => moveCard(index, 'left')} disabled={index === 0} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 text-gray-600 dark:text-gray-400">
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button onClick={() => moveCard(index, 'right')} disabled={index === cardOrder.length - 1} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 text-gray-600 dark:text-gray-400">
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (id: string, index: number) => {
    let content = null;
    switch (id) {
      case 'due_today':
        content = (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 h-full">
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
        );
        break;
      case 'top_priority':
        content = (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 h-full">
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
                          {t('priority')}: {task.difficulty + (task.subtasks?.reduce((sum, sub) => sum + (sub.priority || 5), 0) || 0)} | {t('expected_revenue')}: {getCurrencySymbol(task.currency || 'TRY')}{((task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0))}
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
        );
        break;
      case 'upcoming_payments':
        content = (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 h-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-500" />
              {t('upcoming_payments')}
            </h2>
            {upcomingPayments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_upcoming_payments')}</p>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map(payment => (
                  <div key={payment.id} className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{payment.description}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(payment.date).toLocaleDateString(settings?.language === 'en' ? 'en-US' : 'tr-TR')} • {t(payment.category || 'other')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600 dark:text-red-400">
                          -{getCurrencySymbol(payment.currency || 'TRY')}{payment.amount.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        break;
    }

    return (
      <div key={id} className="relative group">
        {content}
        {isEditingLayout && (
          <div className="absolute top-2 right-2 flex gap-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-1 z-10">
            <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 text-gray-600 dark:text-gray-400">
              <ArrowUp className="w-4 h-4" />
            </button>
            <button onClick={() => moveSection(index, 'down')} disabled={index === sectionOrder.length - 1} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 text-gray-600 dark:text-gray-400">
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
          <button 
            onClick={() => setIsEditingLayout(!isEditingLayout)}
            className={`p-1.5 rounded-md transition-colors ${isEditingLayout ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300'}`}
            title={isEditingLayout ? t('finish_editing') : t('edit_layout')}
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
        {isEditingLayout && (
          <button 
            onClick={() => setIsEditingLayout(false)}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            {t('finish_editing')}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cardOrder.map((id, index) => renderCard(id, index))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sectionOrder.map((id, index) => renderSection(id, index))}
      </div>
    </div>
  );
}

