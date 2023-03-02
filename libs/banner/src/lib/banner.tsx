import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, EffectFade, Navigation, Pagination, Scrollbar } from 'swiper';
import { BANNER_DUMMY } from './constant/banner.constnat';
import { Box, Grid } from '@mui/material';
import { BannerComponent } from './banner.style';


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
            <BannerComponent className='banner-component' item container >
              <Box width='100%' className='position--relative'>
                <img
                  src={img}
                  height='100%'
                  width='100%'
                  className='object-fit--cover '
                />
                <Grid item container className='banner-detail'>
                  xccxcasdfasfdasfsadfasdfasdf
                </Grid>
              </Box>
            </BannerComponent>
          </SwiperSlide>
        ))
      }
    </Swiper>
  );
}

export default Banner;
