import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function TenantProfile() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', username: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [notices, setNotices] = useState([]);
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    fetchProfile();
    fetchNotices();
    fetchViolations();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tenants/me', { credentials: 'include' });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setProfile(data.profile || data || {});
    } catch (err) {
      setError(t('fetch_error'));
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotices() {
    try {
      const res = await fetch('/api/notices?mine=1', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setNotices(data.notices || []);
    } catch {}
  }

  async function fetchViolations() {
    try {
      const res = await fetch('/api/violations?mine=1', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setViolations(data.violations || []);
    } catch {}
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      const res = await fetch('/api/tenants/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('save_success'));
    } catch {
      setActionMsg(t('save_error'));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      const res = await fetch('/api/tenants/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('password_success'));
      setPassword('');
    } catch {
      setActionMsg(t('password_error'));
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold">{t('tenant_profile')}</h2>
      {actionMsg && <div className="bg-green-100 text-green-800 p-2 rounded mb-2">{actionMsg}</div>}
      {loading && <div>{i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <form onSubmit={handleSave} className="mb-6">
          <input name="name" placeholder={t('shop_name')} value={profile.name} onChange={handleChange} className="input border rounded p-1 w-full mb-2" required />
          <input name="email" type="email" placeholder={t('email')} value={profile.email} onChange={handleChange} className="input border rounded p-1 w-full mb-2" required />
          <input name="phone" placeholder={t('phone')} value={profile.phone} onChange={handleChange} className="input border rounded p-1 w-full mb-2" required />
          <input name="username" placeholder={t('username')} value={profile.username} disabled className="input border rounded p-1 w-full mb-2 bg-gray-100" />
          <Button type="submit" className="mt-2">{t('save')}</Button>
        </form>
      )}
      {/* تغییر رمز عبور */}
      <form onSubmit={handleChangePassword} className="mb-6">
        <input name="password" type="password" placeholder={t('new_password')} value={password} onChange={e => setPassword(e.target.value)} className="input border rounded p-1 w-full mb-2" required />
        <Button type="submit" className="mt-2">{t('change_password')}</Button>
      </form>
      {/* اطلاعیه‌ها */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">{t('notices')}</h3>
        {notices.length === 0 ? <div>{t('no_notices')}</div> : (
          <ul className="list-disc pl-5">
            {notices.map((n, idx) => <li key={idx}>{n.title} - {n.body}</li>)}
          </ul>
        )}
      </div>
      {/* تخلفات */}
      <div>
        <h3 className="font-bold mb-2">{t('violations')}</h3>
        {violations.length === 0 ? <div>{t('no_violations')}</div> : (
          <ul className="list-disc pl-5">
            {violations.map((v, idx) => <li key={idx}>{v.title} - {v.body}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
} 