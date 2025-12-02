import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploader from './ImageUploader';
import { FileWithPreview } from '../types';

describe('ImageUploader', () => {
  const defaultProps = {
    id: 'test-upload',
    label: 'Test Label',
    description: 'Test description',
    image: null,
    onImageChange: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label and description', () => {
    render(<ImageUploader {...defaultProps} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should show upload prompt when no image', () => {
    render(<ImageUploader {...defaultProps} />);

    expect(screen.getByText('Click to upload')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<ImageUploader {...defaultProps} isLoading={true} />);

    // Loading spinner should be visible
    const container = document.querySelector('.animate-pulse');
    expect(container).toBeInTheDocument();
  });

  it('should display image preview when image is provided', () => {
    const mockImage: FileWithPreview = {
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      preview: 'data:image/jpeg;base64,test',
      base64: 'data:image/jpeg;base64,test',
    };

    render(<ImageUploader {...defaultProps} image={mockImage} />);

    const img = screen.getByAltText('Preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockImage.preview);
  });

  it('should call onImageChange with null when remove button is clicked', async () => {
    const mockImage: FileWithPreview = {
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      preview: 'data:image/jpeg;base64,test',
      base64: 'data:image/jpeg;base64,test',
    };

    const onImageChange = vi.fn();
    render(<ImageUploader {...defaultProps} image={mockImage} onImageChange={onImageChange} />);

    // Hover to show remove button
    const container = screen.getByAltText('Preview').closest('.group');
    expect(container).toBeInTheDocument();

    // Find and click remove button
    const removeButton = screen.getByTitle('Remove Image');
    await userEvent.click(removeButton);

    expect(onImageChange).toHaveBeenCalledWith(null);
  });

  it('should reject files larger than 5MB', async () => {
    render(<ImageUploader {...defaultProps} />);

    const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock the file input change
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/File size exceeds/)).toBeInTheDocument();
    });
  });

  it('should reject invalid file types', async () => {
    render(<ImageUploader {...defaultProps} />);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Invalid file format/)).toBeInTheDocument();
    });
  });

  it('should have correct accept attribute', () => {
    render(<ImageUploader {...defaultProps} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  it('should render the file input with correct id', () => {
    render(<ImageUploader {...defaultProps} id="my-upload" />);

    const input = document.querySelector('#my-upload');
    expect(input).toBeInTheDocument();
  });
});
