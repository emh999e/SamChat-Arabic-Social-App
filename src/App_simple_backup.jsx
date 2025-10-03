import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // فحص المستخدم الحالي
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>سام شات</h1>
          </div>
          <div className="user-info">
            <span>مرحباً، {user.email}</span>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="logout-btn"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <h2>مرحباً بك في سام شات!</h2>
          <p>التطبيق يعمل بنجاح.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
