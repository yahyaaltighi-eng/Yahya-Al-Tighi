# 🚀 منظومة الجداول الذكية V3.1.1 (Production Ready)

هذا المشروع هو خادم سحابي مبني على **FastAPI** و **Google OR-Tools**، مصمم لحل مشكلة جداول الحصص المدرسية باستخدام التحسين الهرمي (Hierarchical Optimization).

## 🛠 التشغيل المحلي (Local Testing)
1. قم بتثبيت Python 3.11.
2. افتح موجه الأوامر (Terminal) في مجلد المشروع ونفذ:
   ```bash
   pip install -r requirements.txt
   python main.py
   ```
سيعمل الخادم على http://localhost:8000.

افتح ملف index.html في متصفحك مباشرة. اضغط على زر "توليد الجدول الآن".

☁️ النشر السحابي (Render Deployment)
ارفع جميع الملفات (باستثناء HTML/CSS/JS) إلى مستودع GitHub.

في منصة Render.com، قم بإنشاء Web Service جديد.

اربط المستودع، واستخدم الإعدادات التالية:

Environment: Python 3

Build Command: pip install -r requirements.txt

Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT

انسخ الرابط الناتج من Render، وضعه داخل ملف app.js في السطر: fetch('رابط_رندر/api/generate').

🧪 حالات الاختبار المدعومة في sample_payload.json
SUCCESS (النجاح): شغل الـ Payload كما هو. ستلاحظ توزيع الـ 8 حصص رياضيات بين أحمد ومحمود، دون إسناد أي حصة لأحمد يوم الخميس.

Split Assignment: تفقد top_solutions[0].timetables ستجد الرياضيات يدرسها t1 و t2 لنفس الفصل.

INFEASIBLE & Diagnostics: قم بتغيير maxLoad للمعلم أحمد t1 إلى 2 فقط، واضغط توليد. سيظهر تقرير diagnostics يخبرك بعجز النصاب!
