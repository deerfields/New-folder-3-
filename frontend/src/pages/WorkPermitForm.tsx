import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import '../i18n';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const jobTypes = [
  { value: 'MAINTENANCE', labelKey: 'jobtype_maintenance' },
  { value: 'HOT_WORK', labelKey: 'jobtype_hotwork' },
  { value: 'HEIGHT_WORKS', labelKey: 'jobtype_heightworks' },
  { value: 'SERVICE_CLOSURE', labelKey: 'jobtype_serviceclosure' },
  { value: 'TRADING_HOURS', labelKey: 'jobtype_tradinghours' },
  { value: 'DEMOLITION_WORKS', labelKey: 'jobtype_demolition' },
  { value: 'OTHER', labelKey: 'jobtype_other' },
];

const HEAVY_JOB_TYPES = ['HOT_WORK', 'DEMOLITION_WORKS'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const workPermitSchema = z.object({
  companyName: z.string().min(2, { message: 'company_name_min' }),
  jobLocation: z.string().min(2, { message: 'job_location_min' }),
  onSiteIncharge: z.string().min(2, { message: 'on_site_incharge_min' }),
  contactNo: z.string().regex(/^\+?\d{7,15}$/, { message: 'contact_no_invalid' }),
  dateFrom: z.string().min(1, { message: 'date_required' }),
  dateTo: z.string().min(1, { message: 'date_required' }),
  timeFrom: z.string().min(1, { message: 'time_required' }),
  timeTo: z.string().min(1, { message: 'time_required' }),
  jobTypes: z.array(z.string()).min(1, { message: 'job_type_required' }),
  description: z.string().min(10, { message: 'description_min' }),
  numberOfWorkers: z.coerce.number().min(1, { message: 'number_of_workers_min' }),
  workersIdCards: z.array(z.any()).refine(arr => arr.every(f => !f || (allowedFileTypes.includes(f.type) && f.size <= MAX_FILE_SIZE)), { message: 'worker_id_card_invalid' }),
  companyLicense: z.any().refine(f => !f || (allowedFileTypes.includes(f.type) && f.size <= MAX_FILE_SIZE), { message: 'company_license_invalid' }),
  companyPermit: z.any().refine(f => !f || (allowedFileTypes.includes(f.type) && f.size <= MAX_FILE_SIZE), { message: 'company_permit_invalid' }),
  accidentInsurance: z.any().optional().refine(f => !f || (allowedFileTypes.includes(f.type) && f.size <= MAX_FILE_SIZE), { message: 'accident_insurance_invalid' }),
});

type WorkPermitFormType = z.infer<typeof workPermitSchema>;

const {
  register,
  handleSubmit,
  setValue,
  watch,
  formState: { errors },
  reset,
} = useForm<WorkPermitFormType>({
  resolver: zodResolver(workPermitSchema),
  defaultValues: {
    companyName: '',
    jobLocation: '',
    onSiteIncharge: '',
    contactNo: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    jobTypes: [],
    description: '',
    numberOfWorkers: 1,
    workersIdCards: [],
    companyLicense: null,
    companyPermit: null,
    accidentInsurance: null,
  },
});

export default function WorkPermitForm() {
  const { t, i18n } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // آپدیت تعداد ورودی‌های ID Card بر اساس تعداد کارگران
  useEffect(() => {
    setValue('workersIdCards', Array.from({ length: Number(watch('numberOfWorkers')) || 1 }, (_, i) => watch(`workersIdCards.${i}`) || null));
  }, [watch('numberOfWorkers')]);

  const handleChange = (e) => {
    setValue(e.target.name, e.target.value);
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setValue((prev) => ({
      ...prev,
      jobTypes: checked
        ? [...prev.jobTypes, value]
        : prev.jobTypes.filter((t) => t !== value),
    }));
  };

  const handleFile = (e) => {
    setValue(e.target.name, e.target.files);
  };

  const handleWorkerIdCard = (idx, file) => {
    setValue((prev) => {
      const arr = [...prev.workersIdCards];
      arr[idx] = file;
      return { ...prev, workersIdCards: arr };
    });
  };

  const handleCompanyLicense = (e) => {
    setValue('companyLicense', e.target.files[0]);
  };
  const handleCompanyPermit = (e) => {
    setValue('companyPermit', e.target.files[0]);
  };
  const handleAccidentInsurance = (e) => {
    setValue('accidentInsurance', e.target.files[0]);
  };

  const isHeavyJob = watch('jobTypes').some((type) => HEAVY_JOB_TYPES.includes(type));

  const handleSubmitForm = async (data) => {
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments' && value) {
          for (let i = 0; i < value.length; i++) {
            formData.append('attachments', value[i]);
          }
        } else if (key === 'workersIdCards') {
          value.forEach((file, idx) => file && formData.append(`workerIdCard_${idx + 1}`, file));
        } else if (key === 'companyLicense' && value) {
          formData.append('companyLicense', value);
        } else if (key === 'companyPermit' && value) {
          formData.append('companyPermit', value);
        } else if (key === 'accidentInsurance' && value) {
          formData.append('accidentInsurance', value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });
      const res = await fetch('/api/work-permits', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('error');
      setSuccess(true);
      reset({
        companyName: '',
        jobLocation: '',
        onSiteIncharge: '',
        contactNo: '',
        dateFrom: '',
        dateTo: '',
        timeFrom: '',
        timeTo: '',
        jobTypes: [],
        description: '',
        attachments: null,
        numberOfWorkers: 1,
        workersIdCards: [],
        companyLicense: null,
        companyPermit: null,
        accidentInsurance: null,
      });
    } catch (err) {
      setError('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-8">
      {/* سوییچ زبان */}
      <div className="flex gap-2 mb-4 justify-end">
        <Button size="sm" variant={i18n.language === 'en' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        <Button size="sm" variant={i18n.language === 'ar' ? 'default' : 'outline'} onClick={() => i18n.changeLanguage('ar')}>العربية</Button>
      </div>
      <h2 className="text-xl mb-4 font-bold">{t('work_permit_form_title')}</h2>
      <Input {...register('companyName')} placeholder={t('company_name')} onChange={handleChange} required className="mb-2" />
      {errors.companyName && <div className="text-red-600 text-xs">{t(errors.companyName.message)}</div>}
      <Input {...register('jobLocation')} placeholder={t('job_location')} onChange={handleChange} required className="mb-2" />
      {errors.jobLocation && <div className="text-red-600 text-xs">{t(errors.jobLocation.message)}</div>}
      <Input {...register('onSiteIncharge')} placeholder={t('on_site_incharge')} onChange={handleChange} required className="mb-2" />
      {errors.onSiteIncharge && <div className="text-red-600 text-xs">{t(errors.onSiteIncharge.message)}</div>}
      <Input {...register('contactNo')} placeholder={t('contact_no')} onChange={handleChange} required className="mb-2" />
      {errors.contactNo && <div className="text-red-600 text-xs">{t(errors.contactNo.message)}</div>}
      <div className="flex gap-2 mb-2">
        <Input type="date" {...register('dateFrom')} onChange={handleChange} required />
        {errors.dateFrom && <div className="text-red-600 text-xs">{t(errors.dateFrom.message)}</div>}
        <Input type="date" {...register('dateTo')} onChange={handleChange} required />
        {errors.dateTo && <div className="text-red-600 text-xs">{t(errors.dateTo.message)}</div>}
      </div>
      <div className="flex gap-2 mb-2">
        <Input type="time" {...register('timeFrom')} onChange={handleChange} required />
        {errors.timeFrom && <div className="text-red-600 text-xs">{t(errors.timeFrom.message)}</div>}
        <Input type="time" {...register('timeTo')} onChange={handleChange} required />
        {errors.timeTo && <div className="text-red-600 text-xs">{t(errors.timeTo.message)}</div>}
      </div>
      <div className="mb-2">
        <label className="block mb-1">{t('job_type')}:</label>
        <div className="flex flex-wrap gap-2">
          {jobTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-1">
              <input type="checkbox" value={type.value} checked={watch('jobTypes').includes(type.value)} onChange={handleCheckbox} /> {t(type.labelKey)}
            </label>
          ))}
        </div>
        {errors.jobTypes && <div className="text-red-600 text-xs">{t(errors.jobTypes.message)}</div>}
      </div>
      <div className="mb-2">
        <label className="block mb-1">{t('number_of_workers')}:</label>
        <Input type="number" min={1} {...register('numberOfWorkers')} onChange={handleChange} required className="mb-2 w-32" />
        {errors.numberOfWorkers && <div className="text-red-600 text-xs">{t(errors.numberOfWorkers.message)}</div>}
        {Array.from({ length: Number(watch('numberOfWorkers')) || 1 }).map((_, idx) => (
          <div key={idx} className="mb-1">
            <label className="block text-xs mb-1">{t('worker_id_card', { number: idx + 1 })}</label>
            <input type="file" accept="image/*,.pdf" {...register(`workersIdCards.${idx}`)} onChange={e => handleWorkerIdCard(idx, e.target.files[0])} required />
            {errors.workersIdCards && errors.workersIdCards[idx] && <div className="text-red-600 text-xs">{t(errors.workersIdCards[idx].message)}</div>}
          </div>
        ))}
      </div>
      <div className="mb-2">
        <label className="block mb-1">{t('company_license')}:</label>
        <input type="file" accept="image/*,.pdf" {...register('companyLicense')} onChange={handleCompanyLicense} required />
        {errors.companyLicense && <div className="text-red-600 text-xs">{t(errors.companyLicense.message)}</div>}
      </div>
      <div className="mb-2">
        <label className="block mb-1">{t('company_permit')}:</label>
        <input type="file" accept="image/*,.pdf" {...register('companyPermit')} onChange={handleCompanyPermit} required />
        {errors.companyPermit && <div className="text-red-600 text-xs">{t(errors.companyPermit.message)}</div>}
      </div>
      {isHeavyJob && (
        <div className="mb-2">
          <label className="block mb-1">{t('accident_insurance')}:</label>
          <input type="file" accept="image/*,.pdf" {...register('accidentInsurance')} onChange={handleAccidentInsurance} />
          {errors.accidentInsurance && <div className="text-red-600 text-xs">{t(errors.accidentInsurance.message)}</div>}
        </div>
      )}
      <textarea {...register('description')} placeholder={t('description')} onChange={handleChange} className="input mb-2 w-full border rounded p-2" required />
      {errors.description && <div className="text-red-600 text-xs">{t(errors.description.message)}</div>}
      <input type="file" multiple {...register('attachments')} onChange={handleFile} className="mb-2" />
      <Button type="submit" disabled={submitting}>{submitting ? t('submitting') : t('submit')}</Button>
      {success && <div className="text-green-600 mt-2">{t('form_success')}</div>}
      {error && <div className="text-red-600 mt-2">{t('form_error')}</div>}
    </form>
  );
} 