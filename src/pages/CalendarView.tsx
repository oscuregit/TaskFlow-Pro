import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, 
  isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, subDays 
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarView() {
  const { tasks, settings } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const { t } = useTranslation(settings?.language || 'tr');
  const locale = settings?.language === 'en' ? enUS : tr;

  const next = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500"
                : isSameDay(day, new Date())
                ? "bg-blue-50/30 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex justify-center md:justify-end">
              <span className={`text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''}`}>
                {format(day, 'd')}
              </span>
            </div>
            <div className="mt-1 md:mt-2 space-y-1 overflow-y-auto max-h-[50px] md:max-h-[80px] no-scrollbar">
              {dayTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className={`block px-1 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded truncate border ${
                    task.status === 'done' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 line-through' :
                    task.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' :
                    task.status === 'waiting' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400' :
                    'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {task.title}
                </Link>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    const weekDays = settings?.language === 'en' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map(d => (
            <div key={d} className="py-2 md:py-3 text-center text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400">
              <span className="md:hidden">{d.slice(0, 1)}</span>
              <span className="hidden md:inline">{d}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col border-l border-t border-gray-200 dark:border-gray-700">
          {rows}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:min-h-[600px]">
        <div className="hidden md:grid grid-cols-7 bg-gray-50 border-b border-gray-200 divide-x divide-gray-200">
          {weekDays.map(day => (
            <div key={day.toString()} className="py-3 text-center">
              <div className="text-xs font-medium text-gray-500 uppercase">{format(day, 'EEE', { locale: tr })}</div>
              <div className={`text-lg font-semibold mt-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {weekDays.map(day => {
            const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
            return (
              <div key={day.toString()} className={`p-3 md:p-2 min-h-[100px] md:min-h-[500px] ${isSameDay(day, new Date()) ? 'bg-blue-50/10' : 'bg-white'}`}>
                <div className="md:hidden flex items-center gap-2 mb-3 border-b pb-2">
                  <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="text-sm font-medium text-gray-500 uppercase">{format(day, 'EEEE', { locale: tr })}</div>
                </div>
                <div className="space-y-2">
                  {dayTasks.map(task => (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className={`block p-2 text-sm rounded-lg border shadow-sm transition-shadow hover:shadow-md ${
                        task.status === 'done' ? 'bg-green-50 border-green-200 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                        task.status === 'waiting' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                        'bg-white border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className={`font-medium line-clamp-2 ${task.status === 'done' ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </div>
                      <div className="text-xs mt-2 opacity-80 flex justify-between items-center">
                        <span className="bg-white/50 px-1.5 py-0.5 rounded">{t('priority')}: {task.difficulty + (task.subtasks?.reduce((sum, sub) => sum + (sub.priority || 5), 0) || 0)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), currentDate));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px] p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-4 capitalize">
          {format(currentDate, 'd MMMM yyyy, EEEE', { locale: tr })} - Görevleri
        </h3>
        {dayTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p>Bu güne ait planlanmış bir iş bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayTasks.map(task => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-shadow hover:shadow-md ${
                  task.status === 'done' ? 'bg-green-50/50 border-green-200' :
                  task.status === 'in_progress' ? 'bg-blue-50/50 border-blue-200' :
                  task.status === 'waiting' ? 'bg-orange-50/50 border-orange-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <h4 className={`text-lg font-semibold ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3 text-sm">
                    <span className={`px-2.5 py-1 rounded-full font-medium ${
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'waiting' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'done' ? 'Bitti' :
                       task.status === 'in_progress' ? 'Devam Ediyor' :
                       task.status === 'waiting' ? 'Beklemede' : 'Başlamadı'}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {t('priority')}: {task.difficulty + (task.subtasks?.reduce((sum, sub) => sum + (sub.priority || 5), 0) || 0)}
                    </span>
                    {((task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0)) > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                        {task.currency === 'USD' ? '$' : task.currency === 'EUR' ? '€' : task.currency === 'GBP' ? '£' : task.currency === 'PLN' ? 'zł' : '₺'}{((task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0))}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getHeaderText = () => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy', { locale: tr });
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      if (isSameMonth(start, end)) {
        return `${format(start, 'd')} - ${format(end, 'd MMMM yyyy', { locale: tr })}`;
      }
      return `${format(start, 'd MMM', { locale: tr })} - ${format(end, 'd MMM yyyy', { locale: tr })}`;
    }
    return format(currentDate, 'd MMMM yyyy', { locale: tr });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Takvim</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-full sm:w-auto justify-between">
            <button onClick={prev} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-md text-gray-700">
              Bugün
            </button>
            <button onClick={next} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-lg font-bold text-gray-900 min-w-[180px] text-center capitalize">
            {getHeaderText()}
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                viewMode === mode 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode === 'day' ? 'Gün' : mode === 'week' ? 'Hafta' : 'Ay'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-hidden md:overflow-x-auto">
        <div className="w-full">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>
      </div>
    </div>
  );
}
