import { render } from '@testing-library/react';

import ForgotPassword from './forgot-password';

describe('ForgotPassword', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ForgotPassword />);
    expect(baseElement).toBeTruthy();
  });
});
