import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App component', () => {
  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByText(/Конвертер DOC → PDF/i)).toBeInTheDocument();
  });

  it('shows error message when clicking "Конвертировать" without selecting a file', async () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Конвертировать/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Сначала выберите файл/i)).toBeInTheDocument();
    });
  });

  it('displays the file name after selecting a file', () => {
    render(<App />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/📎 test.docx/i)).toBeInTheDocument();
  });
});