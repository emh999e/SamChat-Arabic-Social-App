import React, { useState } from 'react';
import { Calendar, Heart, MapPin, Briefcase, GraduationCap, X, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProfileSetup = ({ user, onComplete, onSkip }) => {
  const [formData, setFormData] = useState({
    location: '',
    workplace: '',
    work: '',
    education: '',
    birth_date: '',
    gender: '',
    relationship_status: '',
    website: '',
    phone: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const totalSteps = 3;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      // حفظ البيانات في Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          location: formData.location || null,
          birth_date: formData.birth_date || null,
          gender: formData.gender || null,
          website: formData.website || null,
          // إضافة الحقول الجديدة إلى جدول profiles إذا لم تكن موجودة
          // workplace: formData.workplace || null,
          // work: formData.work || null,
          // education: formData.education || null,
          // relationship_status: formData.relationship_status || null,
          // phone: formData.phone || null
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // حفظ البيانات الإضافية في localStorage مؤقتاً حتى يتم إضافتها للجدول
      const additionalData = {
        workplace: formData.workplace,
        work: formData.work,
        education: formData.education,
        relationship_status: formData.relationship_status,
        phone: formData.phone
      };
      
      localStorage.setItem(`profile_additional_${user.id}`, JSON.stringify(additionalData));
      localStorage.setItem('profile_setup_completed', 'true');
      
      // إغلاق النافذة
      onComplete(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('حدث خطأ أثناء حفظ المعلومات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem('profile_setup_completed', 'true');
    onSkip();
  };

  const renderStep1 = () => (
    <div className="profile-setup-step">
      <h3>المعلومات الأساسية</h3>
      <div className="form-group">
        <label>الموقع</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="المدينة، البلد"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="profile-setup-step">
      <h3>المعلومات الشخصية</h3>
      <div className="form-group">
        <label>تاريخ الميلاد *</label>
        <input
          type="date"
          value={formData.birth_date}
          onChange={(e) => handleInputChange('birth_date', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>الجنس *</label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          required
        >
          <option value="">اختر الجنس</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
          <option value="other">آخر</option>
        </select>
      </div>
      <div className="form-group">
        <label>الحالة الاجتماعية *</label>
        <select
          value={formData.relationship_status}
          onChange={(e) => handleInputChange('relationship_status', e.target.value)}
          required
        >
          <option value="">اختر الحالة الاجتماعية</option>
          <option value="single">أعزب</option>
          <option value="married">متزوج</option>
          <option value="engaged">مخطوب</option>
          <option value="divorced">مطلق</option>
          <option value="widowed">أرمل</option>
          <option value="complicated">معقدة</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="profile-setup-step">
      <h3>العمل والتعليم</h3>
      <div className="form-group">
        <label>مكان العمل</label>
        <input
          type="text"
          value={formData.workplace}
          onChange={(e) => handleInputChange('workplace', e.target.value)}
          placeholder="اسم الشركة أو المؤسسة"
        />
      </div>
      <div className="form-group">
        <label>المسمى الوظيفي</label>
        <input
          type="text"
          value={formData.work}
          onChange={(e) => handleInputChange('work', e.target.value)}
          placeholder="مطور برمجيات، مهندس، طبيب..."
        />
      </div>
      <div className="form-group">
        <label>التعليم</label>
        <input
          type="text"
          value={formData.education}
          onChange={(e) => handleInputChange('education', e.target.value)}
          placeholder="الجامعة أو المؤسسة التعليمية"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    if (currentStep === 2) {
      return formData.birth_date && formData.gender && formData.relationship_status;
    }
    return true;
  };

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup-modal">
        <div className="profile-setup-header">
          <h2>إكمال الملف الشخصي</h2>
          <p>الخطوة {currentStep} من {totalSteps}</p>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="profile-setup-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>

        <div className="profile-setup-content">
          {renderCurrentStep()}
        </div>

        {error && (
          <div className="error-message" style={{ margin: '1rem', padding: '0.75rem', backgroundColor: '#fee', color: '#c33', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="profile-setup-actions">
          {currentStep > 1 && (
            <button className="btn-secondary" onClick={handlePrevious} disabled={loading}>
              السابق
            </button>
          )}
          <div className="actions-right">
            <button className="btn-outline" onClick={handleClose} disabled={loading}>
              تخطي
            </button>
            <button 
              className="btn-primary" 
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              {loading ? 'جاري الحفظ...' : (currentStep === totalSteps ? 'إنهاء' : 'التالي')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
