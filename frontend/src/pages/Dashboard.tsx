import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';

const statusOptions = [
  '',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  // فعال‌سازی RTL برای عربی
  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    fetchPermits();
  }, [filterStatus, search]);

  async function fetchPermits() {
    setLoading(true);
    setError('');
    try {
      let url = '/api/work-permits?';
      if (filterStatus) url += `status=${filterStatus}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('خطا در دریافت داده‌ها');
      const data = await res.json();
      setPermits(data.workPermits || data || []);
    } catch (err) {
      setError('خطا در دریافت لیست مجوزها');
    } finally {
      setLoading(false);
    }
  }

  const handleDetails = (permit) => {
    setSelected(permit);
    setEditForm({
      status: permit.status,
      description: permit.description || '',
    });
    setEditError('');
    setEditSuccess(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);
    try {
      const res = await fetch(`/api/work-permits/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('خطا در ویرایش مجوز');
      setEditSuccess(true);
      setSelected(null);
      await fetchPermits();
    } catch (err) {
      setEditError('ویرایش با خطا مواجه شد.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded shadow">
      {/* سوییچ زبان */}
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold">{t('dashboard_title')}</h2>
      {/* فیلتر و جستجو */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <label>{t('filter_status')}:
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input border rounded p-1 mx-2">
            {statusOptions.map((s, i) => <option key={i} value={s}>{s ? t(s) : t('all') || 'All'}</option>)}
          </select>
        </label>
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input border rounded p-1 mx-2"
        />
        <Button size="sm" variant="outline" onClick={fetchPermits}>{t('actions') || 'Apply'}</Button>
      </div>
      {loading && <div>{i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">{t('permit_number')}</th>
              <th className="p-2 border">{t('company_name')}</th>
              <th className="p-2 border">{t('type')}</th>
              <th className="p-2 border">{t('status')}</th>
              <th className="p-2 border">{t('start_date')}</th>
              <th className="p-2 border">{t('end_date')}</th>
              <th className="p-2 border">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {permits.length === 0 && (
              <tr><td colSpan={7} className="text-center p-4">{i18n.language === 'ar' ? 'لا توجد تصاريح' : 'No permits found.'}</td></tr>
            )}
            {permits.map((permit) => (
              <tr key={permit.id}>
                <td className="border p-1">{permit.permitNumber}</td>
                <td className="border p-1">{permit.companyName}</td>
                <td className="border p-1">{permit.type}</td>
                <td className="border p-1">{permit.status}</td>
                <td className="border p-1">{permit.startDate ? new Date(permit.startDate).toLocaleDateString(i18n.language) : ''}</td>
                <td className="border p-1">{permit.endDate ? new Date(permit.endDate).toLocaleDateString(i18n.language) : ''}</td>
                <td className="border p-1">
                  <Button size="sm" variant="outline" onClick={() => handleDetails(permit)}>{t('details_edit')}</Button>
                  {permit.documents && permit.documents.pdf && (
                    <a
                      href={`/api/work-permits/${permit.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 underline"
                      download
                    >
                      {t('download_pdf')}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal for details/edit */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={() => setSelected(null)}>{t('close')}</button>
            <h3 className="text-lg font-bold mb-2">{t('details_edit')}</h3>
            <div className="mb-2"><b>{t('permit_number')}:</b> {selected.permitNumber}</div>
            <div className="mb-2"><b>{t('company_name')}:</b> {selected.companyName}</div>
            <div className="mb-2"><b>{t('type')}:</b> {selected.type}</div>
            <div className="mb-2"><b>{t('start_date')}:</b> {selected.startDate ? new Date(selected.startDate).toLocaleDateString(i18n.language) : ''}</div>
            <div className="mb-2"><b>{t('end_date')}:</b> {selected.endDate ? new Date(selected.endDate).toLocaleDateString(i18n.language) : ''}</div>
            {selected.attachments && Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
              <div className="mb-2">
                <b>{t('attachments')}:</b>
                <ul className="list-disc pl-5 mt-1">
                  {selected.attachments.map((file, idx) => (
                    <li key={idx}>
                      <a href={file.url || file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {t('view_download')} {idx + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-2">
              <label className="block mb-1">{t('status')}:</label>
              <select name="status" value={editForm.status} onChange={handleEditChange} className="input border rounded p-1 w-full">
                {statusOptions.filter(s => s).map((s) => <option key={s} value={s}>{t(s)}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">{t('description')}:</label>
              <textarea name="description" value={editForm.description} onChange={handleEditChange} className="input border rounded p-1 w-full" />
            </div>
            <Button onClick={handleEditSave} disabled={editLoading}>{editLoading ? (i18n.language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : t('save_changes')}</Button>
            {editSuccess && <div className="text-green-600 mt-2">{i18n.language === 'ar' ? 'تم الحفظ بنجاح.' : 'Changes saved successfully.'}</div>}
            {editError && <div className="text-red-600 mt-2">{editError}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 