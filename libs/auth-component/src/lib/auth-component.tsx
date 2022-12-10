import { Grid } from '@mui/material';
import LoginComponent from './login/login';
import SignUp from './sign-up/sign-up';

export function AuthComponent():JSX.Element {
  return (
   <div>
     <LoginComponent />
     <SignUp/>
   </div>
  );
}

export default AuthComponent;
