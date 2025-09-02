import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearchChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchBar onSearchChange={mockOnSearchChange} searchTerm="" />);
    
    const searchInput = screen.getByPlaceholderText(/DIGITE O ENDEREÇO SEM ACENTOS/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should display search term value', () => {
    const searchTerm = 'Rua Teste';
    render(<SearchBar onSearchChange={mockOnSearchChange} searchTerm={searchTerm} />);
    
    const searchInput = screen.getByDisplayValue(searchTerm);
    expect(searchInput).toBeInTheDocument();
  });

  it('should call onSearchChange when input changes', () => {
    render(<SearchBar onSearchChange={mockOnSearchChange} searchTerm="" />);
    
    const searchInput = screen.getByPlaceholderText(/DIGITE O ENDEREÇO SEM ACENTOS/i);
    fireEvent.change(searchInput, { target: { value: 'Rua Nova' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('Rua Nova');
  });

  it('should have correct input attributes', () => {
    render(<SearchBar onSearchChange={mockOnSearchChange} searchTerm="" />);
    
    const searchInput = screen.getByPlaceholderText(/DIGITE O ENDEREÇO SEM ACENTOS/i);
    expect(searchInput).toHaveAttribute('type', 'text');
    expect(searchInput).toHaveAttribute('aria-label', 'Buscar endereço por rua, CEP ou bairro');
  });

  it('should be accessible', () => {
    render(<SearchBar onSearchChange={mockOnSearchChange} searchTerm="" />);
    
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
  });
});
