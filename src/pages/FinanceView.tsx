import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Edit2, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';
import { GeneralExpense } from '../types';

export default function FinanceView() {
  const { tasks, generalExpenses, settings, convertCurrency, addGeneralExpense, updateGeneralExpense, deleteGeneralExpense } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  const prefCurrency = settings?.preferredCurrency || 'TRY';

  const [timeFilter, setTimeFilter] = useState('all_time');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GeneralExpense | null>(null);
  const [expenseForm, setExpenseForm] = useState<{
    description: string;
    amount: string;
    currency: string;
    date: string;
    category: string;
    recurrence: 'one_time' | 'monthly' | 'yearly';
  }>({
    description: '',
    amount: '',
    currency: prefCurrency,
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    recurrence: 'one_time'
  });

  const filterByDate = (dateString: string | undefined) => {
    if (timeFilter === 'all_time') return true;
    if (!dateString) return true;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    switch (timeFilter) {
      case 'last_1_week': return diffDays <= 7 && diffDays >= 0;
      case 'last_1_month': return diffDays <= 30 && diffDays >= 0;
      case 'last_3_months': return diffDays <= 90 && diffDays >= 0;
      case 'last_6_months': return diffDays <= 180 && diffDays >= 0;
      case 'last_1_year': return diffDays <= 365 && diffDays >= 0;
      default: return true;
    }
  };

  const generateInstances = (expense: GeneralExpense) => {
    if (!expense.recurrence || expense.recurrence === 'one_time') {
      return [{ ...expense, originalId: expense.id, isFuture: new Date(expense.date) > new Date() }];
    }
    
    const instances = [];
    const startDate = new Date(expense.date);
    const now = new Date();
    const endLimit = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month
    
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

  const filteredTasks = tasks.filter(t => filterByDate(t.dueDate || t.createdAt));
  
  const expandedGeneralExpenses = generalExpenses.flatMap(e => generateInstances(e));
  const filteredGeneralExpenses = expandedGeneralExpenses.filter(e => filterByDate(e.date));

  const totalExpectedRevenue = filteredTasks.reduce((sum, t) => {
    const mainRev = t.expectedRevenue || 0;
    const subRev = t.subtasks?.reduce((sSum, sub) => sSum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0;
    return sum + convertCurrency(mainRev + subRev, t.currency || 'TRY', prefCurrency);
  }, 0);
  
  // Get all expenses flat list
  const allExpenses = tasks.flatMap(t => 
    (t.expenses || []).map(e => ({ ...e, taskTitle: t.title, taskId: t.id, taskCurrency: t.currency || 'TRY' }))
  ).filter(e => filterByDate(e.date)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const taskExpenses = allExpenses.reduce((sum, e) => {
    return sum + convertCurrency(e.amount, e.taskCurrency, prefCurrency);
  }, 0);

  const totalGeneralExpenses = filteredGeneralExpenses.reduce((sum, e) => {
    return sum + convertCurrency(e.amount, e.currency || 'TRY', prefCurrency);
  }, 0);

  const totalExpenses = taskExpenses + totalGeneralExpenses;
  const netProfit = totalExpectedRevenue - totalExpenses;

  const sortedGeneralExpenses = [...filteredGeneralExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const formatCurrency = (amount: number, currency?: string) => {
    const symbol = getCurrencySymbol(currency || 'TRY');
    return `${symbol}${amount.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}`;
  };

  const handleOpenExpenseModal = (expense?: GeneralExpense & { originalId?: string }) => {
    if (expense) {
      const originalExpense = generalExpenses.find(e => e.id === (expense.originalId || expense.id));
      if (originalExpense) {
        setEditingExpense(originalExpense);
        setExpenseForm({
          description: originalExpense.description,
          amount: originalExpense.amount.toString(),
          currency: originalExpense.currency || 'TRY',
          date: originalExpense.date,
          category: originalExpense.category || 'other',
          recurrence: originalExpense.recurrence || 'one_time'
        });
      }
    } else {
      setEditingExpense(null);
      setExpenseForm({
        description: '',
        amount: '',
        currency: prefCurrency,
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        recurrence: 'one_time'
      });
    }
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;

    const expenseData = {
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      currency: expenseForm.currency,
      date: expenseForm.date,
      category: expenseForm.category,
      recurrence: expenseForm.recurrence
    };

    if (editingExpense) {
      await updateGeneralExpense(editingExpense.id, expenseData);
    } else {
      await addGeneralExpense(expenseData);
    }
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm(t('are_you_sure_delete_expense'))) {
      await deleteGeneralExpense(id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('finance')}</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all_time">{t('all_time')}</option>
              <option value="last_1_week">{t('last_1_week')}</option>
              <option value="last_1_month">{t('last_1_month')}</option>
              <option value="last_3_months">{t('last_3_months')}</option>
              <option value="last_6_months">{t('last_6_months')}</option>
              <option value="last_1_year">{t('last_1_year')}</option>
            </select>
            <Filter className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={() => handleOpenExpenseModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t('add_general_expense')}</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{t('expected_revenue')}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{prefSymbol}{totalExpectedRevenue.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="font-medium">{t('total_expense')}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{prefSymbol}{totalExpenses.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">{t('net_profit')}</span>
          </div>
          <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {prefSymbol}{netProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Financials */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('task_finance')}</h2>
          <div className="space-y-3">
            {filteredTasks.filter(t => t.expectedRevenue || (t.expenses && t.expenses.length > 0)).map(task => {
              const tExpenses = task.expenses?.filter(e => filterByDate(e.date)).reduce((sum, e) => sum + e.amount, 0) || 0;
              const subtaskExpenses = task.subtasks?.reduce((sum, sub) => sum + (sub.expenses?.filter(e => filterByDate(e.date)).reduce((eSum, e) => eSum + e.amount, 0) || 0), 0) || 0;
              const totalTaskRevenue = (task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0);
              const totalTaskExpenses = tExpenses + subtaskExpenses;
              
              const convertedRevenue = convertCurrency(totalTaskRevenue, task.currency || 'TRY', prefCurrency);
              const convertedExpense = convertCurrency(totalTaskExpenses, task.currency || 'TRY', prefCurrency);
              const taskProfit = convertedRevenue - convertedExpense;
              return (
                <Link key={task.id} to={`/tasks/${task.id}`} className="block p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('revenue')}: <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(totalTaskRevenue, task.currency)} {task.currency && task.currency !== prefCurrency ? `(${prefSymbol}${convertedRevenue.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })})` : ''}</span></span>
                    <span className="text-gray-500 dark:text-gray-400">{t('expense')}: <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(totalTaskExpenses, task.currency)} {task.currency && task.currency !== prefCurrency ? `(${prefSymbol}${convertedExpense.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })})` : ''}</span></span>
                    <span className="text-gray-500 dark:text-gray-400">{t('profit')}: <span className={taskProfit >= 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>{prefSymbol}{taskProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</span></span>
                  </div>
                </Link>
              );
            })}
            {filteredTasks.filter(t => t.expectedRevenue || (t.expenses && t.expenses.length > 0)).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_finance_data')}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* General Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('general_expenses')}</h2>
            <div className="space-y-3">
              {sortedGeneralExpenses.map((expense: any) => {
                const convertedExpense = convertCurrency(expense.amount, expense.currency || 'TRY', prefCurrency);
                return (
                <div key={expense.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center group">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {expense.description}
                      {expense.recurrence && expense.recurrence !== 'one_time' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${expense.isFuture ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {expense.isFuture ? t('payment_to_be_made') : t('payment_made')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(expense.date).toLocaleDateString(settings?.language === 'en' ? 'en-US' : 'tr-TR')} • {t(expense.category || 'other')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-red-600 dark:text-red-400">
                        -{formatCurrency(expense.amount, expense.currency)}
                      </div>
                      {expense.currency !== prefCurrency && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ({prefSymbol}{convertedExpense.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })})
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenExpenseModal(expense)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteExpense(expense.originalId || expense.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-gray-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )})}
              {sortedGeneralExpenses.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_general_expenses')}</p>
              )}
            </div>
          </div>

          {/* All Task Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('expense_history')} (İşler)</h2>
            <div className="space-y-3">
              {allExpenses.map(expense => {
                const convertedExpense = convertCurrency(expense.amount, expense.taskCurrency, prefCurrency);
                return (
                <div key={expense.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{expense.description}</div>
                    <Link to={`/tasks/${expense.taskId}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      {expense.taskTitle}
                    </Link>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600 dark:text-red-400">
                      -{formatCurrency(expense.amount, expense.taskCurrency)}
                    </div>
                    {expense.taskCurrency !== prefCurrency && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ({prefSymbol}{convertedExpense.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })})
                      </div>
                    )}
                  </div>
                </div>
              )})}
              {allExpenses.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_expense_data')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* General Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {editingExpense ? t('edit_expense') : t('add_general_expense')}
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExpense} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expense_description')}</label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expense_amount')}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Para Birimi</label>
                  <select
                    value={expenseForm.currency}
                    onChange={e => setExpenseForm({...expenseForm, currency: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="TRY">₺ TRY</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                    <option value="PLN">zł PLN</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expense_date')}</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="rent">{t('rent')}</option>
                    <option value="subscriptions">{t('subscriptions')}</option>
                    <option value="bills">{t('bills')}</option>
                    <option value="maintenance">{t('maintenance')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('recurrence')}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurrence"
                      value="one_time"
                      checked={expenseForm.recurrence === 'one_time'}
                      onChange={e => setExpenseForm({...expenseForm, recurrence: e.target.value as any})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('one_time')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurrence"
                      value="monthly"
                      checked={expenseForm.recurrence === 'monthly'}
                      onChange={e => setExpenseForm({...expenseForm, recurrence: e.target.value as any})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('monthly')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurrence"
                      value="yearly"
                      checked={expenseForm.recurrence === 'yearly'}
                      onChange={e => setExpenseForm({...expenseForm, recurrence: e.target.value as any})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('yearly')}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('save_expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
