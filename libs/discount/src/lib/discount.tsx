import { Grid } from '@mui/material';
import { Card } from '@know-me/shared';
import { DISCOUNT_DUMMY } from './constant/discount.constant';

export function Discount():JSX.Element {
  return (
    <Grid container item padding='32px'>
      <Grid item container direction='row' px='26px' py='14px'>
        {
          DISCOUNT_DUMMY.map(({ discount, url, title, id, bgImage }) => (
            <Card />
          ))
        }
      </Grid>
    </Grid>
  );
}

export default Discount;
