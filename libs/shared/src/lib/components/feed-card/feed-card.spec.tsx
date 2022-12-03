import { render } from '@testing-library/react';

import FeedCard from './feed-card';

describe('FeedCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeedCard />);
    expect(baseElement).toBeTruthy();
  });
});
