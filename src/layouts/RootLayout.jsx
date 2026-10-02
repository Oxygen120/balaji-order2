import { Outlet } from 'react-router-dom';
import { verifyRouteAccess } from '@/router/route.utils';
import AppLoader from '@/components/AppLoader';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function RootLayout() {
  const allowed = verifyRouteAccess('public', null);
  if (!allowed) return <AppLoader fullScreen />;
  return (
    <ErrorBoundary fullPage>
      <Outlet />
    </ErrorBoundary>
  );
}
