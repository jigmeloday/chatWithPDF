import { CombinedState, combineReducers, configureStore, Reducer } from '@reduxjs/toolkit';
import persistStore  from 'redux-persist/es/persistStore';
import { Persistor, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { COMMON_STATE_KEY, commonReducer, CommonStateInterface } from '@know-me/shared';

export interface IReducer {
  [ COMMON_STATE_KEY ]: CommonStateInterface
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [  ]
};

const REDUCER: Reducer<CombinedState<IReducer>> = combineReducers({
  [ COMMON_STATE_KEY ] : commonReducer
});



const PERSISTED_REDUCER = persistReducer(persistConfig, REDUCER);

export const store = configureStore({
  reducer: PERSISTED_REDUCER,
  middleware: ( getDefaultMiddleware ) => getDefaultMiddleware( {
    serializableCheck: false
  } ),
});
export const persistor: Persistor = persistStore( store );
