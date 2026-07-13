# ملاحظات ومتطلبات الباك لفلو بلاغات الشركة

## Endpoints المستخدمة في النسخة الحالية

```http
GET    /api/company/reports
GET    /api/company/reports/{reportId}
GET    /api/company/reports/options
GET    /api/company/teams
PATCH  /api/company/reports/{reportId}/assign-team
PATCH  /api/company/reports/{reportId}/start-work
POST   /api/company/reports/{reportId}/solution
POST   /api/company/reports/{reportId}/cannot-fix
```

## 1. أعداد التفاعل المجتمعي

صفحة تفاصيل البلاغ مرتبطة بالقيم الراجعة مباشرة داخل استجابة:

```http
GET /api/company/reports/{reportId}
```

```json
{
  "followersCount": 0,
  "upvoteCount": 0,
  "downvoteCount": 0
}
```

الربط المستخدم في الفرونت:

- عدد المتابعين ← `followersCount`.
- عدد المصدقين ← `upvoteCount`.
- عدد المكذبين ← `downvoteCount`.

في حالة عدم وجود إحدى القيم أو رجوعها بقيمة غير صالحة، يعرض الفرونت `0` بدلًا من الشرطة أو كسر الواجهة.

## 2. صور رد الشركة

لا يرسل الفرونت أي صور عند تنفيذ:

```http
PATCH /api/company/reports/{reportId}/start-work
```

طلب بدء أو استئناف التنفيذ يرسل الملاحظة الاختيارية فقط. الصور تُرسل حصريًا في الحالتين التاليتين:

```http
POST /api/company/reports/{reportId}/solution
POST /api/company/reports/{reportId}/cannot-fix
```

ويتم إرسالها داخل `multipart/form-data` بالحقل `images`.

## 3. فرق الصيانة

تم ربط اختيار وتغيير فرقة الصيانة باستخدام:

```http
GET /api/company/teams
PATCH /api/company/reports/{reportId}/assign-team
```

الـ request المستخدم في التعيين:

```json
{
  "TeamId": "team-guid"
}
```

الفرونت يمنع بدء التنفيذ قبل اختيار فرقة صيانة، ويمنع اختيار الفريق غير المفعّل أو الذي وصل إلى سعته القصوى. يجب أن يظل الباك أيضًا متحققًا من:

- أن `TeamId` موجود وصحيح.
- أن البلاغ مسند للشركة الحالية.
- أن الفريق المختار تابع لنفس الشركة.
- أن الفريق مفعّل (`status != Disabled` و `isEnabled != false`).
- أن الفريق لم يصل إلى الحد الأقصى للبلاغات النشطة (`activeTasks < maxCapacity`).

وفي حالة عدم صلاحية الفريق يرجع الباك `400 Bad Request` برسالة واضحة، مثل:

```json
{
  "success": false,
  "message": "لا يمكن تعيين البلاغ إلى فريق غير مفعّل."
}
```

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
