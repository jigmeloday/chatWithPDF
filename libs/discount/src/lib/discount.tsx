import { Grid } from '@mui/material';
import { CustomCard } from '@know-me/shared';
import { DISCOUNT_DUMMY } from './constant/discount.constant';

export function Discount():JSX.Element {
  return (
    <Grid container item padding='32px'>
      <Grid item container direction='row' px='26px' py='14px' gap='12px' justifyContent='space-around'>
        {
          DISCOUNT_DUMMY.map(({ discount, url, title, id, bgImage }) => (
            <Grid item container xs={5}>
              <CustomCard>
                <Grid item container xs={5}>
                  <img src={bgImage}  className='object-fit'/>
                </Grid>
              </CustomCard>
            </Grid>
          ))
        }
      </Grid>
    </Grid>
  );
}

export default Discount;
