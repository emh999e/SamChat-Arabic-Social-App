import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

const ImageUpload = ({ user, type = 'avatar', currentImage, onImageUpdate, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح');
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setError('');
    
    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // تحويل الصورة إلى base64 وحفظها في localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        
        // حفظ الصورة في localStorage
        const storageKey = type === 'avatar' ? 'userProfileImage' : 'userCoverImage';
        localStorage.setItem(storageKey, imageDataUrl);
        
        // تحديث الملف الشخصي في localStorage
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
        userProfile[updateField] = imageDataUrl;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // إشعار المكون الأب بالتحديث
        onImageUpdate(imageDataUrl);
        onClose();
        setUploading(false);
      };
      
      reader.onerror = () => {
        setError('حدث خطأ أثناء معالجة الصورة');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading image:', error);
      setError('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
      setUploading(false);
    }
  };

  const removeImage = async () => {
    setUploading(true);
    setError('');

    try {
      // إزالة الصورة من localStorage
      const storageKey = type === 'avatar' ? 'userProfileImage' : 'userCoverImage';
      localStorage.removeItem(storageKey);
      
      // تحديث الملف الشخصي في localStorage
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
      userProfile[updateField] = null;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      onImageUpdate(null);
      onClose();

    } catch (error) {
      console.error('Error removing image:', error);
      setError('حدث خطأ أثناء إزالة الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-overlay">
      <div className="image-upload-modal">
        <div className="modal-header">
          <h3>
            {type === 'avatar' ? 'تحديث الصورة الشخصية' : 'تحديث صورة الغلاف'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {preview ? (
            <div className="image-preview">
              <img 
                src={preview} 
                alt="معاينة الصورة" 
                className={type === 'avatar' ? 'avatar-preview' : 'cover-preview'}
              />
            </div>
          ) : currentImage ? (
            <div className="current-image">
              <img 
                src={currentImage} 
                alt="الصورة الحالية" 
                className={type === 'avatar' ? 'avatar-preview' : 'cover-preview'}
              />
            </div>
          ) : (
            <div className="no-image">
              <Camera size={48} />
              <p>لا توجد صورة</p>
            </div>
          )}

          <div className="upload-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button 
              className="select-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={20} />
              اختيار صورة
            </button>

            {currentImage && (
              <button 
                className="remove-btn"
                onClick={removeImage}
                disabled={uploading}
              >
                <X size={20} />
                إزالة الصورة
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-btn"
            onClick={onClose}
            disabled={uploading}
          >
            إلغاء
          </button>
          
          {preview && (
            <button 
              className="upload-btn"
              onClick={uploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Check size={20} />
                  حفظ الصورة
                </>
              )}
            </button>
          )}
        </div>

        <div className="upload-info">
          <p>
            • الحد الأقصى لحجم الصورة: 5 ميجابايت<br/>
            • الصيغ المدعومة: JPG, PNG, GIF<br/>
            • {type === 'avatar' ? 'الأبعاد المثلى: 400x400 بكسل' : 'الأبعاد المثلى: 1200x400 بكسل'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
