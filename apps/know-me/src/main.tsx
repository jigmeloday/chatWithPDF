import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css';
import { BrowserRouter } from 'react-router-dom';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { store } from '@know-me/services';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(
  document.getElementById( 'root' ) as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={ store }>
        <App/>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
