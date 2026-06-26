import { useState } from 'react';
import { FiCheck, FiCopy, FiLink, FiX } from 'react-icons/fi';

function AdminCompanyInviteModal({ inviteData, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!inviteData) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="admin-company-modal-backdrop" role="presentation">
      <div className="admin-company-invite-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="admin-company-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <div className="admin-company-invite-modal__icon">
          <FiLink />
        </div>

        <h2>تم إنشاء دعوة تفعيل حساب الشركة</h2>

        <p>
          تم إضافة شركة <strong>{inviteData.company.name}</strong> بنجاح.
          حساب الشركة الآن بانتظار التفعيل.
        </p>

        <div className="admin-company-invite-info">
          <span>إيميل الدخول</span>
          <strong>{inviteData.account.email}</strong>
        </div>

        <div className="admin-company-invite-info">
          <span>تاريخ انتهاء الدعوة</span>
          <strong>{inviteData.invitationExpiresAt}</strong>
        </div>

        <div className="admin-company-invite-link-box">
          <span>{inviteData.inviteUrl}</span>

          <button type="button" onClick={handleCopy}>
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? 'تم النسخ' : 'نسخ الرابط'}
          </button>
        </div>

        <div className="admin-company-invite-warning">
          انسخ الرابط وأرسله للشركة. عند فتح الرابط ستقوم الشركة بتعيين كلمة المرور ثم تسجيل الدخول باستخدام البريد الإلكتروني.
        </div>

        <button
          type="button"
          className="admin-company-invite-close-btn"
          onClick={onClose}
        >
          تم
        </button>
      </div>
    </div>
  );
}

export default AdminCompanyInviteModal;