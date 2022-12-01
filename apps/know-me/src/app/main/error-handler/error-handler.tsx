import React, { ReactNode } from 'react';
import { Grid } from '@mui/material';
import { Props, State } from './model/error-handler.model';

class ErrorBoundary extends React.Component<Props, State> {
  constructor ( props: Props ) {
    super( props );
    this.state = { hasError: false };
  }
  static getDerivedStateFromError ( ): { hasError: boolean } {
    return { hasError: true };
  }

  override render (): JSX.Element | ReactNode {
    if ( this.state.hasError ) {
      return (
        <Grid height='100vh' item alignItems='center' justifyContent='center' container lg={12}>
          <Grid item xs={12} lg={6}>
            <Grid container justifyContent='center'>
              <span> This page is broken, go back</span>
            </Grid>
          </Grid>
        </Grid>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
