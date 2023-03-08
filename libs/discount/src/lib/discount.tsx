import { Grid } from '@mui/material';
import { CustomCard } from '@know-me/shared';
import { DISCOUNT_DUMMY } from './constant/discount.constant';

export function Discount():JSX.Element {
  return (
    <Grid container item padding='32px'>
      <Grid item container direction='row' px='26px' py='34px' justifyContent='space-around' >
        {
          DISCOUNT_DUMMY.map(({ discount, url, title, id, bgImage }) => (
            <Grid item container xs={5.9}>
              <CustomCard>
                <Grid item container>
                  <Grid item container xs={5} sx={{ position: 'relative'  }}>
                    <img src={bgImage} className='object-fit--cover'/>
                  </Grid>
                  <Grid item container xs={5} sx={{ position: 'absolute' }}>
                    hello
                  </Grid>
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
