import style from '../banner.module.scss';
import { Box, Grid } from '@mui/material';
import { Button, theme, Typography } from '@know-me/shared';
import { memo } from 'react';
import { BannerModel } from '../model/banner.model';

function BannerPreviewComponent(props: { items: BannerModel }): JSX.Element {
  return(
      <Box className={ `${style['landing-cover']} position--relative`}>
        <img height='100%' width='100%' className='object-fit--cover br-8'
             src={ props.items.img } alt='landing cover'/>

          <Grid container item className={style['landing-cover__detail']}>
              <Box width='324px'>
                <Typography label={props?.items?.title}
                            variant='h4'
                />
                <Typography label={props?.items?.subTitle} variant='h2'
                            fontWeight={ theme('light').typography.fontWeightBold } />
                <Box py='18px'>
                  <Button variant='contained' label='Shop' />
                </Box>
              </Box>
          </Grid>
      </Box>
  );
}

export default memo(BannerPreviewComponent);
