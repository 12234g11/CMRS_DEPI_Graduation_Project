const GENERIC_VALIDATION_MESSAGES = new Set([
  'Validation failed.',
  'Validation failed',
  'One or more validation errors occurred.',
]);

export function addUniqueMessage(messages, message) {
  const normalizedMessage = String(message || '')
    .replace(/^\s*[-•]\s*/, '')
    .trim();

  if (normalizedMessage && !messages.includes(normalizedMessage)) {
    messages.push(normalizedMessage);
  }
}

function collectMessages(value, messages) {
  if (!value) return;

  if (Array.isArray(value)) {
    value.forEach((item) => collectMessages(item, messages));
    return;
  }

  if (typeof value === 'object') {
    Object.values(value).forEach((item) => collectMessages(item, messages));
    return;
  }

  String(value)
    .split(/\r?\n|\\r?\\n/)
    .forEach((item) => addUniqueMessage(messages, item));
}

function parsePossibleJson(value) {
  if (typeof value !== 'string') return null;

  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('[')) {
    return null;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return null;
  }
}

export function getApiErrorMessages(
  error,
  fallbackMessage = 'حدث خطأ غير متوقع. حاول مرة أخرى.'
) {
  const messages = [];
  const responseData = error?.response?.data;
  const directData = error?.data;

  collectMessages(responseData?.errors, messages);
  collectMessages(directData?.errors, messages);
  collectMessages(error?.errors, messages);

  const parsedErrorMessage = parsePossibleJson(error?.message);
  if (parsedErrorMessage) {
    collectMessages(parsedErrorMessage?.errors || parsedErrorMessage, messages);
  }

  if (messages.length === 0) {
    collectMessages(responseData?.message, messages);
    collectMessages(directData?.message, messages);
    collectMessages(error?.message, messages);
  }

  const usefulMessages = messages.filter(
    (message) => !GENERIC_VALIDATION_MESSAGES.has(message)
  );

  return usefulMessages.length > 0 ? usefulMessages : [fallbackMessage];
}

export function validateEmail(value, options = {}) {
  const {
    requiredMessage = 'البريد الإلكتروني مطلوب.',
    invalidMessage = 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.com.',
  } = options;
  const errors = [];
  const email = String(value || '').trim();

  if (!email) {
    errors.push(requiredMessage);
    return errors;
  }

  if (email.length > 254) {
    errors.push('البريد الإلكتروني طويل جدًا.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.push(invalidMessage);
  }

  return errors;
}

export function validatePassword(value, options = {}) {
  const {
    label = 'كلمة المرور',
    strong = true,
    requiredMessage = `${label} مطلوبة.`,
  } = options;
  const errors = [];
  const password = String(value || '');

  if (!password) {
    errors.push(requiredMessage);
    return errors;
  }

  if (password.length > 100) {
    errors.push(`${label} يجب ألا تزيد على 100 حرف.`);
  }

  if (!strong) {
    return errors;
  }

  if (password.length < 8) {
    errors.push(`${label} يجب ألا تقل عن 8 أحرف.`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(`${label} يجب أن تحتوي على حرف إنجليزي صغير واحد على الأقل.`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(`${label} يجب أن تحتوي على حرف إنجليزي كبير واحد على الأقل.`);
  }

  if (!/\d/.test(password)) {
    errors.push(`${label} يجب أن تحتوي على رقم واحد على الأقل.`);
  }

  if (!/[^A-Za-z0-9\s]/.test(password)) {
    errors.push(`${label} يجب أن تحتوي على رمز خاص واحد على الأقل، مثل @ أو #.`);
  }

  if (/\s/.test(password)) {
    errors.push(`${label} يجب ألا تحتوي على مسافات.`);
  }

  return errors;
}

export function validatePasswordConfirmation(password, confirmation) {
  const errors = [];

  if (!confirmation) {
    errors.push('تأكيد كلمة المرور مطلوب.');
  } else if (password !== confirmation) {
    errors.push('كلمة المرور وتأكيدها غير متطابقين.');
  }

  return errors;
}

export function normalizeArabicDigits(value) {
  return String(value || '')
    .replace(/[٠-٩]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit));
}

export function normalizePhoneForValidation(value) {
  return normalizeArabicDigits(value).replace(/[\s()+-]/g, '');
}

export function validateEgyptianMobile(value) {
  const errors = [];
  const rawPhone = String(value || '').trim();
  const phone = normalizePhoneForValidation(value);

  if (!rawPhone) {
    errors.push('رقم الهاتف مطلوب.');
  } else if (!/^01[0125]\d{8}$/.test(phone)) {
    errors.push(
      'رقم الهاتف يجب أن يكون رقم موبايل مصريًا صحيحًا مكوّنًا من 11 رقمًا.'
    );
  }

  return errors;
}

export function validateFullName(value) {
  const errors = [];
  const fullName = String(value || '').trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);

  if (!fullName) {
    errors.push('الاسم الكامل مطلوب.');
    return errors;
  }

  if (fullName.length < 3) {
    errors.push('الاسم الكامل يجب ألا يقل عن 3 أحرف.');
  }

  if (fullName.length > 100) {
    errors.push('الاسم الكامل يجب ألا يزيد على 100 حرف.');
  }

  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(fullName)) {
    errors.push(
      'الاسم الكامل يجب أن يحتوي على حروف فقط دون أرقام أو رموز غير مناسبة.'
    );
  }

  if (nameParts.length < 2) {
    errors.push('اكتب الاسم الكامل مكوّنًا من اسمين على الأقل.');
  }

  return errors;
}
