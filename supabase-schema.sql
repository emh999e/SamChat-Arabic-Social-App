-- إعداد قاعدة بيانات سام شات في Supabase
-- يجب تشغيل هذا الكود في SQL Editor في Supabase

-- تفعيل Row Level Security


-- إنشاء جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  location TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المنشورات
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  privacy TEXT DEFAULT 'friends' CHECK (privacy IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول التعليقات
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإعجابات
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- إنشاء جدول الأصدقاء
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'friend_request', 'friend_accept')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة triggers لتحديث updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إعداد Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للملفات الشخصية
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- سياسات الأمان للمنشورات
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends posts" ON posts
  FOR SELECT USING (
    privacy = 'friends' AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM friendships 
        WHERE (user_id = auth.uid() AND friend_id = posts.user_id AND status = 'accepted')
           OR (friend_id = auth.uid() AND user_id = posts.user_id AND status = 'accepted')
      )
    )
  );

CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات الأمان للتعليقات
CREATE POLICY "Users can view comments on visible posts" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_comments.post_id 
      AND (
        posts.privacy = 'public' OR
        posts.user_id = auth.uid() OR
        (posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can insert comments on visible posts" ON post_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_comments.post_id 
      AND (
        posts.privacy = 'public' OR
        posts.user_id = auth.uid() OR
        (posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can update own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات الأمان للإعجابات
CREATE POLICY "Users can view likes on visible posts" ON post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_likes.post_id 
      AND (
        posts.privacy = 'public' OR
        posts.user_id = auth.uid() OR
        (posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can manage own likes" ON post_likes
  FOR ALL USING (auth.uid() = user_id);

-- سياسات الأمان للصداقات
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage own friendships" ON friendships
  FOR ALL USING (auth.uid() = user_id);

-- سياسات الأمان للإشعارات
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- دالة لإنشاء ملف شخصي تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger لإنشاء الملف الشخصي تلقائياً
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- إدراج بيانات تجريبيةEW posts_with_stats AS
SELECT 
  p.*,
  pr.username,
  pr.full_name,
  pr.avatar_url,
  COALESCE(like_counts.likes_count, 0) as likes_count,
  COALESCE(comment_counts.comments_count, 0) as comments_count
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as likes_count
  FROM post_likes
  GROUP BY post_id
) like_counts ON p.id = like_counts.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comments_count
  FROM post_comments
  GROUP BY post_id
) comment_counts ON p.id = comment_counts.post_id;

-- منح الصلاحيات
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


-- إعداد Storage للصور
-- إنشاء bucket للصور الشخصية وصور الغلاف
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage للصور
-- السماح للمستخدمين المسجلين برفع الصور
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- السماح للجميع بقراءة الصور
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- السماح للمستخدمين بتحديث صورهم الخاصة
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- السماح للمستخدمين بحذف صورهم الخاصة
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);


-- إنشاء جدول منشورات الأخبار (News Posts)
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول منشورات الريلز (Reels Posts)
CREATE TABLE IF NOT EXISTS reels_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول إعجابات الأخبار
CREATE TABLE IF NOT EXISTS news_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_post_id UUID REFERENCES news_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(news_post_id, user_id)
);

-- إنشاء جدول تعليقات الأخبار
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_post_id UUID REFERENCES news_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول إعجابات الريلز
CREATE TABLE IF NOT EXISTS reels_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_post_id UUID REFERENCES reels_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reel_post_id, user_id)
);

-- إنشاء جدول تعليقات الريلز
CREATE TABLE IF NOT EXISTS reels_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_post_id UUID REFERENCES reels_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_news_posts_user_id ON news_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_created_at ON news_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_posts_user_id ON reels_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_reels_posts_created_at ON reels_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_likes_post_id ON news_likes(news_post_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_post_id ON news_comments(news_post_id);
CREATE INDEX IF NOT EXISTS idx_reels_likes_post_id ON reels_likes(reel_post_id);
CREATE INDEX IF NOT EXISTS idx_reels_comments_post_id ON reels_comments(reel_post_id);

-- إضافة triggers لتحديث updated_at
CREATE TRIGGER update_news_posts_updated_at BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reels_posts_updated_at BEFORE UPDATE ON reels_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_comments_updated_at BEFORE UPDATE ON news_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reels_comments_updated_at BEFORE UPDATE ON reels_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إعداد Row Level Security للجداول الجديدة
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels_comments ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لمنشورات الأخبار
CREATE POLICY "Users can view public news posts" ON news_posts
  FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can view own news posts" ON news_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends news posts" ON news_posts
  FOR SELECT USING (
    privacy = 'friends' AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM friendships 
        WHERE (user_id = auth.uid() AND friend_id = news_posts.user_id AND status = 'accepted')
           OR (friend_id = auth.uid() AND user_id = news_posts.user_id AND status = 'accepted')
      )
    )
  );

CREATE POLICY "Users can insert own news posts" ON news_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own news posts" ON news_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own news posts" ON news_posts
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات الأمان لمنشورات الريلز
CREATE POLICY "Users can view public reels posts" ON reels_posts
  FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can view own reels posts" ON reels_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends reels posts" ON reels_posts
  FOR SELECT USING (
    privacy = 'friends' AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM friendships 
        WHERE (user_id = auth.uid() AND friend_id = reels_posts.user_id AND status = 'accepted')
           OR (friend_id = auth.uid() AND user_id = reels_posts.user_id AND status = 'accepted')
      )
    )
  );

CREATE POLICY "Users can insert own reels posts" ON reels_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reels posts" ON reels_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reels posts" ON reels_posts
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات الأمان لإعجابات وتعليقات الأخبار
CREATE POLICY "Users can view news likes on visible posts" ON news_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM news_posts 
      WHERE news_posts.id = news_likes.news_post_id 
      AND (
        news_posts.privacy = 'public' OR
        news_posts.user_id = auth.uid() OR
        (news_posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = news_posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = news_posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can manage own news likes" ON news_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view news comments on visible posts" ON news_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM news_posts 
      WHERE news_posts.id = news_comments.news_post_id 
      AND (
        news_posts.privacy = 'public' OR
        news_posts.user_id = auth.uid() OR
        (news_posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = news_posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = news_posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can insert news comments on visible posts" ON news_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM news_posts 
      WHERE news_posts.id = news_comments.news_post_id 
      AND (
        news_posts.privacy = 'public' OR
        news_posts.user_id = auth.uid() OR
        (news_posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = news_posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = news_posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can update own news comments" ON news_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own news comments" ON news_comments
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات الأمان لإعجابات وتعليقات الريلز
CREATE POLICY "Users can view reels likes on visible posts" ON reels_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reels_posts 
      WHERE reels_posts.id = reels_likes.reel_post_id 
      AND (
        reels_posts.privacy = 'public' OR
        reels_posts.user_id = auth.uid() OR
        (reels_posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = reels_posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = reels_posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can manage own reels likes" ON reels_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view reels comments on visible posts" ON reels_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reels_posts 
      WHERE reels_posts.id = reels_comments.reel_post_id 
      AND (
        reels_posts.privacy = 'public' OR
        reels_posts.user_id = auth.uid() OR
        (reels_posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = reels_posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = reels_posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can insert reels comments on visible posts" ON reels_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM reels_posts 
      WHERE reels_posts.id = reels_comments.reel_post_id 
      AND (
        reels_posts.privacy = 'public' OR
        reels_posts.user_id = auth.uid() OR
        (reels_posts.privacy = 'friends' AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = auth.uid() AND friend_id = reels_posts.user_id AND status = 'accepted')
             OR (friend_id = auth.uid() AND user_id = reels_posts.user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can update own reels comments" ON reels_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reels comments" ON reels_comments
  FOR DELETE USING (auth.uid() = user_id);

-- منح الصلاحيات للجداول الجديدة
GRANT ALL ON news_posts TO anon, authenticated;
GRANT ALL ON reels_posts TO anon, authenticated;
GRANT ALL ON news_likes TO anon, authenticated;
GRANT ALL ON news_comments TO anon, authenticated;
GRANT ALL ON reels_likes TO anon, authenticated;
GRANT ALL ON reels_comments TO anon, authenticated;

-- إنشاء views محسنة للأخبار والريلز مع الإحصائيات
CREATE OR REPLACE VIEW news_posts_with_stats AS
SELECT 
  np.*,
  COALESCE(like_counts.likes_count, 0) as likes_count,
  COALESCE(comment_counts.comments_count, 0) as comments_count
FROM news_posts np
LEFT JOIN (
  SELECT news_post_id, COUNT(*) as likes_count
  FROM news_likes
  GROUP BY news_post_id
) like_counts ON np.id = like_counts.news_post_id
LEFT JOIN (
  SELECT news_post_id, COUNT(*) as comments_count
  FROM news_comments
  GROUP BY news_post_id
) comment_counts ON np.id = comment_counts.news_post_id;

CREATE OR REPLACE VIEW reels_posts_with_stats AS
SELECT 
  rp.*,
  COALESCE(like_counts.likes_count, 0) as likes_count,
  COALESCE(comment_counts.comments_count, 0) as comments_count
FROM reels_posts rp
LEFT JOIN (
  SELECT reel_post_id, COUNT(*) as likes_count
  FROM reels_likes
  GROUP BY reel_post_id
) like_counts ON rp.id = like_counts.reel_post_id
LEFT JOIN (
  SELECT reel_post_id, COUNT(*) as comments_count
  FROM reels_comments
  GROUP BY reel_post_id
) comment_counts ON rp.id = comment_counts.reel_post_id;

-- منح الصلاحيات للـ views
GRANT SELECT ON news_posts_with_stats TO anon, authenticated;
GRANT SELECT ON reels_posts_with_stats TO anon, authenticated;
