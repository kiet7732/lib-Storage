import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { getRoleHomePath } from '@/features/auth/auth.utils';

export default function IndexRoute() {
  const { isHydrating, session } = useAuth();

  if (isHydrating) {
    return null;
  }

  return <Redirect href={session ? getRoleHomePath(session.role) : '/login'} />;
}
