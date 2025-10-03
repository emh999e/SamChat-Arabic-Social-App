import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, UploadCloud } from 'lucide-react';
import './ImageUpload.css';

function ImageUpload({ user, type, currentImage, onImageUpdate, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [error, setError] = useState(null);

  useEffect(() => {
    setImageUrl(currentImage);
  }, [currentImage]);

  const uploadImage = async (event) => {
    if (!user) {
      setError('يجب تسجيل الدخول لرفع الصور.');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using 'avatars' bucket for both avatar and cover for simplicity
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update user profile in database
      const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setImageUrl(publicUrl);
      onImageUpdate(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!user || !imageUrl) return;

    setUploading(true);
    setError(null);

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      // Remove image from Supabase storage
      const { error: removeError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (removeError) throw removeError;

      // Update user profile in database (set to null)
      const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setImageUrl(null);
      onImageUpdate(null);
    } catch (error) {
      console.error('Error removing image:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-overlay">
      <div className="image-upload-modal">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>{type === 'avatar' ? 'رفع صورة الملف الشخصي' : 'رفع صورة الغلاف'}</h2>
        
        {imageUrl && (
          <div className="current-image-preview">
            <img src={imageUrl} alt={type} />
            <button className="remove-image-btn" onClick={removeImage} disabled={uploading}>
              إزالة الصورة
            </button>
          </div>
        )}

        <div className="upload-area">
          <label htmlFor="single">
            <UploadCloud size={48} />
            <p>{uploading ? 'جاري الرفع...' : 'انقر لرفع صورة'}</p>
          </label>
          <input
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default ImageUpload;

