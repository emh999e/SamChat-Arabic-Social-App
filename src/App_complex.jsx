import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ImageUpload from './components/ImageUpload';
import ProfileSetup from './components/ProfileSetup';
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
  MoreHorizontal
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
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_name: 'أحمد محمد',
    username: 'ahmed_mohamed',
    avatar_url: null,
    cover_url: null,
    bio: 'مطور ومصمم واجهات المستخدم',
    location: 'الرياض، السعودية',
    followers_count: 1250,
    following_count: 890,
    posts_count: 156
  });

  useEffect(() => {
    // التحقق من حالة المصادقة
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // تحميل المنشورات عند تسجيل الدخول
    if (user) {
      loadPosts();
      checkProfileCompletion();
    }
  }, [user]);

  // تحميل الصور المحفوظة من localStorage
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('userProfileImage');
    const savedCoverImage = localStorage.getItem('userCoverImage');
    const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    if (savedProfileImage) {
      setUserProfile(prev => ({ ...prev, avatar_url: savedProfileImage }));
    }
    
    if (savedCoverImage) {
      setUserProfile(prev => ({ ...prev, cover_url: savedCoverImage }));
    }
    
    // دمج البيانات المحفوظة
    if (Object.keys(savedProfile).length > 0) {
      setUserProfile(prev => ({ ...prev, ...savedProfile }));
    }
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      // استخدام بيانات تجريبية في حالة الخطأ
      setPosts([
        {
          id: 1,
          content: 'مرحباً بكم في سام شات! منصة التواصل العربية الجديدة التي تجمع بين الأصالة والحداثة. نحن نسعى لتوفير تجربة تواصل اجتماعي مميزة تحترم ثقافتنا العربية وتواكب التطور التقني.',
          created_at: new Date().toISOString(),
          likes_count: 24,
          comments_count: 8,
          shares_count: 3,
          profiles: {
            username: 'samchat_official',
            full_name: 'سام شات الرسمي',
            avatar_url: null
          }
        },
        {
          id: 2,
          content: 'يوم جميل في الحديقة مع الأصدقاء. الطبيعة تبعث السكينة في النفس وتجدد الطاقة الإيجابية. شاركونا أجمل لحظاتكم في الطبيعة! 🌿',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          likes_count: 15,
          comments_count: 4,
          shares_count: 2,
          profiles: {
            username: 'ahmed_nature',
            full_name: 'أحمد محب الطبيعة',
            avatar_url: null
          }
        },
        {
          id: 3,
          content: 'تعلمت اليوم شيئاً جديداً في البرمجة! التعلم المستمر هو مفتاح النجاح في عالم التقنية. ما هو آخر شيء تعلمتموه؟',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          likes_count: 32,
          comments_count: 12,
          shares_count: 5,
          profiles: {
            username: 'sara_dev',
            full_name: 'سارة المطورة',
            avatar_url: null
          }
        }
      ]);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowSettings(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const createPost = async (content) => {
    if (!content.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim()
          }
        ])
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `);

      if (error) throw error;
      
      if (data && data[0]) {
        setPosts(prevPosts => [data[0], ...prevPosts]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // إضافة المنشور محلياً في حالة الخطأ
      const newPost = {
        id: Date.now(),
        content: content.trim(),
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        profiles: {
          username: user.user_metadata?.username || 'user',
          full_name: user.user_metadata?.full_name || 'مستخدم',
          avatar_url: user.user_metadata?.avatar_url || null
        }
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
    setNewPostContent('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const closeAllDropdowns = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setShowSettings(false);
  };



  const handleImageUpload = (type) => {
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  const handleImageUpdate = (imageUrl) => {
    if (imageUploadType === 'avatar') {
      setUserProfile(prev => ({ ...prev, avatar_url: imageUrl }));
    } else {
      setUserProfile(prev => ({ ...prev, cover_url: imageUrl }));
    }
  };

  const handleProfileSetupComplete = (profileData) => {
    setUserProfile(prev => ({ ...prev, ...profileData }));
    setProfileCompleted(true);
    setShowProfileSetup(false);
  };

  const handleProfileSetupSkip = () => {
    setShowProfileSetup(false);
    setProfileCompleted(true);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>سام شات</h2>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="main-content">
            {/* منطقة إنشاء المنشور */}
            <div className="create-post">
              <div className="create-post-header">
                <img 
                  src={user.user_metadata?.avatar_url || '/default-avatar.png'} 
                  alt="صورتك الشخصية"
                  className="user-avatar"
                />
                <textarea 
                  placeholder={`ما الذي تفكر فيه، ${user.user_metadata?.full_name || 'صديق'}؟`}
                  className="post-input"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      createPost(newPostContent);
                    }
                  }}
                />
              </div>
              <div className="create-post-actions">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn">
                    <Image size={20} />
                    صورة
                  </button>
                  <button className="action-btn">
                    <Video size={20} />
                    فيديو
                  </button>
                  <button className="action-btn">
                    <Smile size={20} />
                    مشاعر
                  </button>
                </div>
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
              {posts.map((post) => (
                <div key={post.id} className="post">
                  <div className="post-header">
                    <img 
                      src={post.profiles?.avatar_url || '/default-avatar.png'} 
                      alt="صورة المستخدم"
                      className="user-avatar"
                    />
                    <div className="post-user-info">
                      <h4>{post.profiles?.full_name || 'مستخدم'}</h4>
                      <span className="post-time">{formatDate(post.created_at)}</span>
                    </div>
                    <button className="action-btn" style={{ marginRight: 'auto' }}>
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>
                  {(post.likes_count > 0 || post.comments_count > 0 || post.shares_count > 0) && (
                    <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                      {post.likes_count > 0 && <span>{formatNumber(post.likes_count)} إعجاب</span>}
                      {post.comments_count > 0 && <span style={{ marginRight: '16px' }}>{formatNumber(post.comments_count)} تعليق</span>}
                      {post.shares_count > 0 && <span style={{ marginRight: '16px' }}>{formatNumber(post.shares_count)} مشاركة</span>}
                    </div>
                  )}
                  <div className="post-actions">
                    <button className="action-btn">
                      <Heart size={20} />
                      إعجاب
                    </button>
                    <button className="action-btn">
                      <MessageSquare size={20} />
                      تعليق
                    </button>
                    <button className="action-btn">
                      <Share2 size={20} />
                      مشاركة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'friends':
        return (
          <div className="section-content">
            <h2>الأصدقاء</h2>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn-primary">
                <Plus size={16} style={{ marginLeft: '8px' }} />
                إضافة أصدقاء
              </button>
              <button className="action-btn">طلبات الصداقة</button>
              <button className="action-btn">اقتراحات</button>
            </div>
            <div className="friends-grid">
              {[
                { name: 'أحمد محمد', mutualFriends: 50, status: 'online' },
                { name: 'فاطمة علي', mutualFriends: 23, status: 'offline' },
                { name: 'محمد حسن', mutualFriends: 15, status: 'online' },
                { name: 'نور الدين', mutualFriends: 8, status: 'offline' },
                { name: 'ليلى أحمد', mutualFriends: 32, status: 'online' },
                { name: 'عمر خالد', mutualFriends: 19, status: 'offline' }
              ].map((friend, index) => (
                <div key={index} className="friend-card">
                  <img src="/default-avatar.png" alt="صديق" />
                  <h4>{friend.name}</h4>
                  <p>{friend.mutualFriends} صديق مشترك</p>
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '6px 12px' }}>
                      رسالة
                    </button>
                    <button className="action-btn" style={{ flex: 1, fontSize: '12px', padding: '6px 12px' }}>
                      إزالة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pages':
        return (
          <div className="section-content">
            <h2>الصفحات</h2>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn-primary">
                <Plus size={16} style={{ marginLeft: '8px' }} />
                إنشاء صفحة
              </button>
              <button className="action-btn">صفحاتي</button>
              <button className="action-btn">المتابعة</button>
            </div>
            <div className="pages-grid">
              {[
                { name: 'تقنيات المستقبل', followers: 125000, category: 'تقنية' },
                { name: 'الطبخ العربي', followers: 89000, category: 'طعام' },
                { name: 'السفر والرحلات', followers: 67000, category: 'سفر' },
                { name: 'الرياضة اليومية', followers: 45000, category: 'رياضة' },
                { name: 'الفن والثقافة', followers: 38000, category: 'فن' },
                { name: 'الصحة والعافية', followers: 52000, category: 'صحة' }
              ].map((page, index) => (
                <div key={index} className="page-card">
                  <img src="/default-page.png" alt="صفحة" />
                  <h4>{page.name}</h4>
                  <p>{formatNumber(page.followers)} متابع • {page.category}</p>
                  <button className="btn-primary" style={{ width: '100%', fontSize: '12px', padding: '6px 12px' }}>
                    متابعة
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'groups':
        return (
          <div className="section-content">
            <h2>المجموعات</h2>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn-primary">
                <Plus size={16} style={{ marginLeft: '8px' }} />
                إنشاء مجموعة
              </button>
              <button className="action-btn">مجموعاتي</button>
              <button className="action-btn">اكتشاف</button>
            </div>
            <div className="groups-grid">
              {[
                { name: 'مطورو الويب العرب', members: 15000, privacy: 'عامة' },
                { name: 'محبو القراءة', members: 8500, privacy: 'خاصة' },
                { name: 'ريادة الأعمال', members: 12000, privacy: 'عامة' },
                { name: 'التصوير الفوتوغرافي', members: 6700, privacy: 'عامة' },
                { name: 'الطبخ المنزلي', members: 9200, privacy: 'خاصة' },
                { name: 'اللياقة البدنية', members: 11500, privacy: 'عامة' }
              ].map((group, index) => (
                <div key={index} className="group-card">
                  <img src="/default-group.png" alt="مجموعة" />
                  <h4>{group.name}</h4>
                  <p>{formatNumber(group.members)} عضو • {group.privacy}</p>
                  <button className="btn-primary" style={{ width: '100%', fontSize: '12px', padding: '6px 12px' }}>
                    انضمام
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reels':
        return (
          <div className="section-content">
            <h2>الريلز</h2>
            <div style={{ marginBottom: '20px' }}>
              <button className="btn-primary">
                <Plus size={16} style={{ marginLeft: '8px' }} />
                إنشاء ريل
              </button>
            </div>
            <div className="reels-container">
              {[
                { title: 'رحلة إلى الصحراء', views: 1200000, duration: '0:30' },
                { title: 'وصفة كنافة نابلسية', views: 850000, duration: '1:15' },
                { title: 'تمارين الصباح', views: 650000, duration: '0:45' },
                { title: 'غروب الشمس', views: 420000, duration: '0:20' },
                { title: 'طريقة عمل القهوة', views: 380000, duration: '1:00' },
                { title: 'نصائح البرمجة', views: 290000, duration: '0:50' }
              ].map((reel, index) => (
                <div key={index} className="reel-card">
                  <div className="reel-video">
                    <Play size={50} />
                    <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                      {reel.duration}
                    </span>
                  </div>
                  <h4>{reel.title}</h4>
                  <p>{formatNumber(reel.views)} مشاهدة</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="section-content">
            <div className="profile-header">
              <div className="profile-cover cover-image-container">
                <img 
                  src={userProfile.cover_url || '/default-cover.png'} 
                  alt="صورة الغلاف" 
                />
                <button 
                  className="cover-image-upload-btn"
                  onClick={() => handleImageUpload('cover')}
                >
                  <Image size={16} />
                  تحديث الغلاف
                </button>
              </div>
              <div className="profile-info">
                <div className="profile-image-container">
                  <img 
                    src={userProfile.avatar_url || user.user_metadata?.avatar_url || '/default-avatar.png'} 
                    alt="صورة شخصية"
                    className="profile-avatar"
                  />
                  <button 
                    className="profile-image-upload-btn"
                    onClick={() => handleImageUpload('avatar')}
                  >
                    <Image size={16} />
                  </button>
                </div>
                <h2>{userProfile.full_name || user.user_metadata?.full_name || user.email || 'مستخدم'}</h2>
                <p>@{userProfile.username || user.user_metadata?.username || user.email?.split('@')[0] || 'user'}</p>
                {userProfile.bio && <p className="profile-bio">{userProfile.bio}</p>}
                {userProfile.location && <p className="profile-location">📍 {userProfile.location}</p>}
                {userProfile.work && <p className="profile-work">💼 {userProfile.work}</p>}
                {userProfile.education && <p className="profile-education">🎓 {userProfile.education}</p>}
                {userProfile.birth_date && (
                  <p className="profile-birth-date">
                    🎂 {new Date(userProfile.birth_date).toLocaleDateString('ar-SA', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
                {userProfile.relationship_status && (
                  <p className="profile-relationship">
                    💕 {userProfile.relationship_status === 'single' ? 'أعزب' : 
                        userProfile.relationship_status === 'married' ? 'متزوج' :
                        userProfile.relationship_status === 'engaged' ? 'مخطوب' :
                        userProfile.relationship_status === 'divorced' ? 'مطلق' :
                        userProfile.relationship_status === 'widowed' ? 'أرمل' :
                        userProfile.relationship_status === 'complicated' ? 'معقدة' :
                        userProfile.relationship_status}
                  </p>
                )}
                <p>انضم في {new Date(user.created_at).toLocaleDateString('ar-SA')}</p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '16px 0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '18px' }}>{userProfile.posts_count || 245}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>منشور</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '18px' }}>{formatNumber(userProfile.followers_count || 1200)}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>متابع</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '18px' }}>{formatNumber(userProfile.following_count || 890)}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>يتابع</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn-primary">تعديل الملف الشخصي</button>
                  <button className="action-btn">عرض الأرشيف</button>
                </div>
              </div>
            </div>
            <div className="profile-content">
              <h3>المنشورات الأخيرة</h3>
              {posts.filter(post => post.profiles?.username === user.user_metadata?.username).map((post) => (
                <div key={post.id} className="post">
                  <div className="post-content">
                    <p>{post.content}</p>
                    <span className="post-time">{formatDate(post.created_at)}</span>
                  </div>
                  <div className="post-actions">
                    <button className="action-btn">
                      <Heart size={20} />
                      إعجاب
                    </button>
                    <button className="action-btn">
                      <MessageSquare size={20} />
                      تعليق
                    </button>
                    <button className="action-btn">
                      <Share2 size={20} />
                      مشاركة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="section-content">
            <h2>{activeSection}</h2>
            <p>قريباً...</p>
          </div>
        );
    }
  };

  return (
    <div className="app" onClick={closeAllDropdowns}>
      {/* الشريط العلوي */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <h1>سام شات</h1>
          </div>
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="ابحث في سام شات..." />
          </div>
        </div>
        
        <div className="header-right">
          {/* أيقونة الإشعارات */}
          <div className="notification-container">
            <button 
              className={`icon-btn ${showNotifications ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowMessages(false);
                setShowSettings(false);
              }}
            >
              <Bell size={24} />
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>
            {showNotifications && (
              <div className="dropdown notifications-dropdown">
                <div className="dropdown-header">
                  <h3>الإشعارات</h3>
                  <button onClick={() => setShowNotifications(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="notification-item">
                  <img src="/default-avatar.png" alt="مستخدم" />
                  <div>
                    <p><strong>أحمد محمد</strong> أعجب بمنشورك</p>
                    <span>منذ 5 دقائق</span>
                  </div>
                </div>
                <div className="notification-item">
                  <img src="/default-avatar.png" alt="مستخدم" />
                  <div>
                    <p><strong>فاطمة علي</strong> علقت على منشورك</p>
                    <span>منذ 15 دقيقة</span>
                  </div>
                </div>
                <div className="notification-item">
                  <img src="/default-avatar.png" alt="مستخدم" />
                  <div>
                    <p><strong>محمد حسن</strong> شارك منشورك</p>
                    <span>منذ ساعة</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* أيقونة الرسائل */}
          <div className="notification-container">
            <button 
              className={`icon-btn ${showMessages ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMessages(!showMessages);
                setShowNotifications(false);
                setShowSettings(false);
              }}
            >
              <MessageCircle size={24} />
              {unreadMessages > 0 && (
                <span className="notification-badge">{unreadMessages}</span>
              )}
            </button>
            {showMessages && (
              <div className="dropdown messages-dropdown">
                <div className="dropdown-header">
                  <h3>الرسائل</h3>
                  <button onClick={() => setShowMessages(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="message-item">
                  <img src="/default-avatar.png" alt="مستخدم" />
                  <div>
                    <h4>أحمد محمد</h4>
                    <p>مرحباً، كيف حالك؟</p>
                    <span>منذ 10 دقائق</span>
                  </div>
                </div>
                <div className="message-item">
                  <img src="/default-avatar.png" alt="مستخدم" />
                  <div>
                    <h4>فاطمة علي</h4>
                    <p>شكراً لك على المساعدة</p>
                    <span>منذ ساعة</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* أيقونة الإعدادات */}
          <div className="notification-container">
            <button 
              className={`icon-btn ${showSettings ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
                setShowNotifications(false);
                setShowMessages(false);
              }}
            >
              <Settings size={24} />
            </button>
            {showSettings && (
              <div className="dropdown settings-dropdown">
                <div className="dropdown-header">
                  <h3>الإعدادات</h3>
                  <button onClick={() => setShowSettings(false)}>
                    <X size={20} />
                  </button>
                </div>
                <button className="dropdown-item">
                  <Edit size={20} />
                  تعديل الملف الشخصي
                </button>
                <button className="dropdown-item">
                  <Shield size={20} />
                  الخصوصية والأمان
                </button>
                <button className="dropdown-item">
                  <Bell size={20} />
                  إعدادات الإشعارات
                </button>
                <button className="dropdown-item">
                  <MessageCircle size={20} />
                  إعدادات الرسائل
                </button>
                <button className="dropdown-item">
                  <Globe size={20} />
                  الإعدادات العامة
                </button>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <LogOut size={20} />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>

          <div className="user-menu">
            <button className="user-btn">
              <img 
                src={user.user_metadata?.avatar_url || '/default-avatar.png'} 
                alt="صورتك الشخصية"
              />
            </button>
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* الشريط الجانبي الأيسر */}
        <aside className="sidebar left-sidebar">
          <nav className="nav-menu">
            <a 
              href="#" 
              className={activeSection === 'home' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('home');
              }}
            >
              <Home size={24} />
              الرئيسية
            </a>
            <a 
              href="#" 
              className={activeSection === 'friends' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('friends');
              }}
            >
              <Users size={24} />
              الأصدقاء
            </a>
            <a 
              href="#" 
              className={activeSection === 'pages' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('pages');
              }}
            >
              <FileText size={24} />
              الصفحات
            </a>
            <a 
              href="#" 
              className={activeSection === 'groups' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('groups');
              }}
            >
              <Users2 size={24} />
              المجموعات
            </a>
            <a 
              href="#" 
              className={activeSection === 'profile' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('profile');
              }}
            >
              <User size={24} />
              الملف الشخصي
            </a>
            <a 
              href="#" 
              className={activeSection === 'events' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('events');
              }}
            >
              <Calendar size={24} />
              الأحداث
            </a>
            <a 
              href="#" 
              className={activeSection === 'trends' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('trends');
              }}
            >
              <TrendingUp size={24} />
              الترندات
            </a>
            <a 
              href="#" 
              className={activeSection === 'stories' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('stories');
              }}
            >
              <BookOpen size={24} />
              القصص
            </a>
          </nav>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="main-content-area">
          {renderContent()}
        </main>

        {/* الشريط الجانبي الأيمن */}
        <aside className="sidebar right-sidebar">
          <div className="widget">
            <h3>الأصدقاء المتصلون</h3>
            <div className="online-friends">
              <div className="friend-item">
                <img src="/default-avatar.png" alt="صديق" />
                <span>أحمد محمد</span>
                <div className="online-indicator"></div>
              </div>
              <div className="friend-item">
                <img src="/default-avatar.png" alt="صديق" />
                <span>فاطمة علي</span>
                <div className="online-indicator"></div>
              </div>
              <div className="friend-item">
                <img src="/default-avatar.png" alt="صديق" />
                <span>محمد حسن</span>
                <div className="online-indicator"></div>
              </div>
              <div className="friend-item">
                <img src="/default-avatar.png" alt="صديق" />
                <span>نور الدين</span>
                <div className="online-indicator"></div>
              </div>
            </div>
          </div>

          <div className="widget">
            <h3>الترندات</h3>
            <div className="trending-topics">
              <div className="trend-item">
                <span>#تقنية</span>
                <small>15.2K منشور</small>
              </div>
              <div className="trend-item">
                <span>#رمضان_كريم</span>
                <small>8.7K منشور</small>
              </div>
              <div className="trend-item">
                <span>#السفر</span>
                <small>6.3K منشور</small>
              </div>
              <div className="trend-item">
                <span>#الطبخ</span>
                <small>4.9K منشور</small>
              </div>
              <div className="trend-item">
                <span>#الرياضة</span>
                <small>3.8K منشور</small>
              </div>
            </div>
          </div>

          <div className="widget">
            <h3>صفحات مقترحة</h3>
            <div className="online-friends">
              <div className="friend-item">
                <img src="/default-page.png" alt="صفحة" />
                <span>تقنيات المستقبل</span>
              </div>
              <div className="friend-item">
                <img src="/default-page.png" alt="صفحة" />
                <span>الطبخ العربي</span>
              </div>
              <div className="friend-item">
                <img src="/default-page.png" alt="صفحة" />
                <span>السفر والرحلات</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* شريط التنقل السفلي للهواتف */}
      <nav className="mobile-nav">
        <button 
          className={activeSection === 'home' ? 'active' : ''}
          onClick={() => setActiveSection('home')}
        >
          <Home size={24} />
          الرئيسية
        </button>
        <button 
          className={activeSection === 'friends' ? 'active' : ''}
          onClick={() => setActiveSection('friends')}
        >
          <Users size={24} />
          الأصدقاء
        </button>
        <button 
          className={activeSection === 'reels' ? 'active' : ''}
          onClick={() => setActiveSection('reels')}
        >
          <Play size={24} />
          الريلز
        </button>
        <button 
          className={activeSection === 'pages' ? 'active' : ''}
          onClick={() => setActiveSection('pages')}
        >
          <FileText size={24} />
          الصفحات
        </button>
        <button 
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => setActiveSection('profile')}
        >
          <User size={24} />
          الملف الشخصي
        </button>
      </nav>

      {/* مكون رفع الصور */}
      {showImageUpload && (
        <ImageUpload
          user={user}
          type={imageUploadType}
          currentImage={imageUploadType === 'avatar' ? userProfile.avatar_url : userProfile.cover_url}
          onImageUpdate={handleImageUpdate}
          onClose={() => setShowImageUpload(false)}
        />
      )}

      {/* مكون إعداد الملف الشخصي */}
      {showProfileSetup && (
        <ProfileSetup
          user={user}
          onComplete={handleProfileSetupComplete}
          onSkip={handleProfileSetupSkip}
        />
      )}
    </div>
  );
}

export default App;
