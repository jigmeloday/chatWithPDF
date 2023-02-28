import { render } from '@testing-library/react';

import PageNotFound from './page-not-found';

describe('PageNotFound', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageNotFound />);
    expect(baseElement).toBeTruthy();
  });
});
