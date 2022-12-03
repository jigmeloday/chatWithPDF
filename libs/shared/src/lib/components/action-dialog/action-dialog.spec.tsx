import { render } from '@testing-library/react';

import ActionDialog from './action-dialog';

describe('ActionDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActionDialog />);
    expect(baseElement).toBeTruthy();
  });
});
