# متطلبات بيانات رد الشركة في تفاصيل بلاغ الأدمن

واجهة الأدمن أصبحت تدعم عرض نوع الرد، سبب التعذر، التفاصيل، الصور، وحالة المراجعة. لكي تظهر البيانات الفعلية يجب أن يرجع Endpoint تفاصيل البلاغ البيانات التالية داخل `companyResponse`:

```json
{
  "companyResponse": {
    "id": "response-id",
    "type": "cannot_fix",
    "typeLabel": "متعذر التنفيذ",
    "status": "PendingAdminApproval",
    "statusLabel": "بانتظار مراجعة الأدمن",
    "reviewStatus": "Pending",
    "reviewLabel": "بانتظار مراجعة الأدمن",
    "companyName": "اسم الشركة",
    "submittedAt": "2026-07-11T23:39:16.3836178+03:00",
    "reason": "سبب التعذر المختصر",
    "note": "التفاصيل الكاملة التي أرسلتها الشركة",
    "adminNote": null,
    "images": [
      "/uploads/company-proof-1.webp"
    ]
  }
}
```

القيم المتوقعة في `type`:

- `cannot_fix`: تعذر أو اعتذار عن التنفيذ.
- `fixed`: إرسال الحل وصور ما بعد التنفيذ.
- `started`: بدء التنفيذ أو إرسال دليل بداية العمل.

`PendingAdminApproval` هي حالة البلاغ وليست نوع رد الشركة، لذلك يجب عدم استخدامها بدل `type`.

الفرونت يدعم أيضًا مؤقتًا أسماء بديلة مثل:

- `responseType`
- `companyResponseType`
- `cannotFixReason`
- `companyResponseNote`
- `attachments`
- `proofImages`

لكن الشكل الأساسي أعلاه هو الأفضل لتوحيد الربط.
