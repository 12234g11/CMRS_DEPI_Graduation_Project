# ملاحظات ومتطلبات الباك لفلو بلاغات الشركة

## Endpoints المستخدمة في النسخة الحالية

```http
GET    /api/company/reports
GET    /api/company/reports/{reportId}
GET    /api/company/reports/options
GET    /api/company/teams
PATCH  /api/company/reports/{reportId}/assign-team
PATCH  /api/company/reports/{reportId}/start-work
POST   /api/company/reports/{reportId}/proof
POST   /api/company/reports/{reportId}/solution
POST   /api/company/reports/{reportId}/cannot-fix
```

## 1. أعداد التفاعل المجتمعي

صفحة تفاصيل البلاغ تعرض حاليًا 3 كروت بقيم مؤقتة `—`:

- عدد المتابعين.
- عدد المصدقين على البلاغ.
- عدد المكذبين للبلاغ.

شكل مقترح لإضافتها مستقبلًا داخل استجابة:

```http
GET /api/company/reports/{reportId}
```

```json
{
  "communityStats": {
    "followersCount": 0,
    "verifiedCount": 0,
    "rejectedCount": 0
  }
}
```

الكروت غير متصلة بأي field أو endpoint في النسخة الحالية تنفيذًا للطلب.

## 2. صور تقدم وبداية التنفيذ

تم ربط endpoint الموجود حاليًا:

```http
POST /api/company/reports/{reportId}/proof
```

وهو يرفع صورة واحدة في كل request ويرجع:

```json
{
  "imageUrl": "/uploads/proof.webp"
}
```

الفرونت يرسل كل صورة بشكل منفصل بعد نجاح `start-work`، ويعرض الصور فورًا داخل قسم **صور المعاينة وبداية التنفيذ**. كما يحتفظ بتصنيف الروابط مؤقتًا في LocalStorage على نفس الجهاز حتى لا تختلط مباشرة بصور البلاغ الأصلية.

لكن الحل النهائي الصحيح من الباك هو أن ترجع استجابة تفاصيل البلاغ field منفصلًا:

```json
{
  "progressImages": [
    "/uploads/proof-1.webp",
    "/uploads/proof-2.webp"
  ]
}
```

الـ frontend يدعم حاليًا أي اسم من الأسماء التالية:

```txt
progressImages
proofImages
executionProofImages
```

لو الباك يضيف صور proof إلى `images` فقط، فلن يمكن تمييزها بشكل دائم كصور بداية تنفيذ على جهاز آخر أو بعد مسح LocalStorage.

بديل آخر: تعديل endpoint الرفع ليستقبل نوع الصورة:

```txt
image = file
proofType = StartWork
```

## 3. فرق الصيانة

تم ربط اختيار وتغيير فرقة الصيانة باستخدام:

```http
GET /api/company/teams
PATCH /api/company/reports/{reportId}/assign-team
```

الفرونت يمنع بدء التنفيذ قبل اختيار فرقة صيانة. يجب أن يظل الباك أيضًا متحققًا من:

- أن البلاغ مسند للشركة الحالية.
- أن الفريق المختار تابع لنفس الشركة.
- أن الفريق متاح للتعيين إذا كان عندكم validation للحالة.

## 4. توحيد قيم الحالة

الفرونت يدعم القيم العربية والقيم الإنجليزية التالية ويحوّلها تلقائيًا:

```txt
Assigned / Accepted        => تم التعيين
InProgress / Started       => جاري التنفيذ
PendingAdminApproval       => بانتظار مراجعة الأدمن
NeedsCompletion / Rejected => مطلوب استكمال
CannotFix                  => متعذر التنفيذ
Resolved / Completed       => تم الحل
```

تمت إضافة هذا التحويل لأن الباك أعاد في بعض الحالات قيمة مثل `Accepted` بدل النص العربي. مع ذلك الأفضل أن يلتزم الباك بشكل ثابت بالقيم المتفق عليها داخل `CompanyReportDTO` حتى لا تختلف الفلاتر عن التفاصيل.

## 5. دقة التوقيت بتوقيت مصر

الفرونت يحوّل أي تاريخ ISO صالح إلى المنطقة الزمنية:

```txt
Africa/Cairo
```

لضمان الدقة يجب أن يرسل الباك التواريخ بصيغة ISO 8601 وبداخلها معلومات الـ timezone، والأفضل UTC مع `Z`:

```json
{
  "assignedAt": "2026-07-11T18:30:00Z",
  "companyResponse": {
    "submittedAt": "2026-07-11T19:15:00Z"
  },
  "adminReview": {
    "reviewedAt": "2026-07-11T20:00:00Z"
  },
  "timeline": [
    {
      "date": "2026-07-11T18:30:00Z"
    }
  ]
}
```

لو الباك أرسل نصًا جاهزًا مثل `2026-05-02 - 10:30 AM` فلن يكون داخله timezone يمكن الاعتماد عليه، لذلك سيعرضه الفرونت كما وصل بدون تحويل قد ينتج عنه وقت خاطئ.

## 6. الخريطة داخل صفحة البلاغات المدمجة

لا تحتاج الخريطة إلى endpoint جديد. هي تستخدم نفس الاستجابة المصفحة من:

```http
GET /api/company/reports?page=1&pageSize=10
```

كل عنصر داخل `items` يجب أن يحتوي على إحداثيات صالحة:

```json
{
  "id": "report-guid",
  "position": {
    "lat": 30.05,
    "lng": 31.23
  }
}
```

الفرونت يدعم أيضًا `latitude` و`longitude` كبدائل، لكن الشكل الأفضل والثابت هو `position.lat` و`position.lng`.

الخريطة تعرض نفس بلاغات الصفحة الحالية فقط، لذلك تغيير صفحة الـ pagination يحدّث الخريطة والجدول معًا بدون طلب API إضافي.
