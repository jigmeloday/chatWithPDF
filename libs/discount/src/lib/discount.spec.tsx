import { render } from '@testing-library/react';

import Discount from './discount';

describe('Discount', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Discount />);
    expect(baseElement).toBeTruthy();
  });
});
