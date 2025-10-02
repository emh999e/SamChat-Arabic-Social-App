import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, MapPin, Briefcase, GraduationCap, Heart, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EditProfile = ({ user, userProfile, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    location: '',
    birth_date: '',
    gender: '',
    workplace: '',
    work: '',
    education: '',
    relationship_status: '',
    website: '',
    bio: ''
  });

  useEffect(() => {
    // تحميل البيانات الحالية
    setFormData({
      location: userProfile.location || '',
      birth_date: userProfile.birthDate || '',
      gender: userProfile.gender || '',
      workplace: userProfile.workplace || '',
      work: userProfile.work || '',
      education: userProfile.education || '',
      relationship_status: userProfile.relationship_status || '',
      website: userProfile.website || '',
      bio: userProfile.bio || ''
    });

    // جلب البيانات الإضافية من localStorage
    const additionalData = localStorage.getItem(`profile_additional_${user.id}`);
    if (additionalData) {
      const additional = JSON.parse(additionalData);
      setFormData(prev => ({ ...prev, ...additional }));
    }
  }, [userProfile, user.id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSave = async () => {
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
          bio: formData.bio || null
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // حفظ البيانات الإضافية في localStorage مؤقتاً
      const additionalData = {
        workplace: formData.workplace,
        work: formData.work,
        education: formData.education,
        relationship_status: formData.relationship_status
      };
      
      localStorage.setItem(`profile_additional_${user.id}`, JSON.stringify(additionalData));

      // تحديث البيانات في الواجهة
      onSave({
        ...userProfile,
        location: formData.location,
        birthDate: formData.birth_date,
        gender: formData.gender,
        website: formData.website,
        bio: formData.bio,
        workplace: formData.workplace,
        work: formData.work,
        education: formData.education,
        relationship_status: formData.relationship_status
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('حدث خطأ أثناء حفظ المعلومات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-modal">
      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <h2>تعديل الملف الشخصي</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="location">
              <MapPin size={16} />
              الموقع
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="المدينة، البلد"
            />
          </div>

          <div className="form-group">
            <label htmlFor="birth_date">
              <Calendar size={16} />
              تاريخ الميلاد
            </label>
            <input
              type="date"
              id="birth_date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">
              <User size={16} />
              الجنس
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
              <option value="other">آخر</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="workplace">
              <Briefcase size={16} />
              مكان العمل
            </label>
            <input
              type="text"
              id="workplace"
              value={formData.workplace}
              onChange={(e) => handleInputChange('workplace', e.target.value)}
              placeholder="اسم الشركة أو المؤسسة"
            />
          </div>

          <div className="form-group">
            <label htmlFor="work">
              <Briefcase size={16} />
              المسمى الوظيفي
            </label>
            <input
              type="text"
              id="work"
              value={formData.work}
              onChange={(e) => handleInputChange('work', e.target.value)}
              placeholder="مطور برمجيات، مهندس، طبيب..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="education">
              <GraduationCap size={16} />
              التعليم
            </label>
            <input
              type="text"
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="الجامعة أو المؤسسة التعليمية"
            />
          </div>

          <div className="form-group">
            <label htmlFor="relationship_status">
              <Heart size={16} />
              الحالة الاجتماعية
            </label>
            <select
              id="relationship_status"
              value={formData.relationship_status}
              onChange={(e) => handleInputChange('relationship_status', e.target.value)}
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

          <div className="form-group">
            <label htmlFor="website">
              <Globe size={16} />
              الموقع الإلكتروني
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">
              <User size={16} />
              النبذة الشخصية
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="اكتب نبذة مختصرة عن نفسك..."
              rows="3"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="edit-profile-actions">
            <button className="cancel-btn" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={16} />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
