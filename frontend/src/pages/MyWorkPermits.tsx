import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function MyWorkPermits() {
  const { t, i18n } = useTranslation();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    fetchPermits();
  }, []);

  async function fetchPermits() {
    setLoading(true);
    setError('');
    try {
      // فرض بر این است که API فقط مجوزهای کاربر لاگین‌شده را برمی‌گرداند
      const res = await fetch('/api/work-permits?mine=1', { credentials: 'include' });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setPermits(data.workPermits || data || []);
    } catch (err) {
      setError(t('fetch_error'));
    } finally {
      setLoading(false);
    }
  }

  const handleDetails = (permit) => {
    setSelected(permit);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold">{t('my_work_permits')}</h2>
      {notification && <div className="bg-green-100 text-green-800 p-2 rounded mb-2">{notification}</div>}
      {loading && <div>{i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">{t('permit_number')}</th>
              <th className="p-2 border">{t('type')}</th>
              <th className="p-2 border">{t('status')}</th>
              <th className="p-2 border">{t('start_date')}</th>
              <th className="p-2 border">{t('end_date')}</th>
              <th className="p-2 border">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {permits.length === 0 && (
              <tr><td colSpan={6} className="text-center p-4">{t('no_permits_found')}</td></tr>
            )}
            {permits.map((permit) => (
              <tr key={permit.id}>
                <td className="border p-1">{permit.permitNumber}</td>
                <td className="border p-1">{permit.type}</td>
                <td className="border p-1">{t(permit.status)}</td>
                <td className="border p-1">{permit.startDate ? new Date(permit.startDate).toLocaleDateString(i18n.language) : ''}</td>
                <td className="border p-1">{permit.endDate ? new Date(permit.endDate).toLocaleDateString(i18n.language) : ''}</td>
                <td className="border p-1">
                  <Button size="sm" variant="outline" onClick={() => handleDetails(permit)}>{t('details')}</Button>
                  {permit.documents && permit.documents.pdf && permit.status === 'APPROVED' && (
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
      {/* Modal for details */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={() => setSelected(null)}>{t('close')}</button>
            <h3 className="text-lg font-bold mb-2">{t('details')}</h3>
            <div className="mb-2"><b>{t('permit_number')}:</b> {selected.permitNumber}</div>
            <div className="mb-2"><b>{t('type')}:</b> {selected.type}</div>
            <div className="mb-2"><b>{t('status')}:</b> {t(selected.status)}</div>
            <div className="mb-2"><b>{t('start_date')}:</b> {selected.startDate ? new Date(selected.startDate).toLocaleDateString(i18n.language) : ''}</div>
            <div className="mb-2"><b>{t('end_date')}:</b> {selected.endDate ? new Date(selected.endDate).toLocaleDateString(i18n.language) : ''}</div>
            <div className="mb-2"><b>{t('description')}:</b> {selected.workDescription || selected.description}</div>
            {selected.documents && selected.documents.pdf && selected.status === 'APPROVED' && (
              <div className="mb-2">
                <a
                  href={`/api/work-permits/${selected.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                  download
                >
                  {t('download_pdf')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 