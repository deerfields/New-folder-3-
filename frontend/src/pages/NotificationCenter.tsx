import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function NotificationCenter() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications?mine=1', { credentials: 'include' });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setNotifications(data.notifications || data || []);
    } catch (err) {
      setError(t('fetch_error'));
    } finally {
      setLoading(false);
    }
  }

  const handleMarkRead = async (id) => {
    setActionMsg('');
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('mark_read_success'));
      await fetchNotifications();
    } catch {
      setActionMsg(t('mark_read_error'));
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

  // تعداد اعلان‌های خوانده‌نشده
  const unreadCount = notifications.filter(n => !n.read).length;

  // تابع جدید برای ثبت خواندن اعلان
  async function markAsRead(notificationId) {
    try {
      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        credentials: 'include',
      });
      setActionMsg(t('mark_read_success'));
    } catch {
      setActionMsg(t('mark_read_error'));
    }
  }

  // در useEffect یا هنگام باز شدن اعلان:
  const handleOpenNotification = async (notification) => {
    // setSelectedNotification(notification); // This state variable is not defined in the original file
    if (!notification.read) { // Changed from !notification.isRead to !notification.read
      await markAsRead(notification.id);
      // به‌روزرسانی لیست اعلان‌ها پس از خواندن
      await fetchNotifications();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold flex items-center">{t('notifications')}
        <span className="badge bg-red-500 text-white">{notifications.filter(n => !n.read).length}</span>
      </h2>
      {actionMsg && <div className="bg-green-100 text-green-800 p-2 rounded mb-2">{actionMsg}</div>}
      {loading && <div>{i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <ul className="divide-y">
          {notifications.length === 0 && <li className="p-4 text-center">{t('no_notifications_found')}</li>}
          {notifications.map((n) => (
            <li key={n.id} className={`p-3 ${n.read ? 'bg-gray-50' : 'bg-yellow-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{n.title}</div>
                  <div className="text-sm">{n.body}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString(i18n.language)}</div>
                </div>
                <div className="flex gap-2">
                  {!n.read && <Button size="sm" onClick={() => handleMarkRead(n.id)}>{t('mark_read')}</Button>}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(n.id)}>{t('delete')}</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 