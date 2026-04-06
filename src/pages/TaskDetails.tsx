import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Task, TaskStatus, Expense, Subtask, TimelineEvent } from '../types';
import { ArrowLeft, Save, Trash2, Plus, Clock, DollarSign, CheckSquare, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '../lib/i18n';

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, clients, addTask, updateTask, deleteTask, settings } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  
  const isNew = id === 'new';
  const existingTask = tasks.find(t => t.id === id);

  const [task, setTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    clientId: '',
    status: 'todo',
    dueDate: '',
    difficulty: 5,
    estimatedHours: 0,
    actualHours: 0,
    expectedRevenue: 0,
    expenses: [],
    subtasks: [],
    timeline: []
  });

  useEffect(() => {
    if (!isNew && existingTask) {
      setTask(existingTask);
    }
  }, [isNew, existingTask]);

  const handleSave = async () => {
    if (!task.title) return;
    
    if (isNew) {
      await addTask(task as Omit<Task, 'id' | 'userId' | 'createdAt'>);
      navigate('/board');
    } else {
      await updateTask(id!, task);
      navigate('/board');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bu işi silmek istediğinize emin misiniz?')) {
      await deleteTask(id!);
      navigate('/board');
    }
  };

  const addExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      description: 'Yeni Gider',
      amount: 0,
      date: new Date().toISOString()
    };
    setTask({ ...task, expenses: [...(task.expenses || []), newExpense] });
  };

  const updateExpense = (expId: string, field: keyof Expense, value: any) => {
    setTask({
      ...task,
      expenses: task.expenses?.map(e => e.id === expId ? { ...e, [field]: value } : e)
    });
  };

  const addSubtask = () => {
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: 'Yeni Alt Görev',
      isCompleted: false
    };
    setTask({ ...task, subtasks: [...(task.subtasks || []), newSubtask] });
  };

  const updateSubtask = (subId: string, field: keyof Subtask, value: any) => {
    setTask({
      ...task,
      subtasks: task.subtasks?.map(s => s.id === subId ? { ...s, [field]: value } : s)
    });
  };

  const addTimelineEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      type: 'note',
      content: 'Yeni Not',
      date: new Date().toISOString()
    };
    setTask({ ...task, timeline: [...(task.timeline || []), newEvent] });
  };

  if (!isNew && !existingTask) {
    return <div>{t('task_not_found')}</div>;
  }

  const totalExpenses = task.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const netProfit = (Number(task.expectedRevenue) || 0) - totalExpenses;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          {t('back')}
        </button>
        <div className="flex gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg font-medium">
              <Trash2 className="w-4 h-4" />
              {t('delete')}
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">
            <Save className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('task_title')}</label>
              <input 
                type="text" 
                value={task.title}
                onChange={e => setTask({...task, title: e.target.value})}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('task_title_placeholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
              <textarea 
                value={task.description}
                onChange={e => setTask({...task, description: e.target.value})}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('description_placeholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('client')}</label>
                <select 
                  value={task.clientId}
                  onChange={e => setTask({...task, clientId: e.target.value})}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">{t('select')}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                <select 
                  value={task.status}
                  onChange={e => setTask({...task, status: e.target.value as TaskStatus})}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="todo">{t('todo')}</option>
                  <option value="in_progress">{t('in_progress')}</option>
                  <option value="waiting">{t('waiting')}</option>
                  <option value="done">{t('done')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                {t('subtasks')}
              </h3>
              <button onClick={addSubtask} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" /> {t('add')}
              </button>
            </div>
            <div className="space-y-2">
              {task.subtasks?.map(sub => (
                <div key={sub.id} className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={sub.isCompleted}
                    onChange={e => updateSubtask(sub.id, 'isCompleted', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-900"
                  />
                  <input 
                    type="text"
                    value={sub.title}
                    onChange={e => updateSubtask(sub.id, 'title', e.target.value)}
                    className={`flex-1 min-w-0 border-none bg-transparent focus:ring-0 p-0 ${sub.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}
                  />
                  <button 
                    onClick={() => setTask({...task, subtasks: task.subtasks?.filter(s => s.id !== sub.id)})}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!task.subtasks || task.subtasks.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_subtasks')}</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                {t('timeline_notes')}
              </h3>
              <button onClick={addTimelineEvent} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" /> {t('add')}
              </button>
            </div>
            <div className="space-y-4">
              {task.timeline?.map(event => (
                <div key={event.id} className="flex gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <select 
                    value={event.type}
                    onChange={e => {
                      const newTimeline = task.timeline?.map(ev => ev.id === event.id ? { ...ev, type: e.target.value as any } : ev);
                      setTask({...task, timeline: newTimeline});
                    }}
                    className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-2 py-1 h-fit"
                  >
                    <option value="note">{t('note')}</option>
                    <option value="call">{t('call')}</option>
                    <option value="update">{t('update')}</option>
                  </select>
                  <div className="flex-1 space-y-2">
                    <textarea 
                      value={event.content}
                      onChange={e => {
                        const newTimeline = task.timeline?.map(ev => ev.id === event.id ? { ...ev, content: e.target.value } : ev);
                        setTask({...task, timeline: newTimeline});
                      }}
                      className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-2 py-1 min-h-[60px]"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(event.date), 'dd.MM.yyyy HH:mm')}
                    </div>
                  </div>
                  <button 
                    onClick={() => setTask({...task, timeline: task.timeline?.filter(e => e.id !== event.id)})}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-300 h-fit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!task.timeline || task.timeline.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_notes')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Metrics */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              {t('planning')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('due_date')}</label>
              <div className="space-y-2">
                <input 
                  type="datetime-local" 
                  value={task.dueDate ? task.dueDate.slice(0, 16) : ''}
                  onChange={e => setTask({...task, dueDate: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={task.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  onChange={e => setTask({...task, timezone: e.target.value})}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  {Intl.supportedValuesOf('timeZone').map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('difficulty')} (1-10)</label>
              <input 
                type="range" 
                min="1" max="10" 
                value={task.difficulty}
                onChange={e => setTask({...task, difficulty: parseInt(e.target.value)})}
                className="w-full accent-blue-600"
              />
              <div className="text-center font-medium text-blue-600 dark:text-blue-400">{task.difficulty}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('estimated_hours')}</label>
                <input 
                  type="number" 
                  value={(!task.estimatedHours || isNaN(task.estimatedHours)) ? '' : task.estimatedHours}
                  onChange={e => setTask({...task, estimatedHours: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('actual_hours')}</label>
                <input 
                  type="number" 
                  value={(!task.actualHours || isNaN(task.actualHours)) ? '' : task.actualHours}
                  onChange={e => setTask({...task, actualHours: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Finance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              {t('finance')}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expected_revenue')}</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={(!task.expectedRevenue || isNaN(task.expectedRevenue)) ? '' : task.expectedRevenue}
                  onChange={e => setTask({...task, expectedRevenue: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="flex-1 min-w-0 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-emerald-600 dark:text-emerald-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                />
                <select
                  value={task.currency || 'TRY'}
                  onChange={e => setTask({...task, currency: e.target.value})}
                  className="w-24 shrink-0 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="TRY">₺ TRY</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                  <option value="PLN">zł PLN</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('expenses')}</label>
                <button onClick={addExpense} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                  <Plus className="w-3 h-3" /> {t('add')}
                </button>
              </div>
              <div className="space-y-2">
                {task.expenses?.map(exp => (
                  <div key={exp.id} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={exp.description}
                      onChange={e => updateExpense(exp.id, 'description', e.target.value)}
                      className="flex-1 min-w-0 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
                      placeholder={t('description_placeholder')}
                    />
                    <input 
                      type="number" 
                      value={(!exp.amount || isNaN(exp.amount)) ? '' : exp.amount}
                      onChange={e => updateExpense(exp.id, 'amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-20 shrink-0 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 rounded px-2 py-1"
                      placeholder={t('amount')}
                    />
                    <button onClick={() => setTask({...task, expenses: task.expenses?.filter(e => e.id !== exp.id)})} className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center font-bold">
              <span className="text-gray-700 dark:text-gray-300">{t('net_profit')}:</span>
              <span className={netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                ₺{netProfit.toLocaleString(settings?.language === 'en' ? 'en-US' : 'tr-TR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
