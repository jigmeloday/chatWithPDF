import { createSelector, createSlice } from '@reduxjs/toolkit';
import { setTheme } from './common-state.action';

export const COMMON_STATE_KEY = 'common';

export interface CommonStateInterface {
  currentTheme: string
}

export const INITIAL_COMMON_VALUE: CommonStateInterface = {
  currentTheme: 'light'
};

export const COMMON_SLICE = createSlice({
  name: COMMON_STATE_KEY,
  initialState: INITIAL_COMMON_VALUE,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(setTheme, (state, action) => {
        state.currentTheme = action.payload;
      });
  }
});

export const commonReducer = COMMON_SLICE.reducer;
export const getCommonState = ( rootState: any ): CommonStateInterface => rootState[COMMON_STATE_KEY];
export const selectCurrentTheme = createSelector(getCommonState, state => state.currentTheme );
