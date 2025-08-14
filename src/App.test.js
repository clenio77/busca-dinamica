import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza o título do header', () => {
  render(<App />);
  const title = screen.getByRole('heading', { name: /Busca Dinâmica 2\.0/i });
  expect(title).toBeInTheDocument();
});
