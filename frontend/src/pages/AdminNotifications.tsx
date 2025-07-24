import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function AdminNotifications() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'info',
    recipients: [],
  });
  const [actionMsg, setActionMsg] = useState('');
  const [readStatus, setReadStatus] = useState(null); // {read: [], unread: []}
  const [showReadStatus, setShowReadStatus] = useState(false);

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    fetchNotifications();
    fetchTenants();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setNotifications(data.notifications || data || []);
    } catch (err) {
      setError(t('fetch_error'));
    } finally {
      setLoading(false);
    }
  }

  async function fetchTenants() {
    try {
      const res = await fetch('/api/tenants', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setTenants(data.tenants || []);
    } catch {}
  }

  const handleShowForm = () => {
    setShowForm(true);
    setForm({ title: '', body: '', type: 'info', recipients: [] });
    setActionMsg('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRecipientsChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, recipients: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('save_success'));
      setShowForm(false);
      await fetchNotifications();
    } catch {
      setActionMsg(t('save_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;
    setActionMsg('');
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('delete_success'));
      await fetchNotifications();
    } catch {
      setActionMsg(t('delete_error'));
    }
  };

  const handleShowReadStatus = async (notificationId) => {
    setShowReadStatus(true);
    setReadStatus(null);
    try {
      // اتصال به endpoint جدید
      const res = await fetch(`/api/notifications/${notificationId}/read-status`, { credentials: 'include' });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setReadStatus(data);
    } catch {
      setReadStatus({ read: [], unread: [] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold">{t('admin_notifications')}</h2>
      <Button onClick={handleShowForm} className="mb-4">{t('add_notification')}</Button>
      {actionMsg && <div className="bg-green-100 text-green-800 p-2 rounded mb-2">{actionMsg}</div>}
      {loading && <div>{i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">{t('title')}</th>
              <th className="p-2 border">{t('body')}</th>
              <th className="p-2 border">{t('type')}</th>
              <th className="p-2 border">{t('recipients')}</th>
              <th className="p-2 border">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 && (
              <tr><td colSpan={5} className="text-center p-4">{t('no_notifications_found')}</td></tr>
            )}
            {notifications.map((n) => (
              <tr key={n.id}>
                <td className="border p-1">{n.title}</td>
                <td className="border p-1">{n.body}</td>
                <td className="border p-1">{t(n.type)}</td>
                <td className="border p-1">{n.recipients && n.recipients.length > 0 ? n.recipients.map(id => tenants.find(t => t.id === id)?.name).join(', ') : t('all_tenants')}</td>
                <td className="border p-1">
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(n.id)}>{t('delete')}</Button>
                  <Button size="sm" className="ml-2" onClick={() => handleShowReadStatus(n.id)}>{t('read_status')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* فرم افزودن اعلان */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={() => setShowForm(false)}>{t('close')}</button>
            <h3 className="text-lg font-bold mb-2">{t('add_notification')}</h3>
            <form onSubmit={handleFormSubmit}>
              <input name="title" placeholder={t('title')} value={form.title} onChange={handleFormChange} className="input border rounded p-1 w-full mb-2" required />
              <textarea name="body" placeholder={t('body')} value={form.body} onChange={handleFormChange} className="input border rounded p-1 w-full mb-2" required />
              <select name="type" value={form.type} onChange={handleFormChange} className="input border rounded p-1 w-full mb-2">
                <option value="info">{t('info')}</option>
                <option value="warning">{t('warning')}</option>
                <option value="violation">{t('violation')}</option>
              </select>
              <label className="block mb-1">{t('recipients')}:</label>
              <select multiple value={form.recipients} onChange={handleRecipientsChange} className="input border rounded p-1 w-full mb-2">
                <option value="">{t('all_tenants')}</option>
                {tenants.map(tn => (
                  <option key={tn.id} value={tn.id}>{tn.name}</option>
                ))}
              </select>
              <Button type="submit" className="mt-2">{t('save')}</Button>
            </form>
          </div>
        </div>
      )}
      {/* وضعیت خواندن اعلان */}
      {showReadStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={() => setShowReadStatus(false)}>{t('close')}</button>
            <h3 className="text-lg font-bold mb-2">{t('read_status')}</h3>
            {!readStatus ? <div>{t('loading')}</div> : (
              <>
                <div className="mb-2"><b>{t('read_by')}:</b> {readStatus.read.length === 0 ? t('none') : readStatus.read.map(id => tenants.find(tn => tn.id === id || tn.userId === id)?.name).join(', ')}</div>
                <div className="mb-2"><b>{t('unread_by')}:</b> {readStatus.unread.length === 0 ? t('none') : readStatus.unread.map(id => tenants.find(tn => tn.id === id || tn.userId === id)?.name).join(', ')}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 