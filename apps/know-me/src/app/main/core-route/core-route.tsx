import { lazy, memo, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteModel } from '../shared/model/shared.model';

const Auth = lazy(() => import('../pages/auth/auth'));
const Landing = lazy(() => import('../pages/landing/landing'));
function CoreRoute():JSX.Element {
  const isAuthenticated = false;
  const AUTHENTICATED_ROUTE: RouteModel[] = [
    {
      id: '1',
      path: '',
      component: <Landing />
    }
  ];
  const UNAUTHENTICATED_ROUTE: RouteModel[] = [
    {
      id: '1',
      path: '',
      component: <Auth />
    }
  ];

  return (
      <Suspense fallback='loading...'>
        <Routes>
          {
            (isAuthenticated ? AUTHENTICATED_ROUTE : UNAUTHENTICATED_ROUTE).map(({ id, path, component }) =>
              <Route key={`${path}+${id}`} path={path} element={component} />
            )
          }
        </Routes>
      </Suspense>
  );
}

export default memo(CoreRoute);
