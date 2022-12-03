import { render } from '@testing-library/react';

import ErrorHandler from './error-handler';

describe('ErrorHandler', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ErrorHandler />);
    expect(baseElement).toBeTruthy();
  });
});
