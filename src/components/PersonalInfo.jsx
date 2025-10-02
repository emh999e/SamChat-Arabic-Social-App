import React, { useState } from 'react';
import { Calendar, User, MapPin, Phone, Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PersonalInfo = ({ user, onComplete, onSkip }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    birth_date: '',
    gender: '',
    location: '',
    phone: '',
    bio: '',
    website: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // تحديث الملف الشخصي في قاعدة البيانات
      const { error } = await supabase
        .from('profiles')
        .update({
          birth_date: formData.birth_date || null,
          gender: formData.gender || null,
          location: formData.location || null,
          bio: formData.bio || null,
          website: formData.website || null
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('حدث خطأ أثناء حفظ المعلومات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personal-info-container">
      <div className="personal-info-card">
        <div className="personal-info-header">
          <h2>أكمل معلوماتك الشخصية</h2>
          <p>ساعدنا في تخصيص تجربتك على سام شات</p>
        </div>

        <form onSubmit={handleSubmit} className="personal-info-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birth_date">تاريخ الميلاد</label>
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gender">الجنس</label>
              <div className="input-wrapper">
                <User size={20} />
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">اختر الجنس</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                  <option value="other">آخر</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">الموقع</label>
            <div className="input-wrapper">
              <MapPin size={20} />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="المدينة، البلد"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">نبذة عنك</label>
            <div className="input-wrapper">
              <User size={20} />
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="اكتب نبذة مختصرة عن نفسك..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="website">الموقع الإلكتروني</label>
            <div className="input-wrapper">
              <Globe size={20} />
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="skip-button"
              onClick={onSkip}
            >
              <ArrowLeft size={20} />
              تخطي الآن
            </button>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  حفظ والمتابعة
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="personal-info-footer">
          <p>يمكنك تعديل هذه المعلومات لاحقاً من إعدادات الملف الشخصي</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
