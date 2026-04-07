import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Task, TaskStatus } from '../types';
import { Link } from 'react-router-dom';
import { Plus, MoreVertical, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslation } from '../lib/i18n';

export default function BoardView() {
  const { tasks, updateTask, settings } = useData();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const { t } = useTranslation(settings?.language || 'tr');
  const locale = settings?.language === 'en' ? enUS : tr;

  const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: t('todo'), color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'in_progress', title: t('in_progress'), color: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'waiting', title: t('waiting'), color: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'done', title: t('done'), color: 'bg-green-50 dark:bg-green-900/20' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && draggedTask === taskId) {
      await updateTask(taskId, { status });
    }
    setDraggedTask(null);
  };

  return (
    <div className="h-full flex flex-col pb-20 md:pb-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('kanban')}</h1>
        <Link to="/tasks/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('new_task')}
        </Link>
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
          {COLUMNS.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
              <div 
                key={column.id}
                className={`w-full rounded-xl p-4 flex flex-col ${column.color}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">{column.title}</h3>
                  <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                    >
                      <Link to={`/tasks/${task.id}`} className="block">
                        <div className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(task.dueDate), 'd MMM yyyy', { locale })}
                          </div>
                        )}
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                            {t('priority')}: {task.difficulty + (task.subtasks?.reduce((sum, sub) => sum + (sub.priority || 5), 0) || 0)}
                          </span>
                          {((task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0)) > 0 && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {task.currency === 'USD' ? '$' : task.currency === 'EUR' ? '€' : task.currency === 'GBP' ? '£' : task.currency === 'PLN' ? 'zł' : '₺'}{((task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0))}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
