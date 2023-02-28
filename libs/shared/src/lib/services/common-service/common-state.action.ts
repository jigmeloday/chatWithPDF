import { createAction } from '@reduxjs/toolkit';

export const setTheme = createAction('currentTheme', args => ( { payload: args } ) );
