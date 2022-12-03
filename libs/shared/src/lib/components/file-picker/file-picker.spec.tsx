import { render } from '@testing-library/react';

import FilePicker from './file-picker';

describe('FilePicker', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FilePicker />);
    expect(baseElement).toBeTruthy();
  });
});
