import { Grid } from '@mui/material';
import Input from '../input/input';

export function Header(): JSX.Element {
  return (
    <Grid container item direction='column' px='48px' py='28px'>
      <Grid item container direction='row' px='28px'>
        <Grid item container xs={4}>
          Logo
        </Grid>
        <Grid item container  xs={4} justifyContent='center' >
          <Input />
        </Grid>
        <Grid item container xs={4} justifyContent='end'>
          hello
        </Grid>
      </Grid>
      <Grid item container px='28px'>
hi
      </Grid>
    </Grid>
  );
}

export default Header;
