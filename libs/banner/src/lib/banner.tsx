import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper';
import { BANNER_DUMMY } from './constant/banner.constnat';
import { Box, Grid } from '@mui/material';
import { theme, Typography } from '@know-me/shared';
import style from './banner.module.scss';
import BannerPreviewComponent from './component/banner-preview.component';

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
        BANNER_DUMMY.map((banner) =>(
          <SwiperSlide key={banner.id}>
              <BannerPreviewComponent items={banner} />
          </SwiperSlide>
        ))
      }
    </Swiper>
  );
}

export default Banner;
