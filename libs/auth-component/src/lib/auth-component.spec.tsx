import { render } from '@testing-library/react';

import AuthComponent from './auth-component';

describe('AuthComponent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AuthComponent />);
    expect(baseElement).toBeTruthy();
  });
});
