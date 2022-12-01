import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Login = lazy(() => import( '../auth/login/login' ));

export function Auth(): JSX.Element {
  return (
    <Suspense fallback='loading...'>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/sign-up' element={<Login />} />
        <Route path='/forgot-password' element={<Login />} />
        <Route path='*' element={<>page not found</>} />
      </Routes>
    </Suspense>
  );
}

export default Auth;
