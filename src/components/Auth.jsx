import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Globe, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const generateUsername = (email, fullName) => {
    // إنشاء اسم مستخدم تلقائي من البريد الإلكتروني أو الاسم
    const baseUsername = email.split('@')[0] || fullName.replace(/\s+/g, '').toLowerCase();
    // إضافة أرقام عشوائية لضمان الفرادة
    const randomNumbers = Math.floor(Math.random() * 10000);
    return `${baseUsername}_${randomNumbers}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // تسجيل الدخول
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          throw error;
        }

        if (data.user) {
          onAuthSuccess && onAuthSuccess(data.user);
        }
      } else {
        // إنشاء حساب جديد
        const generatedUsername = generateUsername(formData.email, formData.fullName);
        
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              username: generatedUsername
            }
          }
        });
        
        if (error) {
          throw error;
        }

        if (data.user) {
          setError('تم إرسال رابط التفعيل إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // ترجمة رسائل الخطأ إلى العربية
      let errorMessage = 'حدث خطأ غير متوقع';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'بيانات تسجيل الدخول غير صحيحة';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'هذا البريد الإلكتروني مسجل مسبقاً';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      } else if (error.message.includes('Unable to validate email address')) {
        errorMessage = 'عنوان البريد الإلكتروني غير صالح';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'يرجى تأكيد بريدك الإلكتروني أولاً';
      } else if (error.message.includes('signup is disabled')) {
        errorMessage = 'التسجيل معطل حالياً';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Globe size={40} />
            <h1>سام شات</h1>
          </div>
          <p className="auth-subtitle">
            {isLogin ? 'مرحباً بعودتك!' : 'انضم إلى مجتمعنا'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">الاسم الكامل</label>
              <div className="input-wrapper">
                <User size={20} />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="أدخل اسمك الكامل"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="أدخل كلمة المرور"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="username-info">
              <p>سيتم إنشاء اسم مستخدم فريد لك تلقائياً</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  email: '',
                  password: '',
                  fullName: ''
                });
              }}
              className="switch-button"
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </p>
        </div>

        <div className="auth-footer">
          <p>© 2025 سام شات. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
