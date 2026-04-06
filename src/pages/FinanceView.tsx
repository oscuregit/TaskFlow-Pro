import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';
import { GeneralExpense } from '../types';

export default function FinanceView() {
  const { tasks, generalExpenses, settings, convertCurrency, addGeneralExpense, updateGeneralExpense, deleteGeneralExpense } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  const prefCurrency = settings?.preferredCurrency || 'TRY';

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GeneralExpense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    currency: prefCurrency,
    date: new Date().toISOString().split('T')[0],
    category: 'other'
  });

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

  // Get all expenses flat list
  const allExpenses = tasks.flatMap(t => 
    (t.expenses || []).map(e => ({ ...e, taskTitle: t.title, taskId: t.id, taskCurrency: t.currency || 'TRY' }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sortedGeneralExpenses = [...generalExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const handleOpenExpenseModal = (expense?: GeneralExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        description: expense.description,
        amount: expense.amount.toString(),
        currency: expense.currency || 'TRY',
        date: expense.date,
        category: expense.category || 'other'
      });
    } else {
      setEditingExpense(null);
      setExpenseForm({
        description: '',
        amount: '',
        currency: prefCurrency,
        date: new Date().toISOString().split('T')[0],
        category: 'other'
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
      category: expenseForm.category
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('finance')}</h1>
        <button
          onClick={() => handleOpenExpenseModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">{t('add_general_expense')}</span>
        </button>
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
            {tasks.filter(t => t.expectedRevenue || (t.expenses && t.expenses.length > 0)).map(task => {
              const tExpenses = task.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
              const convertedRevenue = convertCurrency(task.expectedRevenue || 0, task.currency || 'TRY', prefCurrency);
              const convertedExpense = convertCurrency(tExpenses, task.currency || 'TRY', prefCurrency);
              const taskProfit = convertedRevenue - convertedExpense;
              return (
                <Link key={task.id} to={`/tasks/${task.id}`} className="block p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('revenue')}: <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(task.expectedRevenue || 0, task.currency)} {task.currency && task.currency !== prefCurrency ? `(${prefSymbol}${convertedRevenue.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })})` : ''}</span></span>
                    <span className="text-gray-500 dark:text-gray-400">{t('expense')}: <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(tExpenses, task.currency)} {task.currency && task.currency !== prefCurrency ? `(${prefSymbol}${convertedExpense.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })})` : ''}</span></span>
                    <span className="text-gray-500 dark:text-gray-400">{t('profit')}: <span className={taskProfit >= 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>{prefSymbol}{taskProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 })}</span></span>
                  </div>
                </Link>
              );
            })}
            {tasks.filter(t => t.expectedRevenue || (t.expenses && t.expenses.length > 0)).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_finance_data')}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* General Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('general_expenses')}</h2>
            <div className="space-y-3">
              {sortedGeneralExpenses.map(expense => {
                const convertedExpense = convertCurrency(expense.amount, expense.currency || 'TRY', prefCurrency);
                return (
                <div key={expense.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center group">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{expense.description}</div>
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
                      <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-gray-700">
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
