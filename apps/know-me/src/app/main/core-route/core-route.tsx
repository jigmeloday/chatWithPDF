import { lazy, memo, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteModel } from '../shared/model/shared.model';
import { Header } from '@know-me/shared';

const Landing = lazy(() => import('../pages/landing/landing'));
function CoreRoute():JSX.Element {
  const AUTHENTICATED_ROUTE: RouteModel[] = [
    {
      id: '1',
      path: '*',
      component: <Landing />
    }
  ];

  return (
      <Suspense fallback='loading...'>
        <Header />
        <Routes>
          {
            (AUTHENTICATED_ROUTE ).map(({ id, path, component }) =>
              <Route key={`${path}+${id}`} path={path} element={component} />
            )
          }
        </Routes>
      </Suspense>
  );
}

export default memo(CoreRoute);
