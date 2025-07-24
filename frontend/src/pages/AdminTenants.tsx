import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function AdminTenants() {
  const { t, i18n } = useTranslation();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
  });
  const [editId, setEditId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tenants', { credentials: 'include' });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setTenants(data.tenants || data || []);
    } catch (err) {
      setError(t('fetch_error'));
    } finally {
      setLoading(false);
    }
  }

  const handleShowForm = (tenant = null) => {
    setShowForm(true);
    setEditId(tenant ? tenant.id : null);
    setForm(tenant ? {
      name: tenant.name,
      username: tenant.username,
      password: '',
      email: tenant.email,
      phone: tenant.phone,
    } : { name: '', username: '', password: '', email: '', phone: '' });
    setActionMsg('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const tenantSchema = z.object({
    name: z.string().min(2, { message: 'shop_name_min' }),
    username: z.string().min(3, { message: 'username_min' }),
    password: z.string().min(6, { message: 'password_min' }).optional(),
    email: z.string().email({ message: 'email_invalid' }),
    phone: z.string().min(7, { message: 'phone_min' }),
  });

  type TenantFormType = z.infer<typeof tenantSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TenantFormType>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
    },
  });

  const handleFormSubmit = async (data) => {
    setActionMsg('');
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/tenants/${editId}` : '/api/tenants';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        if (errData && errData.message && errData.message.includes('duplicate')) {
          setActionMsg(t('duplicate_username_email'));
        } else {
          setActionMsg(t('save_error'));
        }
        return;
      }
      setActionMsg(t('save_success'));
      setShowForm(false);
      await fetchTenants();
    } catch {
      setActionMsg(t('save_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;
    setActionMsg('');
    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('delete_success'));
      await fetchTenants();
    } catch {
      setActionMsg(t('delete_error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold">{t('admin_tenants')}</h2>
      <Button onClick={() => handleShowForm()} className="mb-4">{t('add_tenant')}</Button>
      {actionMsg && <div className="bg-green-100 text-green-800 p-2 rounded mb-2">{actionMsg}</div>}
      {loading && <div>{i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">{t('shop_name')}</th>
              <th className="p-2 border">{t('username')}</th>
              <th className="p-2 border">{t('email')}</th>
              <th className="p-2 border">{t('phone')}</th>
              <th className="p-2 border">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 && (
              <tr><td colSpan={5} className="text-center p-4">{t('no_tenants_found')}</td></tr>
            )}
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="border p-1">{tenant.name}</td>
                <td className="border p-1">{tenant.username}</td>
                <td className="border p-1">{tenant.email}</td>
                <td className="border p-1">{tenant.phone}</td>
                <td className="border p-1">
                  <Button size="sm" variant="outline" onClick={() => handleShowForm(tenant)}>{t('edit')}</Button>
                  <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(tenant.id)}>{t('delete')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* فرم افزودن/ویرایش */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={() => setShowForm(false)}>{t('close')}</button>
            <h3 className="text-lg font-bold mb-2">{editId ? t('edit_tenant') : t('add_tenant')}</h3>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <input name="name" placeholder={t('shop_name')} {...register('name')} className="input border rounded p-1 w-full mb-2" required />
              {errors.name && <div className="text-red-600 text-xs">{t(errors.name.message)}</div>}
              <input name="username" placeholder={t('username')} {...register('username')} className="input border rounded p-1 w-full mb-2" required />
              {errors.username && <div className="text-red-600 text-xs">{t(errors.username.message)}</div>}
              <input name="password" type="password" placeholder={t('password')} {...register('password')} className="input border rounded p-1 w-full mb-2" required={!editId} />
              {errors.password && <div className="text-red-600 text-xs">{t(errors.password.message)}</div>}
              <input name="email" type="email" placeholder={t('email')} {...register('email')} className="input border rounded p-1 w-full mb-2" required />
              {errors.email && <div className="text-red-600 text-xs">{t(errors.email.message)}</div>}
              <input name="phone" placeholder={t('phone')} {...register('phone')} className="input border rounded p-1 w-full mb-2" required />
              {errors.phone && <div className="text-red-600 text-xs">{t(errors.phone.message)}</div>}
              <Button type="submit" className="mt-2">{t('save')}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 