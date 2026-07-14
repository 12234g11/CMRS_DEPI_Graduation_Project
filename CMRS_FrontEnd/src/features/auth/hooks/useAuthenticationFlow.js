import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPostLoginRedirectPath } from '../../../shared/navigation';
import { useAuth } from './useAuth';

function getRequestedPath(locationState) {
  if (!locationState?.from) return undefined;

  if (typeof locationState.from === 'string') {
    return locationState.from;
  }

  return locationState.from.pathname;
}

function getLoginPayload(response) {
  const candidates = [response, response?.data, response?.data?.data];

  return (
    candidates.find((candidate) => candidate?.token && candidate?.user) || null
  );
}

export function useAuthenticationFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const completeAuthentication = useCallback(
    (response) => {
      const loginPayload = getLoginPayload(response);

      if (!loginPayload?.token || !loginPayload?.user) {
        throw new Error('استجابة تسجيل الدخول غير صحيحة من الخادم.');
      }

      const { token, user } = loginPayload;
      const role = String(user.role || '').trim().toLowerCase();

      if (!role) {
        throw new Error('لم يتم تحديد صلاحية المستخدم من الخادم.');
      }

      login({
        token,
        userData: {
          ...user,
          role,
        },
      });

      const redirectPath = getPostLoginRedirectPath({
        role,
        requestedPath: getRequestedPath(location.state),
      });

      navigate(redirectPath, { replace: true });
    },
    [location.state, login, navigate]
  );

  return { completeAuthentication };
}
