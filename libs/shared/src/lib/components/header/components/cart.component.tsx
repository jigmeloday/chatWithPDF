import { memo, useState } from 'react';
import { Box, Grid, Menu } from '@mui/material';
import { ProfileMenuProps } from '../model/header.model';
import { Button } from '../../button/button';
import Typography from '../../typography/typography';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import classes from './cart.module.scss';
import { theme } from '../../../theme/theme';

function CartMenuComponent(props: ProfileMenuProps): JSX.Element {
  const [count, setCount] = useState(1);
  return(
      <Menu
      anchorEl={props.anchorEl}
      id="account-menu"
      open={!!props.anchorEl}
      onClose={props.handleClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
        <Grid item container direction='column' px='24px'>
          <Grid item container alignItems='center' direction='row' gap='18px' my='12px'>
            <Grid item container xs={3}>
              <Box width='80px' height='80px'>
                <img src='https://images.unsplash.com/photo-1490885578174-acda8905c2c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fGZydWl0c3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
                     height='100%' width='100%' className='object-fit--cover'
                />
              </Box>
            </Grid>
            <Grid item container xs={3}>
              <Typography label='Pineapple 100% Organic' fontWeight='400' variant='subtitle2' />
              <Grid item container direction='row' py='8px'>
                <Button variant='outlined' child={  <AddOutlinedIcon /> }  className={classes['button']} click={():void => setCount(count+1)} />

                <Box padding='2px' height='20px'  className='text--center'  width='26px'>
                  {count}
                </Box>
                <Button variant='outlined'
                        child={  <RemoveOutlinedIcon /> } className={classes['button']} click={():void => setCount(count-1)}/>
              </Grid>
            </Grid>
            <Grid item container xs={3} alignItems='center' direction='column'>
              <Typography label={ `Nu.${120 * count}`} variant='body1'  color='primary'/>
              <Box mt='20px' padding='8px' >
                <Typography label='Remove' variant='body1'
                            className='cursor--pointer'
                            color={theme('light').palette.black.contrastText}/>
              </Box>
            </Grid>
          </Grid>

          <Grid item container py='22px' xs={12}>
            <Button variant='outlined' label='View Cart' className='cursor--pointer width--full' />
          </Grid>
        </Grid>
    </Menu>
  );
}

export default memo(CartMenuComponent);
