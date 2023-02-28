import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Login = lazy(() => import( '../auth/login/login' ));
const SignUp = lazy(() => import('../auth/sign-up/sign-up'));
const PageNotFound = lazy( () => import('../page-not-found/page-not-found') );
const ForgotPassword = lazy(() => import( '../auth/forgot-password/forgot-password' ));
export function Auth(): JSX.Element {
  return (
    <Suspense fallback='loading...'>
      <Routes>
        <Route path='/' element={<Login />} />
        {/*<Route path='/sign-up' element={<SignUp />} />*/}
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}

export default Auth;
