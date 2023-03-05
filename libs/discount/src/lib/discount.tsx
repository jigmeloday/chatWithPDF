import { Grid } from '@mui/material';
import { CustomCard } from '@know-me/shared';
import { DISCOUNT_DUMMY } from './constant/discount.constant';

export function Discount():JSX.Element {
  return (
    <Grid container item padding='32px'>
      <Grid item container direction='row' px='26px' py='14px' justifyContent='space-around'>
        {
          DISCOUNT_DUMMY.map(({ discount, url, title, id, bgImage }) => (
            <CustomCard>
              <Grid>
                hello
              </Grid>
              </CustomCard>
          ))
        }
      </Grid>
    </Grid>
  );
}

export default Discount;
