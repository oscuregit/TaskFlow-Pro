import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  User, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  Clock, 
  Bell, 
  Lock, 
  Trash2, 
  Mail, 
  UserCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../lib/i18n';

export default function SettingsView() {
  const { user, updateUserProfile, changePassword, removeAccount } = useAuth();
  const { settings, updateSettings } = useData();
  const { t } = useTranslation(settings?.language || 'tr');
  
  const [name, setName] = useState(user?.displayName || '');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(name);
      setStatus({ type: 'success', message: t('profile_updated') });
    } catch (err) {
      setStatus({ type: 'error', message: 'Hata oluştu.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setStatus({ type: 'error', message: t('passwords_not_match') });
      return;
    }
    try {
      await changePassword(newPass);
      setNewPass('');
      setConfirmPass('');
      setStatus({ type: 'success', message: t('password_changed') });
    } catch (err) {
      setStatus({ type: 'error', message: 'Hata oluştu.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('delete_account_warning'))) {
      try {
        await removeAccount();
      } catch (err) {
        setStatus({ type: 'error', message: 'Hata oluştu.' });
      }
    }
  };

  const timezones = Intl.supportedValuesOf('timeZone');

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
      </div>

      {status && (
        <div className={cn(
          "p-4 rounded-lg flex items-center gap-3",
          status.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance & Language */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Sun className="w-5 h-5 text-orange-500" />
              {t('appearance_lang')}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{t('theme')}</span>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button 
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                      settings.theme === 'light' ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm" : "text-gray-500"
                    )}
                  >
                    <Sun className="w-4 h-4" /> {t('light')}
                  </button>
                  <button 
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                      settings.theme === 'dark' ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm" : "text-gray-500"
                    )}
                  >
                    <Moon className="w-4 h-4" /> {t('dark')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{t('language')}</span>
                <select 
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value as 'tr' | 'en' })}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Clock className="w-5 h-5 text-blue-500" />
              {t('timezone')}
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('timezone_desc')}
              </p>
              <select 
                value={settings.timezone}
                onChange={(e) => updateSettings({ timezone: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Globe className="w-5 h-5 text-emerald-500" />
              {t('exchange_rates')}
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('exchange_rates_desc')}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">USD / TRY</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.exchangeRates?.USD || ''}
                    onChange={(e) => updateSettings({ exchangeRates: { ...settings.exchangeRates, USD: parseFloat(e.target.value) || 0, EUR: settings.exchangeRates?.EUR || 0, GBP: settings.exchangeRates?.GBP || 0 } })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">EUR / TRY</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.exchangeRates?.EUR || ''}
                    onChange={(e) => updateSettings({ exchangeRates: { ...settings.exchangeRates, EUR: parseFloat(e.target.value) || 0, USD: settings.exchangeRates?.USD || 0, GBP: settings.exchangeRates?.GBP || 0 } })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">GBP / TRY</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.exchangeRates?.GBP || ''}
                    onChange={(e) => updateSettings({ exchangeRates: { ...settings.exchangeRates, GBP: parseFloat(e.target.value) || 0, USD: settings.exchangeRates?.USD || 0, EUR: settings.exchangeRates?.EUR || 0 } })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Bell className="w-5 h-5 text-purple-500" />
              {t('notifications')}
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">{t('email_notif')}</span>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.email}
                  onChange={(e) => updateSettings({ notifications: { ...settings.notifications, email: e.target.checked } })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">{t('push_notif')}</span>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.push}
                  onChange={(e) => updateSettings({ notifications: { ...settings.notifications, push: e.target.checked } })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <UserCircle className="w-5 h-5 text-emerald-500" />
              {t('profile_info')}
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name_surname')}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                {t('update_profile')}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Lock className="w-5 h-5 text-red-500" />
              {t('security')}
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password')}</label>
                <input 
                  type="password" 
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password_repeat')}</label>
                <input 
                  type="password" 
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </div>
              <button type="submit" className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors">
                {t('change_password')}
              </button>
            </form>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {t('danger_zone')}
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {t('delete_account_warning')}
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {t('delete_account')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
