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
  const [activeProfileTab, setActiveProfileTab] = useState('news');
  const [userNews, setUserNews] = useState([]);
  const [userReels, setUserReels] = useState([]);
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newReelContent, setNewReelContent] = useState('');
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
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          checkProfileCompletion(user);
        } else {
          localStorage.removeItem('profile_setup_completed');
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
    loadPosts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          checkProfileCompletion(currentUser);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserNews(user.id);
      loadUserReels(user.id);
    }

    const path = window.location.pathname;
    if (path === '/profile') {
      setActiveSection('profile');
    } else if (path === '/home') {
      setActiveSection('home');
    }
  }, [user]);

  const checkProfileCompletion = async (currentUser) => {
    if (!currentUser) return;
    
    try {
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

        const isCompleted = localStorage.getItem('profile_setup_completed');
        if (isCompleted === 'true') {
          setProfileCompleted(true);
          setShowProfileSetup(false);
        } else if (profile.birth_date && profile.gender) {
          localStorage.setItem('profile_setup_completed', 'true');
          setProfileCompleted(true);
          setShowProfileSetup(false);
        } else {
          setTimeout(() => {
            setShowProfileSetup(true);
          }, 1000);
        }
      } else {
        setTimeout(() => {
          setShowProfileSetup(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  const loadUserNews = async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading user news:", error);
        return;
      }
      setUserNews(data || []);
    } catch (error) {
      console.error("Error loading user news:", error);
    }
  };

  const loadUserReels = async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("reels_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading user reels:", error);
        return;
      }
      setUserReels(data || []);
    } catch (error) {
      console.error("Error loading user reels:", error);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          image_url,
          video_url,
          created_at,
          profiles (username, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading posts:", error);
        return;
      }

      const formattedPosts = data.map(post => ({
        id: post.id,
        author: post.profiles.username,
        avatar: post.profiles.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        content: post.content,
        timestamp: new Date(post.created_at).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }),
        likes: 0,
        comments: 0,
        shares: 0,
        image: post.image_url,
        video: post.video_url
      }));
      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
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
      localStorage.removeItem('profile_setup_completed');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const createPost = async (content) => {
    if (!content.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
          image_url: null,
          video_url: null,
          privacy: 'public'
        })
        .select();

      if (error) {
        console.error("Error creating post:", error);
        return;
      }

      if (data && data.length > 0) {
        const newPost = {
          id: data[0].id,
          author: userProfile.name,
          avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          content: data[0].content,
          timestamp: 'الآن',
          likes: 0,
          comments: 0,
          shares: 0,
          image: data[0].image_url,
          video: data[0].video_url
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setNewPostContent('');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const createNews = async (content) => {
    if (!content.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from("news_posts")
        .insert({
          user_id: user.id,
          author_name: userProfile.name,
          author_avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          content: content.trim(),
          likes: 0,
          comments: 0,
          shares: 0
        })
        .select();

      if (error) {
        console.error("Error creating news post:", error);
        return;
      }

      if (data && data.length > 0) {
        setUserNews(prevNews => [data[0], ...prevNews]);
        setNewNewsContent('');
      }
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const createReel = async (content) => {
    if (!content.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from("reels_posts")
        .insert({
          user_id: user.id,
          author_name: userProfile.name,
          author_avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          content: content.trim(),
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0
        })
        .select();

      if (error) {
        console.error("Error creating reel:", error);
        return;
      }

      if (data && data.length > 0) {
        setUserReels(prevReels => [data[0], ...prevReels]);
        setNewReelContent('');
      }
    } catch (error) {
      console.error('Error creating reel:', error);
    }
  };

  const handleImageUpload = (type) => {
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  const handleImageUpdate = async (imageUrl) => {
    if (!user) return;

    try {
      let updateData = {};
      if (imageUploadType === 'avatar') {
        updateData = { avatar_url: imageUrl };
        setUserProfile(prev => ({ ...prev, avatar: imageUrl }));
      } else if (imageUploadType === 'cover') {
        updateData = { cover_url: imageUrl };
        setUserProfile(prev => ({ ...prev, cover: imageUrl }));
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      setShowImageUpload(false);
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleProfileSetupComplete = (profileData) => {
    const updatedProfile = { ...userProfile, ...profileData };
    setUserProfile(updatedProfile);
    
    if (user) {
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

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="center-content">
            {/* قسم إنشاء المنشور المحسن */}
            <div className="create-post-enhanced">
              <div className="post-form-main">
                <div className="post-form-left">
                  <img 
                    src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                    alt="صورتك الشخصية"
                    className="post-avatar"
                  />
                </div>
                <div className="post-form-content">
                  <textarea 
                    placeholder={`ما الذي تفكر فيه، ${userProfile.name || 'صديق'}؟`}
                    className="post-textarea"
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
              </div>
              <div className="post-form-actions-horizontal">
                <div className="post-actions-left">
                  <button className="post-action-enhanced">
                    <Image size={20} />
                    صورة
                  </button>
                  <button className="post-action-enhanced">
                    <Video size={20} />
                    فيديو
                  </button>
                  <button className="post-action-enhanced">
                    <Smile size={20} />
                    مشاعر
                  </button>
                </div>
                <div className="post-actions-right">
                  <button 
                    className="post-btn-enhanced"
                    onClick={() => createPost(newPostContent)}
                    disabled={!newPostContent.trim()}
                  >
                    نشر
                  </button>
                </div>
              </div>
            </div>

            {/* المنشورات */}
            <div className="posts-container">
              {posts.map((post) => (
                <div key={post.id} className="post">
                  <div className="post-header">
                    <img 
                      src={post.avatar} 
                      alt="صورة المستخدم"
                    />
                    <div className="post-info">
                      <h4>{post.author || 'مستخدم'}</h4>
                      <span className="post-time">{post.timestamp}</span>
                    </div>
                    <button className="post-menu">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.image && <img src={post.image} alt="صورة المنشور" className="post-image" />}
                    {post.video && <video src={post.video} controls className="post-image" />}
                  </div>
                  {(post.likes > 0 || post.comments > 0 || post.shares > 0) && (
                    <div className="post-stats">
                      <span>{post.likes} إعجاب</span>
                      <span>{post.comments} تعليق</span>
                      <span>{post.shares} مشاركة</span>
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

      case 'profile':
        return (
          <div className="center-content">
            {/* قسم الملف الشخصي */}
            <div className="profile-section">
              <div 
                className="cover-photo"
                style={{
                  backgroundImage: userProfile.cover 
                    ? `url(${userProfile.cover})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <button 
                  className="edit-cover-btn"
                  onClick={() => handleImageUpload('cover')}
                >
                  <Edit size={16} />
                  تعديل الغلاف
                </button>
              </div>
              
              <div className="profile-info">
                <div className="profile-avatar-wrapper">
                  <img 
                    src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                    alt="الصورة الشخصية"
                    className="profile-avatar"
                  />
                  <button 
                    className="edit-avatar-btn"
                    onClick={() => handleImageUpload('avatar')}
                  >
                    <Edit size={16} />
                  </button>
                </div>
                
                <h2>{userProfile.name || 'مستخدم'}</h2>
                <p className="profile-bio">{userProfile.bio}</p>
                
                <div className="profile-stats">
                  <span>{userProfile.friendsCount} صديق</span>
                  <span>{userProfile.followersCount} متابع</span>
                  <span>{userProfile.followingCount} متابَع</span>
                </div>
                
                <button 
                  className="edit-profile-btn"
                  onClick={() => setShowEditProfile(true)}
                >
                  <Edit size={16} />
                  تعديل الملف الشخصي
                </button>
              </div>
              
              <div className="profile-about">
                <h3>حول</h3>
                <div className="about-items">
                  <div className="about-item">
                    <MapPin size={16} />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="about-item">
                    <Calendar size={16} />
                    <span>انضم في {userProfile.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* قسمي الأخبار والريلز */}
            <div className="profile-content-tabs">
              <div className="content-tabs-header">
                <button 
                  className={`content-tab ${activeProfileTab === 'news' ? 'active' : ''}`}
                  onClick={() => setActiveProfileTab('news')}
                >
                  <FileText size={20} />
                  الأخبار
                </button>
                <button 
                  className={`content-tab ${activeProfileTab === 'reels' ? 'active' : ''}`}
                  onClick={() => setActiveProfileTab('reels')}
                >
                  <Play size={20} />
                  الريلز
                </button>
              </div>

              {activeProfileTab === 'news' && (
                <div className="news-section-dynamic">
                  <div className="create-news">
                    <div className="post-header">
                      <img 
                        src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                        alt="صورتك الشخصية"
                      />
                      <input 
                        type="text"
                        placeholder="شارك خبراً جديداً..."
                        value={newNewsContent}
                        onChange={(e) => setNewNewsContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            createNews(newNewsContent);
                          }
                        }}
                      />
                    </div>
                    <div className="post-actions">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="post-action">
                          <Image size={16} />
                          صورة
                        </button>
                        <button className="post-action">
                          <Video size={16} />
                          فيديو
                        </button>
                      </div>
                      <button 
                        className="post-btn"
                        onClick={() => createNews(newNewsContent)}
                        disabled={!newNewsContent.trim()}
                      >
                        نشر
                      </button>
                    </div>
                  </div>

                  <div className="news-container">
                    {userNews.length > 0 ? (
                      userNews.map((news) => (
                        <div key={news.id} className="news-post">
                          <div className="news-post-header">
                            <div className="author-info">
                              <img 
                                src={news.author_avatar || userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                                alt="صورة المؤلف"
                              />
                              <div>
                                <h4>{news.author_name || userProfile.name}</h4>
                                <span className="post-time">
                                  {new Date(news.created_at).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="post-content">
                            <p>{news.content}</p>
                          </div>
                          <div className="post-stats">
                            <span>{news.likes} إعجاب</span>
                            <span>{news.comments} تعليق</span>
                            <span>{news.shares} مشاركة</span>
                          </div>
                          <div className="post-actions">
                            <button className="action-btn">
                              <Heart size={16} />
                              إعجاب
                            </button>
                            <button className="action-btn">
                              <MessageSquare size={16} />
                              تعليق
                            </button>
                            <button className="action-btn">
                              <Share2 size={16} />
                              مشاركة
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <FileText size={48} />
                        </div>
                        <h3>لا توجد أخبار بعد</h3>
                        <p>ابدأ بمشاركة أول خبر لك!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeProfileTab === 'reels' && (
                <div className="reels-section-dynamic">
                  <div className="create-reel">
                    <div className="post-header">
                      <img 
                        src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                        alt="صورتك الشخصية"
                      />
                      <input 
                        type="text"
                        placeholder="أنشئ ريل جديد..."
                        value={newReelContent}
                        onChange={(e) => setNewReelContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            createReel(newReelContent);
                          }
                        }}
                      />
                    </div>
                    <div className="post-actions">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="post-action">
                          <Video size={16} />
                          فيديو
                        </button>
                        <button className="post-action">
                          <Volume2 size={16} />
                          صوت
                        </button>
                      </div>
                      <button 
                        className="post-btn"
                        onClick={() => createReel(newReelContent)}
                        disabled={!newReelContent.trim()}
                      >
                        نشر
                      </button>
                    </div>
                  </div>

                  <div className="reels-container">
                    {userReels.length > 0 ? (
                      userReels.map((reel) => (
                        <div key={reel.id} className="reel-post">
                          <div className="reel-post-header">
                            <div className="author-info">
                              <img 
                                src={reel.author_avatar || userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                                alt="صورة المؤلف"
                              />
                              <div>
                                <h4>{reel.author_name || userProfile.name}</h4>
                                <span className="post-time">
                                  {new Date(reel.created_at).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="post-content">
                            <p>{reel.content}</p>
                          </div>
                          <div className="post-stats">
                            <span>{reel.views} مشاهدة</span>
                            <span>{reel.likes} إعجاب</span>
                            <span>{reel.comments} تعليق</span>
                          </div>
                          <div className="post-actions">
                            <button className="action-btn">
                              <Heart size={16} />
                              إعجاب
                            </button>
                            <button className="action-btn">
                              <MessageSquare size={16} />
                              تعليق
                            </button>
                            <button className="action-btn">
                              <Share2 size={16} />
                              مشاركة
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <Play size={48} />
                        </div>
                        <h3>لا توجد ريلز بعد</h3>
                        <p>ابدأ بإنشاء أول ريل لك!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'reels':
        return (
          <div className="center-content">
            <div className="reels-main-section">
              <h2>الريلز</h2>
              <div className="create-reel-main">
                <div className="post-form-main">
                  <div className="post-form-left">
                    <img 
                      src={userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                      alt="صورتك الشخصية"
                      className="post-avatar"
                    />
                  </div>
                  <div className="post-form-content">
                    <textarea 
                      placeholder={`أنشئ ريل جديد، ${userProfile.name || 'صديق'}؟`}
                      className="post-textarea"
                      value={newReelContent}
                      onChange={(e) => setNewReelContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          createReel(newReelContent);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="post-form-actions-horizontal">
                  <div className="post-actions-left">
                    <button className="post-action-enhanced">
                      <Video size={20} />
                      فيديو
                    </button>
                    <button className="post-action-enhanced">
                      <Volume2 size={20} />
                      صوت
                    </button>
                  </div>
                  <div className="post-actions-right">
                    <button 
                      className="post-btn-enhanced"
                      onClick={() => createReel(newReelContent)}
                      disabled={!newReelContent.trim()}
                    >
                      نشر ريل
                    </button>
                  </div>
                </div>
              </div>

              <div className="reels-container">
                {userReels.length > 0 ? (
                  userReels.map((reel) => (
                    <div key={reel.id} className="reel-post">
                      <div className="reel-post-header">
                        <div className="author-info">
                          <img 
                            src={reel.author_avatar || userProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                            alt="صورة المؤلف"
                          />
                          <div>
                            <h4>{reel.author_name || userProfile.name}</h4>
                            <span className="post-time">
                              {new Date(reel.created_at).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="post-content">
                        <p>{reel.content}</p>
                      </div>
                      <div className="post-stats">
                        <span>{reel.views} مشاهدة</span>
                        <span>{reel.likes} إعجاب</span>
                        <span>{reel.comments} تعليق</span>
                      </div>
                      <div className="post-actions">
                        <button className="action-btn">
                          <Heart size={16} />
                          إعجاب
                        </button>
                        <button className="action-btn">
                          <MessageSquare size={16} />
                          تعليق
                        </button>
                        <button className="action-btn">
                          <Share2 size={16} />
                          مشاركة
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Play size={48} />
                    </div>
                    <h3>لا توجد ريلز بعد</h3>
                    <p>ابدأ بإنشاء أول ريل لك!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="center-content">
            <h2>قريباً...</h2>
            <p>هذا القسم قيد التطوير</p>
          </div>
        );
    }
  };

  return (
    <div className="app" onClick={closeAllDropdowns}>
      {/* الرأس */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <h1>سام شات</h1>
            </div>
          </div>
          
          <div className="header-center">
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
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="أحمد" />
                      <div>
                        <span>أحمد محمد</span>
                        <p>هل يمكننا الاجتماع غداً؟</p>
                      </div>
                    </div>
                    <button className="view-all-btn">عرض جميع الرسائل</button>
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
                  <div className="dropdown">
                    <h3>الإشعارات</h3>
                    <div className="notification-item">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="سارة" />
                      <div>
                        <span>سارة أحمد</span>
                        <small>أعجبت بمنشورك</small>
                      </div>
                    </div>
                    <div className="notification-item">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="محمد" />
                      <div>
                        <span>محمد علي</span>
                        <small>علق على منشورك</small>
                      </div>
                    </div>
                    <button className="view-all-btn">عرض جميع الإشعارات</button>
                  </div>
                )}
              </div>

              <div className="icon-wrapper" onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
                setShowMessages(false);
                setShowNotifications(false);
              }}>
                <Settings size={24} />
                {showSettings && (
                  <div className="dropdown settings-dropdown">
                    <h3>الإعدادات</h3>
                    <div className="setting-item" onClick={() => setActiveSection('profile')}>
                      <User size={20} />
                      <span>الملف الشخصي</span>
                    </div>
                    <div className="setting-item">
                      <Shield size={20} />
                      <span>الخصوصية</span>
                    </div>
                    <div className="setting-item" onClick={handleLogout}>
                      <LogOut size={20} />
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
      <div className="main-content">
        {/* الشريط الجانبي الأيسر */}
        <aside className="sidebar left-sidebar">
          <div className="sidebar-item" onClick={() => setActiveSection('home')}>
            <Home size={24} />
            <span>الرئيسية</span>
          </div>
          <div className="sidebar-item" onClick={() => setActiveSection('profile')}>
            <User size={24} />
            <span>الملف الشخصي</span>
          </div>
          <div className="sidebar-item" onClick={() => setActiveSection('friends')}>
            <Users size={24} />
            <span>الأصدقاء</span>
          </div>
          <div className="sidebar-item" onClick={() => setActiveSection('groups')}>
            <Users2 size={24} />
            <span>المجموعات</span>
          </div>
          <div className="sidebar-item" onClick={() => setActiveSection('pages')}>
            <FileText size={24} />
            <span>الصفحات</span>
          </div>
        </aside>

        {/* المحتوى المركزي */}
        {renderContent()}

        {/* الشريط الجانبي الأيمن */}
        <aside className="sidebar right-sidebar">
          <div className="trending-section">
            <h3>الأكثر رواجاً</h3>
            <div className="trending-item">
              <TrendingUp size={16} />
              <span>#تقنية</span>
            </div>
            <div className="trending-item">
              <TrendingUp size={16} />
              <span>#رياضة</span>
            </div>
            <div className="trending-item">
              <TrendingUp size={16} />
              <span>#أخبار</span>
            </div>
          </div>

          <div className="suggestions-section">
            <h3>اقتراحات المتابعة</h3>
            <div className="suggestion-item">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="مقترح" />
              <div>
                <span>نورا أحمد</span>
                <button className="follow-btn">متابعة</button>
              </div>
            </div>
            <div className="suggestion-item">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="مقترح" />
              <div>
                <span>خالد محمد</span>
                <button className="follow-btn">متابعة</button>
              </div>
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
          className={`mobile-nav-item ${activeSection === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveSection('groups')}
        >
          <Users2 size={22} />
          <span>المجموعات</span>
        </div>
        <div
          className={`mobile-nav-item ${activeSection === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveSection('reels')}
        >
          <Play size={22} />
          <span>ريلز</span>
        </div>
        <div
          className={`mobile-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <User size={22} />
          <span>الملف الشخصي</span>
        </div>
      </nav>

      {/* النوافذ المنبثقة */}
      {showImageUpload && (
        <ImageUpload
          type={imageUploadType}
          onImageUpdate={handleImageUpdate}
          onClose={() => setShowImageUpload(false)}
        />
      )}

      {showProfileSetup && (
        <ProfileSetup
          onComplete={handleProfileSetupComplete}
          onSkip={handleProfileSetupSkip}
        />
      )}

      {showEditProfile && (
        <EditProfile
          user={user}
          userProfile={userProfile}
          onSave={handleEditProfileSave}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
