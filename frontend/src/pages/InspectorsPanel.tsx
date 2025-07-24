import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function InspectorsPanel() {
  const { t, i18n } = useTranslation();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [violation, setViolation] = useState('');
  const [actionMsg, setActionMsg] = useState('');

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
      // فقط مجوزهای تاییدشده را می‌آورد
      const res = await fetch('/api/work-permits?status=APPROVED', { credentials: 'include' });
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
    setComment('');
    setViolation('');
    setActionMsg('');
  };

  const handleSubmitComment = async () => {
    if (!comment) return;
    setActionMsg('');
    try {
      // فرض بر این است که API برای ثبت کامنت وجود دارد
      const res = await fetch(`/api/work-permits/${selected.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('comment_success'));
      setComment('');
    } catch {
      setActionMsg(t('comment_error'));
    }
  };

  const handleSubmitViolation = async () => {
    if (!violation) return;
    setActionMsg('');
    try {
      // فرض بر این است که API برای ثبت تخلف وجود دارد
      const res = await fetch(`/api/work-permits/${selected.id}/violations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ violation }),
      });
      if (!res.ok) throw new Error('error');
      setActionMsg(t('violation_success'));
      setViolation('');
    } catch {
      setActionMsg(t('violation_error'));
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold">{t('inspectors_panel')}</h2>
      {loading && <div>{i18n.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">{t('permit_number')}</th>
              <th className="p-2 border">{t('company_name')}</th>
              <th className="p-2 border">{t('job_location')}</th>
              <th className="p-2 border">{t('type')}</th>
              <th className="p-2 border">{t('start_date')}</th>
              <th className="p-2 border">{t('end_date')}</th>
              <th className="p-2 border">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {permits.length === 0 && (
              <tr><td colSpan={7} className="text-center p-4">{t('no_permits_found')}</td></tr>
            )}
            {permits.map((permit) => (
              <tr key={permit.id}>
                <td className="border p-1">{permit.permitNumber}</td>
                <td className="border p-1">{permit.tenant?.name}</td>
                <td className="border p-1">{permit.location?.address}</td>
                <td className="border p-1">{permit.type}</td>
                <td className="border p-1">{permit.startDate ? new Date(permit.startDate).toLocaleDateString(i18n.language) : ''}</td>
                <td className="border p-1">{permit.endDate ? new Date(permit.endDate).toLocaleDateString(i18n.language) : ''}</td>
                <td className="border p-1">
                  <Button size="sm" variant="outline" onClick={() => handleDetails(permit)}>{t('details')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal for details, comments, violations */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={() => setSelected(null)}>{t('close')}</button>
            <h3 className="text-lg font-bold mb-2">{t('details')}</h3>
            <div className="mb-2"><b>{t('permit_number')}:</b> {selected.permitNumber}</div>
            <div className="mb-2"><b>{t('company_name')}:</b> {selected.tenant?.name}</div>
            <div className="mb-2"><b>{t('job_location')}:</b> {selected.location?.address}</div>
            <div className="mb-2"><b>{t('type')}:</b> {selected.type}</div>
            <div className="mb-2"><b>{t('start_date')}:</b> {selected.startDate ? new Date(selected.startDate).toLocaleDateString(i18n.language) : ''}</div>
            <div className="mb-2"><b>{t('end_date')}:</b> {selected.endDate ? new Date(selected.endDate).toLocaleDateString(i18n.language) : ''}</div>
            <div className="mb-2"><b>{t('description')}:</b> {selected.workDescription || selected.description}</div>
            {/* لیست کارگران و ID Card */}
            {selected.workers && Array.isArray(selected.workers) && selected.workers.length > 0 && (
              <div className="mb-2">
                <b>{t('workers_list')}:</b>
                <ul className="list-disc pl-5 mt-1">
                  {selected.workers.map((worker, idx) => (
                    <li key={idx}>
                      {worker.name} - {worker.idNumber}
                      {worker.idCardUrl && (
                        <a href={worker.idCardUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">{t('view_id_card')}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* کامنت و تخلف */}
            <div className="mb-2">
              <label className="block mb-1">{t('add_comment')}:</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} className="input border rounded p-1 w-full" />
              <Button size="sm" className="mt-2" onClick={handleSubmitComment}>{t('submit_comment')}</Button>
            </div>
            <div className="mb-2">
              <label className="block mb-1">{t('add_violation')}:</label>
              <textarea value={violation} onChange={e => setViolation(e.target.value)} className="input border rounded p-1 w-full" />
              <Button size="sm" className="mt-2" onClick={handleSubmitViolation}>{t('submit_violation')}</Button>
            </div>
            {actionMsg && <div className="mt-2 text-green-600">{actionMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 