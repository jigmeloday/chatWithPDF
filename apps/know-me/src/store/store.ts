import { combineReducers, configureStore } from '@reduxjs/toolkit';
import persistStore  from 'redux-persist/es/persistStore';
import { Persistor, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

interface Reducer {
  name: string
}

const REDUCER = combineReducers({

});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [  ]
};

const PERSISTED_REDUCER = persistReducer(persistConfig, REDUCER);

export const store = configureStore({
  reducer: { PERSISTED_REDUCER },
  middleware: ( getDefaultMiddleware ) => getDefaultMiddleware( {
    serializableCheck: false
  } ),
});
export const persistor: Persistor = persistStore( store );
