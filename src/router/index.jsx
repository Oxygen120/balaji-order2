import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import OwnerLayout from '@/layouts/OwnerLayout';

const pageMods = import.meta.glob('/src/pages/**/*.jsx', { eager: true });
const loaders = import.meta.glob('/src/pages/**/*.jsx');
const NotFound = lazy(() => import('@/pages/NotFound'));

const discovered = Object.entries(pageMods)
  .filter(([, module]) => module.route)
  .map(([path, module]) => ({ ...module.route, _component: lazy(loaders[path]) }));

function wrap(Component) {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <Component />
    </Suspense>
  );
}

const routes = discovered.map((route) => {
  const config = {
    element: wrap(route._component),
    handle: { access: route.access ?? 'public' },
  };
  if (route.path === '/') config.index = true;
  else config.path = route.path.replace(/^\//, '');
  return config;
});

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <OwnerLayout />,
      children: [...routes, { path: '*', element: wrap(NotFound) }],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
