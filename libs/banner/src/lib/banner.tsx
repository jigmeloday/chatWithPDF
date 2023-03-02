import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper';
import { BANNER_DUMMY } from './constant/banner.constnat';
import { Box, Grid } from '@mui/material';
import { theme, Typography } from '@know-me/shared';
import style from './banner.module.scss';

export function Banner(): JSX.Element {
  return (
    <Swiper
      spaceBetween={50}
      modules={ [ Autoplay, Pagination, EffectFade, Navigation ] } effect={ 'fade' }
      slidesPerView={ 1 }
      navigation={true}
      rewind={true}
      autoplay={{ delay: 3000 }}
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
    >
      {
        BANNER_DUMMY.map(({ img, title, subTitle, id }) =>(
          <SwiperSlide>
            {/*<BannerComponent className='banner-component' item container >*/}
            {/*  <Box width='100%' className='landing-cover position--relative'>*/}
            {/*    <img*/}
            {/*      src={img}*/}
            {/*      height='100%'*/}
            {/*      width='100%'*/}
            {/*      className='object-fit--cover '*/}
            {/*    />*/}
            {/*    <Grid item container className='landing-cover__detail'>*/}
            {/*      <Typography label='The UAE’s First Live Shopping Platform'*/}
            {/*                  variant={ 'h2' }/>*/}
            {/*    </Grid>*/}
            {/*  </Box>*/}
            {/*</BannerComponent>*/}
            <Box className={ `${style['landing-cover']} position--relative`}>
              <img height='100%' width='100%' className='object-fit--cover br-8'
                   src={ img } alt='landing cover'/>

              <Grid lg={ 6 } xs={9} className={style['landing-cover__detail']}>
                <Typography label='The UAE’s First Live Shopping Platform'
                            variant={ 'h2' }
                            />
                <Typography label='Introducing the whole new experience of shopping online' variant='body1'
                            fontWeight={ theme('light').typography.fontWeightBold } />
              </Grid>
            </Box>
          </SwiperSlide>
        ))
      }
    </Swiper>
  );
}

export default Banner;
