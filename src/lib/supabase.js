import { createClient } from '@supabase/supabase-js'

// إعدادات Supabase الحقيقية
const supabaseUrl = 'https://gdeafgytoelnlssgbpfr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZWFmZ3l0b2Vsbmxzc2dicGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzI4MTIsImV4cCI6MjA3NDkwODgxMn0.DAorxtk2UYCiT6CMXBDGGFQnRYiHMLov-hmFOAPEtBo'

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// دوال مساعدة للمصادقة
export const auth = {
  // تسجيل مستخدم جديد
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // تسجيل الدخول
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // تسجيل الخروج
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // الاستماع لتغييرات المصادقة
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// دوال مساعدة للمنشورات
export const posts = {
  // الحصول على جميع المنشورات
  getAll: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('posts_with_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // إنشاء منشور جديد
  create: async (postData) => {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
    
    return { data, error }
  },

  // تحديث منشور
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  // حذف منشور
  delete: async (id) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // إضافة إعجاب
  like: async (postId, userId) => {
    const { data, error } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId }])
    
    return { data, error }
  },

  // إزالة إعجاب
  unlike: async (postId, userId) => {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    
    return { error }
  }
}

// دوال مساعدة للتعليقات
export const comments = {
  // الحصول على تعليقات منشور
  getByPostId: async (postId) => {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // إضافة تعليق
  create: async (commentData) => {
    const { data, error } = await supabase
      .from('post_comments')
      .insert([commentData])
      .select()
    
    return { data, error }
  },

  // حذف تعليق
  delete: async (id) => {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// دوال مساعدة للملفات الشخصية
export const profiles = {
  // الحصول على ملف شخصي
  getById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // تحديث الملف الشخصي
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  // البحث عن المستخدمين
  search: async (query) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10)
    
    return { data, error }
  }
}

// دوال مساعدة للإشعارات
export const notifications = {
  // الحصول على إشعارات المستخدم
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    
    return { data, error }
  },

  // تحديد الإشعار كمقروء
  markAsRead: async (id) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    return { data, error }
  }
}

export default supabase
