import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ImageUpload from './components/ImageUpload';
import ProfileSetup from './components/ProfileSetup';
import EditProfile from './components/EditProfile';
import './App.css';
import { 
  Home, 
  Users, 
  FileText, 
  Users2, 
  User, 
  Calendar, 
  TrendingUp, 
  BookOpen,
  Search,
  Bell,
  MessageCircle,
  Settings,
  Heart,
  MessageSquare,
  Share2,
  Image,
  Video,
  Smile,
  X,
  Play,
  LogOut,
  Edit,
  Shield,
  Volume2,
  Globe,
  Plus,
  MoreHorizontal,
  MapPin,
  Briefcase,
  GraduationCap,
  Save
} from 'lucide-react';

function App() {
  // حالة المصادقة
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [posts, setPosts] = useState([]);
  const [unreadNotifications] = useState(3);
  const [unreadMessages] = useState(2);
  const [newPostContent, setNewPostContent] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState('avatar');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    cover: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    bio: 'مرحباً! أنا جديد في سام شات.',
    location: 'الرياض، السعودية',
    joinDate: new Date().toLocaleDateString('ar-SA'),
    friendsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    // فحص المستخدم الحالي
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setUserProfile(prev => ({
            ...prev,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم',
            email: user.email
          }));
          checkProfileCompletion(user);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
    loadPosts();

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          setUserProfile(prev => ({
            ...prev,
            name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'مستخدم',
            email: currentUser.email
          }));
          checkProfileCompletion(currentUser);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkProfileCompletion = async (currentUser) => {
    if (!currentUser) return;
    
    try {
      // جلب بيانات الملف الشخصي من Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        // تحديث بيانات الملف الشخصي
        setUserProfile(prev => ({
          ...prev,
          name: profile.full_name || currentUser.email?.split('@')[0] || 'مستخدم',
          email: currentUser.email,
          avatar: profile.avatar_url || '',
          cover: profile.cover_url || '',
          birthDate: profile.birth_date || '',
          gender: profile.gender || '',
          bio: profile.bio || 'مرحباً! أنا جديد في سام شات.',
          location: profile.location || 'الرياض، السعودية',
          joinDate: new Date(profile.created_at).toLocaleDateString('ar-SA')
        }));

        // جلب البيانات الإضافية من localStorage مؤقتاً
        const additionalData = localStorage.getItem(`profile_additional_${currentUser.id}`);
        if (additionalData) {
          const additional = JSON.parse(additionalData);
          setUserProfile(prev => ({ ...prev, ...additional }));
        }

        // فحص إذا كان الملف الشخصي مكتملاً
        const isCompleted = localStorage.getItem('profile_setup_completed');
        if (isCompleted === 'true') {
          setProfileCompleted(true);
          setShowProfileSetup(false);
        } else if (profile.birth_date && profile.gender) {
          // إذا كانت البيانات الأساسية موجودة، اعتبر الملف مكتملاً
          localStorage.setItem('profile_setup_completed', 'true');
          setProfileCompleted(true);
          setShowProfileSetup(false);
        } else {
          // عرض نافذة إكمال الملف الشخصي
          setTimeout(() => {
            setShowProfileSetup(true);
          }, 1000);
        }
      } else {
        // إذا لم يكن هناك ملف شخصي، عرض نافذة الإعداد
        setTimeout(() => {
          setShowProfileSetup(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  const loadPosts = () => {
    // بيانات تجريبية للمنشورات
    const samplePosts = [
      {
        id: 1,
        author: 'أحمد محمد',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        content: 'مرحباً بالجميع في سام شات! أتطلع للتواصل معكم جميعاً 🌟',
        timestamp: 'منذ ساعتين',
        likes: 24,
        comments: 8,
        shares: 3,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
      },
      {
        id: 2,
        author: 'فاطمة العلي',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        content: 'يوم جميل للتنزه في الحديقة مع الأصدقاء! الطقس رائع اليوم ☀️',
        timestamp: 'منذ 4 ساعات',
        likes: 42,
        comments: 12,
        shares: 6
      },
      {
        id: 3,
        author: 'محمد السعيد',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        content: 'شاركت اليوم في مؤتمر التقنية. كان هناك الكثير من الأفكار المبتكرة! 💡',
        timestamp: 'منذ 6 ساعات',
        likes: 18,
        comments: 5,
        shares: 2,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop'
      }
    ];
    setPosts(samplePosts);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile({
        name: '',
        email: '',
        avatar: '',
        cover: '',
        birthDate: '',
        gender: '',
        maritalStatus: '',
        bio: 'مرحباً! أنا جديد في سام شات.',
        location: 'الرياض، السعودية',
        joinDate: new Date().toLocaleDateString('ar-SA'),
        friendsCount: 0,
        followersCount: 0,
        followingCount: 0
      });
      setActiveSection('home');
      setShowProfileSetup(false);
      setProfileCompleted(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const createPost = async (content) => {
    if (!content.trim() || !user) return;

    try {
      const newPost = {
        id: Date.now(),
        author: userProfile.name,
        avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        content: content.trim(),
        timestamp: 'الآن',
        likes: 0,
        comments: 0,
        shares: 0
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleImageUpload = (type) => {
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  const handleImageUpdate = (imageUrl) => {
    if (imageUploadType === 'avatar') {
      setUserProfile(prev => ({ ...prev, avatar: imageUrl }));
    } else if (imageUploadType === 'cover') {
      setUserProfile(prev => ({ ...prev, cover: imageUrl }));
    }
    
    // حفظ في التخزين المحلي
    if (user) {
      const updatedProfile = { ...userProfile };
      if (imageUploadType === 'avatar') {
        updatedProfile.avatar = imageUrl;
      } else if (imageUploadType === 'cover') {
        updatedProfile.cover = imageUrl;
      }
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
    }
    
    setShowImageUpload(false);
  };

  const handleProfileSetupComplete = (profileData) => {
    const updatedProfile = { ...userProfile, ...profileData };
    setUserProfile(updatedProfile);
    
    // حفظ في التخزين المحلي
    if (user) {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      localStorage.setItem('profile_setup_completed', 'true');
    }
    
    setShowProfileSetup(false);
    setProfileCompleted(true);
  };

  const handleEditProfileSave = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setShowEditProfile(false);
  };

  const handleProfileSetupSkip = () => {
    localStorage.setItem('profile_setup_completed', 'true');
    setShowProfileSetup(false);
    setProfileCompleted(true);
  };

  const closeAllDropdowns = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setShowSettings(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app" onClick={closeAllDropdowns}>
      {/* الشريط العلوي */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <h1>سام شات</h1>
            </div>
            <div className="search-bar">
              <Search size={20} />
              <input type="text" placeholder="البحث في سام شات..." />
            </div>
          </div>
          
<div className="header-right">
            <div className="header-icons">
              <div className="icon-wrapper" onClick={(e) => {
                e.stopPropagation();
                setShowMessages(!showMessages);
                setShowNotifications(false);
                setShowSettings(false);
              }}>
                <MessageCircle size={24} />
                {unreadMessages > 0 && (
                  <span className="notification-badge">{unreadMessages}</span>
                )}
                {showMessages && (
                  <div className="dropdown messages-dropdown">
                    <h3>الرسائل</h3>
                    <div className="message-item">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="فاطمة" />
                      <div>
                        <span>فاطمة العلي</span>
                        <p>مرحباً! كيف حالك؟</p>
                      </div>
                    </div>
                    <div className="message-item">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="محمد" />
                      <div>
                        <span>محمد السعيد</span>
                        <p>شكراً لك على المساعدة</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="icon-wrapper" onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowMessages(false);
                setShowSettings(false);
              }}>
                <Bell size={24} />
                {unreadNotifications > 0 && (
                  <span className="notification-badge">{unreadNotifications}</span>
                )}
                {showNotifications && (
                  <div className="dropdown notifications-dropdown">
                    <h3>الإشعارات</h3>
                    <div className="notification-item">
                      <span>أعجب أحمد بمنشورك</span>
                      <small>منذ 5 دقائق</small>
                    </div>
                    <div className="notification-item">
                      <span>علقت فاطمة على صورتك</span>
                      <small>منذ ساعة</small>
                    </div>
                    <div className="notification-item">
                      <span>انضم محمد إلى مجموعتك</span>
                      <small>منذ ساعتين</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="icon-wrapper" onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
                setShowNotifications(false);
                setShowMessages(false);
              }}>
                <Settings size={24} />
                {showSettings && (
                  <div className="dropdown settings-dropdown">
                    <h3>الإعدادات</h3>
                    <div className="setting-item" onClick={() => setActiveSection('profile')}>
                      <User size={16} />
                      <span>الملف الشخصي</span>
                    </div>
                    <div className="setting-item">
                      <Shield size={16} />
                      <span>الخصوصية</span>
                    </div>
                    <div className="setting-item">
                      <Bell size={16} />
                      <span>الإشعارات</span>
                    </div>
                    <div className="setting-item" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>تسجيل الخروج</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <div className="main-layout">
        {/* الشريط الجانبي الأيسر */}
        <aside className="sidebar left-sidebar">
          <nav className="nav-menu">
            <div 
              className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveSection('home')}
            >
              <Home size={20} />
              <span>الرئيسية</span>
            </div>
            <div 
              className={`nav-item ${activeSection === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveSection('friends')}
            >
              <Users size={20} />
              <span>الأصدقاء</span>
            </div>
            <div 
              className={`nav-item ${activeSection === 'pages' ? 'active' : ''}`}
              onClick={() => setActiveSection('pages')}
            >
              <FileText size={20} />
              <span>الصفحات</span>
            </div>
            <div 
              className={`nav-item ${activeSection === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveSection('groups')}
            >
              <Users2 size={20} />
              <span>المجموعات</span>
            </div>
            <div 
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <User size={20} />
              <span>الملف الشخصي</span>
            </div>
            <div 
              className={`nav-item ${activeSection === 'reels' ? 'active' : ''}`}
              onClick={() => setActiveSection('reels')}
            >
              <Play size={20} />
              <span>الريلز</span>
            </div>
          </nav>
        </aside>

        {/* شريط التنقل السفلي للجوال */}
        <div className="bottom-nav">
          <div 
            className={`bottom-nav-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => setActiveSection('home')}
          >
            <Home size={20} />
            <span>الرئيسية</span>
          </div>
          <div 
            className={`bottom-nav-item ${activeSection === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveSection('friends')}
          >
            <Users size={20} />
            <span>الأصدقاء</span>
          </div>
          <div 
            className={`bottom-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={20} />
            <span>الملف الشخصي</span>
          </div>
          <div 
            className={`bottom-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('notifications');
              setShowNotifications(true);
              setShowMessages(false);
              setShowSettings(false);
            }}
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
            <span>الإشعارات</span>
          </div>
          <div 
            className={`bottom-nav-item ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('messages');
              setShowMessages(true);
              setShowNotifications(false);
              setShowSettings(false);
            }}
          >
            <MessageCircle size={20} />
            {unreadMessages > 0 && (
              <span className="notification-badge">{unreadMessages}</span>
            )}
            <span>الرسائل</span>
          </div>
        </div>

        {/* المحتوى المركزي */}
        <main className="main-content">
          {activeSection === 'home' && (
            <div className="home-section">
              {/* نموذج إنشاء منشور */}
              <div className="create-post">
                <div className="post-header">
                  <img 
                    src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'} 
                    alt={userProfile.name}
                  />
                  <input
                    type="text"
                    placeholder={`ما الذي تفكر فيه، ${userProfile.name}؟`}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newPostContent.trim()) {
                        createPost(newPostContent);
                      }
                    }}
                  />
                </div>
                <div className="post-actions">
                  <button className="post-action">
                    <Image size={20} />
                    <span>صورة</span>
                  </button>
                  <button className="post-action">
                    <Video size={20} />
                    <span>فيديو</span>
                  </button>
                  <button className="post-action">
                    <Smile size={20} />
                    <span>مشاعر</span>
                  </button>
                  <button 
                    className="post-btn"
                    onClick={() => createPost(newPostContent)}
                    disabled={!newPostContent.trim()}
                  >
                    نشر
                  </button>
                </div>
              </div>

              {/* المنشورات */}
              <div className="posts-container">
                {posts.map(post => (
                  <div key={post.id} className="post">
                    <div className="post-header">
                      <img src={post.avatar} alt={post.author} />
                      <div className="post-info">
                        <h4>{post.author}</h4>
                        <span className="post-time">{post.timestamp}</span>
                      </div>
                      <button className="post-menu">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                    
                    <div className="post-content">
                      <p>{post.content}</p>
                      {post.image && (
                        <img src={post.image} alt="منشور" className="post-image" />
                      )}
                    </div>
                    
                    <div className="post-stats">
                      <span>{post.likes} إعجاب</span>
                      <span>{post.comments} تعليق</span>
                      <span>{post.shares} مشاركة</span>
                    </div>
                    
                    <div className="post-actions">
                      <button className="action-btn">
                        <Heart size={20} />
                        <span>إعجاب</span>
                      </button>
                      <button className="action-btn">
                        <MessageSquare size={20} />
                        <span>تعليق</span>
                      </button>
                      <button className="action-btn">
                        <Share2 size={20} />
                        <span>مشاركة</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-section">
              {/* صورة الغلاف */}
              <div className="cover-photo">
                <img 
                  src={userProfile.cover || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop'} 
                  alt="صورة الغلاف" 
                />
                <button 
                  className="edit-cover-btn"
                  onClick={() => handleImageUpload('cover')}
                >
                  <Edit size={16} />
                  تحديث صورة الغلاف
                </button>
              </div>
              
              {/* معلومات الملف الشخصي */}
              <div className="profile-info">
                <div className="profile-avatar">
                  <img 
                    src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                    alt={userProfile.name}
                  />
                  <button 
                    className="edit-avatar-btn"
                    onClick={() => handleImageUpload('avatar')}
                  >
                    <Edit size={16} />
                  </button>
                </div>
                
                <div className="profile-details">
                  <h2>{userProfile.name}</h2>
                  <p className="profile-bio">{userProfile.bio}</p>
                  
                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-number">{userProfile.friendsCount}</span>
                      <span className="stat-label">صديق</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{userProfile.followersCount}</span>
                      <span className="stat-label">متابع</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{userProfile.followingCount}</span>
                      <span className="stat-label">يتابع</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* قسم حول */}
              <div className="about-section">
                <div className="section-header">
                  <h3>حول</h3>
                  <button 
                    className="edit-profile-btn"
                    onClick={() => setShowEditProfile(true)}
                  >
                    <Edit size={16} />
                    تعديل التفاصيل
                  </button>
                </div>
                
                <div className="about-content">
                  {userProfile.location && (
                    <div className="about-item">
                      <MapPin size={16} />
                      <span>يعيش في {userProfile.location}</span>
                    </div>
                  )}
                  
                  {userProfile.birthDate && (
                    <div className="about-item">
                      <Calendar size={16} />
                      <span>تاريخ الميلاد: {new Date(userProfile.birthDate).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                  
                  {userProfile.gender && (
                    <div className="about-item">
                      <User size={16} />
                      <span>الجنس: {userProfile.gender === 'male' ? 'ذكر' : userProfile.gender === 'female' ? 'أنثى' : 'آخر'}</span>
                    </div>
                  )}
                  
                  {userProfile.workplace && (
                    <div className="about-item">
                      <Briefcase size={16} />
                      <span>يعمل في {userProfile.workplace}</span>
                    </div>
                  )}
                  
                  {userProfile.work && (
                    <div className="about-item">
                      <Briefcase size={16} />
                      <span>المسمى الوظيفي: {userProfile.work}</span>
                    </div>
                  )}
                  
                  {userProfile.education && (
                    <div className="about-item">
                      <GraduationCap size={16} />
                      <span>درس في {userProfile.education}</span>
                    </div>
                  )}
                  
                  {userProfile.relationship_status && (
                    <div className="about-item">
                      <Heart size={16} />
                      <span>الحالة الاجتماعية: {
                        userProfile.relationship_status === 'single' ? 'أعزب' :
                        userProfile.relationship_status === 'married' ? 'متزوج' :
                        userProfile.relationship_status === 'engaged' ? 'مخطوب' :
                        userProfile.relationship_status === 'divorced' ? 'مطلق' :
                        userProfile.relationship_status === 'widowed' ? 'أرمل' :
                        userProfile.relationship_status === 'complicated' ? 'معقدة' :
                        userProfile.relationship_status
                      }</span>
                    </div>
                  )}
                  
                  {userProfile.website && (
                    <div className="about-item">
                      <Globe size={16} />
                      <a href={userProfile.website} target="_blank" rel="noopener noreferrer">{userProfile.website}</a>
                    </div>
                  )}
                  
                  <div className="about-item">
                    <Calendar size={16} />
                    <span>انضم في {userProfile.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* منشورات المستخدم */}
              <div className="user-posts">
                <h3>المنشورات</h3>
                {posts.filter(post => post.author === userProfile.name).map(post => (
                  <div key={post.id} className="post">
                    <div className="post-header">
                      <img src={post.avatar} alt={post.author} />
                      <div className="post-info">
                        <h4>{post.author}</h4>
                        <span className="post-time">{post.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="post-content">
                      <p>{post.content}</p>
                      {post.image && (
                        <img src={post.image} alt="منشور" className="post-image" />
                      )}
                    </div>
                    
                    <div className="post-stats">
                      <span>{post.likes} إعجاب</span>
                      <span>{post.comments} تعليق</span>
                      <span>{post.shares} مشاركة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'friends' && (
            <div className="friends-section">
              <h2>الأصدقاء</h2>
              <div className="friends-grid">
                {[
                  { name: 'أحمد محمد', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', mutualFriends: 12 },
                  { name: 'فاطمة العلي', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', mutualFriends: 8 },
                  { name: 'محمد السعيد', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', mutualFriends: 15 },
                  { name: 'نورا أحمد', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', mutualFriends: 6 },
                  { name: 'عبدالله خالد', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', mutualFriends: 9 },
                  { name: 'سارة محمود', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', mutualFriends: 11 }
                ].map((friend, index) => (
                  <div key={index} className="friend-card">
                    <img src={friend.avatar} alt={friend.name} />
                    <h4>{friend.name}</h4>
                    <p>{friend.mutualFriends} صديق مشترك</p>
                    <button className="friend-btn">إرسال رسالة</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeSection === 'pages' || activeSection === 'groups' || activeSection === 'reels') && (
            <div className="coming-soon">
              <h2>قريباً...</h2>
              <p>هذا القسم قيد التطوير وسيكون متاحاً قريباً!</p>
            </div>
          )}
        </main>

        {/* الشريط الجانبي الأيمن */}
        <aside className="sidebar right-sidebar">
          <div className="trending-section">
            <h3>الترندات</h3>
            <div className="trending-item">
              <TrendingUp size={16} />
              <span>#سام_شات</span>
            </div>
            <div className="trending-item">
              <TrendingUp size={16} />
              <span>#التقنية</span>
            </div>
            <div className="trending-item">
              <TrendingUp size={16} />
              <span>#السعودية</span>
            </div>
          </div>

          <div className="online-friends">
            <h3>الأصدقاء المتصلون</h3>
            <div className="online-friend">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="فاطمة" />
              <span>فاطمة العلي</span>
              <div className="online-indicator"></div>
            </div>
            <div className="online-friend">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="محمد" />
              <span>محمد السعيد</span>
              <div className="online-indicator"></div>
            </div>
            <div className="online-friend">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="نورا" />
              <span>نورا أحمد</span>
              <div className="online-indicator"></div>
            </div>
          </div>
        </aside>
      </div>

      {/* شريط التنقل السفلي للهواتف */}
      <nav className="mobile-nav">
        <div 
          className={`mobile-nav-item ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => setActiveSection('home')}
        >
          <Home size={22} />
          <span>الرئيسية</span>
        </div>
        <div 
          className={`mobile-nav-item ${activeSection === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveSection('friends')}
        >
          <Users size={22} />
          <span>الأصدقاء</span>
        </div>
        <div 
          className={`mobile-nav-item ${activeSection === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveSection('reels')}
        >
          <Play size={22} />
          <span>الريلز</span>
        </div>
        <div 
          className={`mobile-nav-item ${activeSection === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveSection('groups')}
        >
          <Users2 size={22} />
          <span>المجموعات</span>
        </div>
        <div 
          className={`mobile-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <User size={22} />
          <span>الملف الشخصي</span>
        </div>
      </nav>

      {/* نافذة رفع الصور */}
      {showImageUpload && (
        <ImageUpload
          type={imageUploadType}
          onUpload={handleImageUpdate}
          onClose={() => setShowImageUpload(false)}
        />
      )}

      {/* نافذة إعداد الملف الشخصي */}
      {showProfileSetup && (
        <ProfileSetup
          user={user}
          onComplete={handleProfileSetupComplete}
          onSkip={handleProfileSetupSkip}
        />
      )}

      {/* نافذة تعديل الملف الشخصي */}
      {showEditProfile && (
        <EditProfile
          user={user}
          userProfile={userProfile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleEditProfileSave}
        />
      )}
    </div>
  );
}

export default App;
