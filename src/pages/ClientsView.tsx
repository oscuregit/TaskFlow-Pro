import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Mail, Phone, Building2, Edit2, Contact } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export default function ClientsView() {
  const { clients, addClient, updateClient, settings } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
  
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', company: '', email: '', phone: '' });

  const handleImportContacts = async () => {
    try {
      if ('contacts' in navigator && 'ContactsManager' in window) {
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
        alert(t('import_contacts_error'));
      }
    } catch (ex) {
      console.error(ex);
      alert(t('import_contacts_error'));
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
  };

  return (
    <div className="space-y-6 pb-20">
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
            {'contacts' in navigator && 'ContactsManager' in window && (
              <button
                onClick={handleImportContacts}
                className="text-sm flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Contact className="w-4 h-4" />
                {t('import_contacts')}
              </button>
            )}
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
        {clients.map(client => (
          <div key={client.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative group">
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
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingClient(null)}
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
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
              </>
            )}
          </div>
        ))}
        {clients.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {t('no_clients')}
          </div>
        )}
      </div>
    </div>
  );
}
