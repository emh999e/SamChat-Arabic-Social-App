# دليل النشر والتطوير - سام شات

## 🚀 نشر التطبيق

### 1. إعداد Supabase

#### إنشاء مشروع جديد
1. انتقل إلى [Supabase Dashboard](https://app.supabase.com)
2. انقر على "New Project"
3. اختر اسم المشروع: `samchat-production`
4. اختر كلمة مرور قوية لقاعدة البيانات
5. اختر المنطقة الأقرب لجمهورك

#### إعداد قاعدة البيانات
1. انتقل إلى SQL Editor في لوحة التحكم
2. انسخ محتوى ملف `supabase-schema.sql`
3. شغل الكود لإنشاء الجداول والعلاقات
4. تأكد من تفعيل Row Level Security

#### الحصول على مفاتيح API
1. انتقل إلى Settings > API
2. انسخ:
   - Project URL
   - Anon (public) key
   - Service role (secret) key
3. انتقل إلى Settings > Auth
4. انسخ JWT Secret

### 2. إعداد متغيرات البيئة

#### للتطوير المحلي
```bash
# انسخ ملف الإعدادات النموذجي
cp .env.example .env

# عدل الملف بالقيم الحقيقية
nano .env
```

#### للإنتاج
```bash
# إعدادات Vercel/Netlify
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# إعدادات Heroku/Railway للخادم
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 3. نشر الواجهة الأمامية

#### باستخدام Vercel (مُوصى به)
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر التطبيق
vercel --prod

# إعداد متغيرات البيئة
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
```

#### باستخدام Netlify
```bash
# بناء التطبيق
pnpm run build

# رفع مجلد dist إلى Netlify
# أو ربط مستودع GitHub مع Netlify
```

#### باستخدام GitHub Pages
```bash
# تثبيت gh-pages
pnpm add -D gh-pages

# إضافة scripts في package.json
"predeploy": "pnpm run build",
"deploy": "gh-pages -d dist"

# النشر
pnpm run deploy
```

### 4. نشر الخادم الخلفي

#### باستخدام Heroku
```bash
# تثبيت Heroku CLI
# إنشاء تطبيق جديد
heroku create samchat-api

# إعداد متغيرات البيئة
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
heroku config:set SUPABASE_JWT_SECRET=your-secret

# نشر التطبيق
git subtree push --prefix=arabic-social-backend heroku main
```

#### باستخدام Railway
```bash
# ربط المشروع مع Railway
railway login
railway init
railway add

# إعداد متغيرات البيئة في لوحة التحكم
# النشر التلقائي عند push
```

#### باستخدام DigitalOcean App Platform
1. إنشاء تطبيق جديد من GitHub
2. اختيار مجلد `arabic-social-backend`
3. إعداد متغيرات البيئة
4. النشر التلقائي

### 5. إعداد النطاق المخصص

#### للواجهة الأمامية
```bash
# في Vercel
vercel domains add samchat.app
vercel domains add www.samchat.app

# إعداد DNS records
# A record: @ -> Vercel IP
# CNAME: www -> alias.vercel.app
```

#### للخادم الخلفي
```bash
# إعداد subdomain
# CNAME: api -> your-backend-url
```

### 6. إعداد HTTPS والأمان

#### SSL Certificate
- Vercel/Netlify: تلقائي
- Heroku: تلقائي للنطاقات المخصصة
- DigitalOcean: تلقائي

#### إعدادات الأمان
```javascript
// في Supabase Auth settings
{
  "site_url": "https://samchat.app",
  "redirect_urls": [
    "https://samchat.app/**",
    "https://www.samchat.app/**"
  ]
}
```

### 7. مراقبة الأداء

#### Supabase Analytics
- مراقبة استخدام قاعدة البيانات
- تتبع الاستعلامات البطيئة
- مراقبة المصادقة

#### Vercel Analytics
```bash
# تفعيل Analytics
vercel analytics enable
```

#### إعداد Monitoring
```javascript
// Sentry للأخطاء
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

## 🔧 التطوير المحلي

### إعداد البيئة
```bash
# استنساخ المشروع
git clone https://github.com/your-username/samchat.git
cd samchat

# تثبيت تبعيات الواجهة الأمامية
pnpm install

# إعداد الخادم الخلفي
cd arabic-social-backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### تشغيل التطوير
```bash
# تشغيل الواجهة الأمامية (Terminal 1)
pnpm run dev

# تشغيل الخادم الخلفي (Terminal 2)
cd arabic-social-backend
source venv/bin/activate
python src/main.py
```

### اختبار التطبيق
```bash
# اختبارات الواجهة الأمامية
pnpm run test

# اختبارات الخادم الخلفي
cd arabic-social-backend
python -m pytest tests/
```

## 📊 مراقبة الإنتاج

### مؤشرات الأداء الرئيسية
- **وقت التحميل**: < 3 ثواني
- **معدل الاستجابة**: > 99.9%
- **استخدام قاعدة البيانات**: < 80%
- **معدل الأخطاء**: < 0.1%

### أدوات المراقبة
- **Supabase Dashboard**: مراقبة قاعدة البيانات
- **Vercel Analytics**: مراقبة الواجهة الأمامية
- **Sentry**: تتبع الأخطاء
- **Google Analytics**: تحليل المستخدمين

### النسخ الاحتياطي
```sql
-- نسخ احتياطي يومي لقاعدة البيانات
-- يتم تلقائياً في Supabase
-- يمكن تصدير البيانات عبر Dashboard
```

## 🔄 التحديثات والصيانة

### تحديث التبعيات
```bash
# تحديث تبعيات Node.js
pnpm update

# تحديث تبعيات Python
pip list --outdated
pip install --upgrade package-name
```

### نشر التحديثات
```bash
# للواجهة الأمامية (Vercel)
git push origin main  # نشر تلقائي

# للخادم الخلفي (Heroku)
git push heroku main
```

### صيانة قاعدة البيانات
```sql
-- تنظيف البيانات القديمة
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

-- إعادة فهرسة الجداول
REINDEX TABLE posts;
REINDEX TABLE profiles;
```

## 🚨 استكشاف الأخطاء

### مشاكل شائعة

#### خطأ CORS
```javascript
// في Flask app
from flask_cors import CORS
CORS(app, origins=['https://samchat.app'])
```

#### مشاكل المصادقة
```javascript
// التحقق من صحة JWT
const { data: user } = await supabase.auth.getUser()
if (!user) {
  // إعادة توجيه لصفحة تسجيل الدخول
}
```

#### بطء الاستعلامات
```sql
-- إضافة فهارس جديدة
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
```

### سجلات الأخطاء
```bash
# عرض سجلات Vercel
vercel logs

# عرض سجلات Heroku
heroku logs --tail

# عرض سجلات Supabase
# من Dashboard > Logs
```

---

**ملاحظة**: تأكد من اختبار جميع الميزات في بيئة التطوير قبل النشر للإنتاج.
