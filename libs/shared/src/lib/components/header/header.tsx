import { Badge, Box, Divider, Grid, InputAdornment } from '@mui/material';
import Input from '../input/input';
import Typography from '../typography/typography';
import { theme } from '../../theme/theme';
import styles from './header.module.scss';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { NAVIGATION } from './constant/header.constant';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Link } from 'react-router-dom';

export function Header(props: { img: string }): JSX.Element {
  return (
    <Grid container item>
      <Grid item container xs={12} bgcolor={theme('light').palette.black.dark} py='6px'>
       <Grid item container direction='row' gap='12px' justifyContent='center'>
         <Typography className={styles['blinking']} label='Free shipping' variant='body1'/>
         <Typography label='order from all item' variant='body1' color={theme('light').palette.white.main} />
       </Grid>
      </Grid>
      <Grid item container direction='column' px='48px' py='12px'>
        <Grid item container direction='row' px='28px' pb='12px'>
          <Grid item container xs={4}>
            <Box width='90px' height='60px'>
              <img src={props?.img} className='object-fit' />
            </Box>
          </Grid>
          <Grid item container  xs={4} justifyContent='center' alignItems='center'>
            <Input placeholder='Search our store'
                   variant='outlined'
                   className='width--full custom-search-input'
                   InputProps={ {
                     startAdornment: (
                       <InputAdornment position='end'>
                         <SearchOutlinedIcon />
                       </InputAdornment>
                     ),
                   } }
            />
          </Grid>
          <Grid item container direction='row' xs={4} alignItems='center' justifyContent='end' gap='18px'>
              <Badge badgeContent={4} color='primary' className='cursor--pointer' >
                <ShoppingCartOutlinedIcon fontSize='medium' />
              </Badge>
              <Badge badgeContent={4}  color='primary' className='cursor--pointer'>
                <FavoriteBorderOutlinedIcon fontSize='medium' />
              </Badge>
            <Box pl='22px'>
              <AccountCircleOutlinedIcon fontSize='large' />
            </Box>
          </Grid>
        </Grid>
        <Box px='28px'>
          <Divider />
        </Box>
        <Grid item container direction='row' px='28px' pt='12px'>
          {
            NAVIGATION.map(({ label, id, value }) =>
              <Box px='12px'>
                <Link to={''} className={styles['link']}>{label}</Link>
              </Box>
            )
          }
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Header;
