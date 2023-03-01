import { memo } from 'react';
import { Box, Grid, Menu } from '@mui/material';
import { ProfileMenuProps } from '../model/header.model';
import { Button } from '../../button/button';
import Typography from '../../typography/typography';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import classes from './cart.module.scss';

function CartMenuComponent(props: ProfileMenuProps): JSX.Element {
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
          <Grid item container alignItems='center' direction='row' gap='18px'>
            <Box width='80px' height='80px'>
              <img src='https://images.unsplash.com/photo-1490885578174-acda8905c2c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fGZydWl0c3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
                height='100%' width='100%' className='object-fit--cover'
              />
            </Box>
            <Box width='120px' >
              <Typography label='Pineapple 100% Organic' variant='body1' />
              <Grid item container direction='row' py='8px'>
                <Button variant='outlined' child={  <AddOutlinedIcon /> }  className={classes['button']} />

                <Box padding='2px' height='20px'  className='text--center'  width='26px'>
                  4
                </Box>
                <Button variant='outlined' child={  <RemoveOutlinedIcon /> } className={classes['button']} />
              </Grid>
            </Box>
            <Box>
              <Typography label='4*120' variant='body1' />
            </Box>
          </Grid>
          <Grid item container py='22px' xs={12}>
            <Button variant='outlined' label='View Cart' className='cursor--pointer width--full' />
          </Grid>
        </Grid>
    </Menu>
  );
}

export default memo(CartMenuComponent);
