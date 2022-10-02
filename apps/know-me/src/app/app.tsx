import { store } from '../store/store';
import { Provider } from 'react-redux';
import CoreRoute from './main/core-route/core-route';

export function App(): JSX.Element {
  return (
    <Provider store={store}>
      <CoreRoute />
    </Provider>
    );
}

export default App;
