import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Mail, Phone, Building2, Edit2, Contact, Trash2, X } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { Link } from 'react-router-dom';
import { Client } from '../types';

export default function ClientsView() {
  const { clients, tasks, addClient, updateClient, deleteClient, updateTask, settings } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
  
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', company: '', email: '', phone: '' });
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'error'|'success'} | null>(null);
  const [viewingTasksForClient, setViewingTasksForClient] = useState<Client | null>(null);

  const showToast = (message: string, type: 'error'|'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImportContacts = async () => {
    try {
      if ('contacts' in navigator) {
        const props = ['name', 'email', 'tel'];
        const opts = { multiple: false };
        const contacts = await (navigator as any).contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          setNewClient({
            ...newClient,
            name: contact.name?.[0] || '',
            email: contact.email?.[0] || '',
            phone: contact.tel?.[0] || ''
          });
        }
      } else {
        showToast(t('import_contacts_error'), 'error');
      }
    } catch (ex) {
      console.error(ex);
      showToast(t('import_contacts_error'), 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    await addClient(newClient);
    setIsAdding(false);
    setNewClient({ name: '', company: '', email: '', phone: '' });
  };

  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editForm.name) return;
    await updateClient(id, editForm);
    setEditingClient(null);
    setClientToDelete(null);
  };

  const handleDelete = async (id: string) => {
    if (clientToDelete === id) {
      await deleteClient(id);
      setClientToDelete(null);
      setEditingClient(null);
    } else {
      setClientToDelete(id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {toast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 ${toast.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('clients')}</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('new_client')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-white">{t('add_new_client')}</h2>
            <button
              type="button"
              onClick={handleImportContacts}
              className="text-sm flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Contact className="w-4 h-4" />
              {t('import_contacts')}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name_surname')}</label>
              <input 
                type="text" 
                required
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={newClient.name}
                onChange={e => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company')}</label>
              <input 
                type="text" 
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={newClient.company}
                onChange={e => setNewClient({...newClient, company: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
              <input 
                type="email" 
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={newClient.email}
                onChange={e => setNewClient({...newClient, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
              <input 
                type="tel" 
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={newClient.phone}
                onChange={e => setNewClient({...newClient, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => {
          const clientTasks = tasks.filter(t => t.clientId === client.id);
          const todoCount = clientTasks.filter(t => t.status === 'todo').length;
          const inProgressCount = clientTasks.filter(t => t.status === 'in_progress').length;
          const waitingCount = clientTasks.filter(t => t.status === 'waiting').length;
          const doneCount = clientTasks.filter(t => t.status === 'done').length;

          return (
          <div key={client.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative group flex flex-col">
            {editingClient === client.id ? (
              <form onSubmit={(e) => handleEditSubmit(e, client.id)} className="space-y-3">
                <input 
                  type="text" 
                  required
                  placeholder={t('name_surname')}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder={t('company')}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.company}
                  onChange={e => setEditForm({...editForm, company: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder={t('email')}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.email}
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                />
                <input 
                  type="tel" 
                  placeholder={t('phone')}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.phone}
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                />
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(client.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium flex items-center gap-1 transition-colors ${clientToDelete === client.id ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {clientToDelete === client.id ? t('are_you_sure') : t('delete')}
                  </button>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingClient(null);
                        setClientToDelete(null);
                      }}
                      className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                    >
                      {t('cancel')}
                    </button>
                    <button 
                      type="submit"
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      {t('save')}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                  <button
                    onClick={() => {
                      setEditingClient(client.id);
                      setEditForm({
                        name: client.name,
                        company: client.company || '',
                        email: client.email || '',
                        phone: client.phone || ''
                      });
                    }}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title={t('edit_client')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {client.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      {client.company}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <a href={`mailto:${client.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">{client.email}</a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <a href={`tel:${client.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">{client.phone}</a>
                    </div>
                  )}
                </div>
                
                {/* Task Summary Section */}
                <div className="mt-auto pt-4">
                  {clientTasks.length > 0 ? (
                    <div 
                      onClick={() => setViewingTasksForClient(client)}
                      className="border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-5 -mb-5 p-5 rounded-b-xl transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{t('client_tasks')} ({clientTasks.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {todoCount > 0 && <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{t('todo')}: {todoCount}</span>}
                        {inProgressCount > 0 && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{t('in_progress')}: {inProgressCount}</span>}
                        {waitingCount > 0 && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">{t('waiting')}: {waitingCount}</span>}
                        {doneCount > 0 && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">{t('done')}: {doneCount}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-100 dark:border-gray-700 -mx-5 -mb-5 p-5 rounded-b-xl">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('no_tasks_for_client')}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )})}
        {clients.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {t('no_clients')}
          </div>
        )}
      </div>

      {/* Client Tasks Modal */}
      {viewingTasksForClient && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {viewingTasksForClient.name} - {t('client_tasks')}
              </h2>
              <button 
                onClick={() => setViewingTasksForClient(null)} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {tasks.filter(t => t.clientId === viewingTasksForClient.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_tasks_for_client')}</p>
              ) : (
                tasks.filter(t => t.clientId === viewingTasksForClient.id).map(task => (
                  <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                      <Link to={`/tasks/${task.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {task.title}
                      </Link>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        {task.dueDate && (
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                        {((task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0)) > 0 && (
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            • {task.currency === 'USD' ? '$' : task.currency === 'EUR' ? '€' : task.currency === 'GBP' ? '£' : task.currency === 'PLN' ? 'zł' : '₺'}{((task.expectedRevenue || 0) + (task.subtasks?.reduce((sum, sub) => sum + (sub.pricingType === 'separate' ? (sub.revenue || 0) : 0), 0) || 0))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(task.id, { status: e.target.value as any })}
                        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
                      >
                        <option value="todo">{t('todo')}</option>
                        <option value="in_progress">{t('in_progress')}</option>
                        <option value="waiting">{t('waiting')}</option>
                        <option value="done">{t('done')}</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
