# GP101 — مرجع الطبيب العام

موقع ويب احترافي مبني على محتوى Notion الخاص بـ GP101، مع نظام اشتراكات وتحكم في الأجهزة.

---

## ✨ المميزات

- 🔐 نظام تسجيل دخول بـ Email + Password
- 📱 قيود الأجهزة (3 أجهزة لكل مستخدم)
- 🌐 يعمل أوفلاين (Service Worker + Cache)
- 📝 ملاحظات شخصية لكل مستخدم على كل موضوع
- 🛠 لوحة تحكم Admin كاملة
- 📋 291 موضوع طبي منظم

---

## 🚀 التشغيل

### 1. المتطلبات
- Node.js 18+
- PostgreSQL

### 2. التثبيت

```bash
cd gp101-app
npm install
```

### 3. إعداد البيئة

```bash
cp .env.example .env
```

عدّل `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gp101db"
JWT_SECRET="any-long-random-string-min-32-characters"
```

### 4. قاعدة البيانات

```bash
# إنشاء الجداول
npm run db:push

# إنشاء حساب Admin
npm run db:seed
```

بيانات الـ Admin الافتراضية:
- Email: `admin@gp101.com`
- Password: `admin123`
- **⚠️ غيّر الباسورد من لوحة التحكم!**

### 5. التشغيل

```bash
# تطوير
npm run dev

# إنتاج
npm run build
npm start
```

---

## 📁 هيكل المشروع

```
gp101-app/
├── data/
│   └── content.json          # كل محتوى GP101 (291 موضوع)
├── prisma/
│   ├── schema.prisma         # نموذج قاعدة البيانات
│   └── seed.ts               # إنشاء Admin
├── public/
│   └── sw.js                 # Service Worker للأوفلاين
├── src/
│   ├── middleware.ts         # حماية الصفحات
│   ├── lib/
│   │   ├── auth.ts           # JWT helpers
│   │   ├── db.ts             # Prisma client
│   │   └── content.ts        # قراءة المحتوى
│   ├── app/
│   │   ├── login/            # صفحة الدخول
│   │   ├── content/[slug]/   # صفحة الموضوع
│   │   ├── admin/            # لوحة التحكم
│   │   └── api/              # API routes
│   └── components/
│       ├── Sidebar.tsx       # الشريط الجانبي
│       ├── ContentView.tsx   # عرض المحتوى
│       ├── NotesPanel.tsx    # الملاحظات
│       └── OnlineStatus.tsx  # حالة الاتصال
```

---

## 🗄️ قاعدة البيانات

```sql
User       -- المستخدمون (email, password, isActive, expiresAt)
Device     -- الأجهزة (fingerprint, userAgent) - max 3 per user
Note       -- الملاحظات (userId, topicSlug, content)
```

---

## 👨‍💼 لوحة التحكم

الدخول على `/admin` بحساب Admin:

- **إحصائيات**: عدد المشتركين، النشطون، المنتهية اشتراكاتهم
- **إدارة المستخدمين**: إضافة / إيقاف / حذف / تجديد الاشتراك
- **إدارة الأجهزة**: مشاهدة الأجهزة المسجلة وعمل Reset

---

## 🌐 الرفع على Vercel

```bash
# ثبّت Vercel CLI
npm i -g vercel

# ارفع المشروع
vercel

# أضف Environment Variables في Vercel Dashboard:
# DATABASE_URL, JWT_SECRET
```

**ملاحظة**: استخدم Supabase أو Neon للـ PostgreSQL على Vercel (مجانًا).

---

## 🔧 إضافة محتوى جديد

عدّل ملف `data/content.json` مباشرة:

```json
{
  "sections": [
    {
      "name": "Medicine الباطنه",
      "subsections": [
        {
          "name": "ER approach",
          "topics": [
            {
              "title": "موضوع جديد",
              "slug": "new-topic-slug",
              "content": "# محتوى الموضوع بـ Markdown"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 📞 الدعم الفني

للمشاكل التقنية، تحقق من:
1. صح الـ `DATABASE_URL`
2. `npm run db:push` شغّالة بدون أخطاء
3. الـ `JWT_SECRET` أطول من 32 حرف
