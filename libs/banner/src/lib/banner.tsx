import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, EffectFade, Navigation, Pagination, Scrollbar } from 'swiper';


export function Banner(): JSX.Element {
  return (
    <Swiper
      spaceBetween={50}
      modules={ [ Autoplay, Pagination, EffectFade ] } effect={ 'fade' }
      slidesPerView={ 1 }
      autoplay={{ delay: 1000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
    >
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
      <SwiperSlide>Slide 3</SwiperSlide>
      <SwiperSlide>Slide 4</SwiperSlide>
    </Swiper>
  );
}

export default Banner;
