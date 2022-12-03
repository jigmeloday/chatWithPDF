import { Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { RouteModel } from '../../shared/model/shared.model';

export function Landing():JSX.Element {
  const isAdmin = false;

  const ADMIN: RouteModel[] = [
    {
      id: '1',
      path: '*',
      component: <Landing />
    }
  ];
  const USER: RouteModel[] = [
    {
      id: '1',
      path: '*',
      component: <Landing />
    }
  ];

  return (
    <Suspense fallback='loading...'>
      <Routes>
        {
          (isAdmin ? ADMIN : USER).map(({ id, path, component }) =>
            <Route key={`${path}+${id}`} path={path} element={component} />
          )
        }
      </Routes>
    </Suspense>
  );
}

export default Landing;
