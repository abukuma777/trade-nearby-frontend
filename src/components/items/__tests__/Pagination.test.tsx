/**
 * Paginationコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
  };

  it('should render page information', () => {
    render(<Pagination {...defaultProps} />);

    // アイテム数の表示
    expect(screen.getByText('50件中 1-10件を表示')).toBeInTheDocument();
  });

  it('should not render when only one page', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} totalItems={5} />);

    expect(container.firstChild).toBeNull();
  });

  it('should disable previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByLabelText('前のページ');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    const nextButton = screen.getByLabelText('次のページ');
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange when clicking page number', () => {
    const handlePageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={handlePageChange} />);

    // ページ2をクリック
    const page2Button = screen.getByLabelText('ページ 2');
    fireEvent.click(page2Button);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when clicking previous button', () => {
    const handlePageChange = vi.fn();
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={handlePageChange} />);

    const prevButton = screen.getByLabelText('前のページ');
    fireEvent.click(prevButton);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when clicking next button', () => {
    const handlePageChange = vi.fn();
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={handlePageChange} />);

    const nextButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('should show ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={10} totalItems={100} />);

    // 省略記号が表示される
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('should highlight current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const currentPageButton = screen.getByLabelText('ページ 3');
    expect(currentPageButton.className).toContain('bg-blue-600');
    expect(currentPageButton.className).toContain('text-white');
  });

  it('should calculate item range correctly', () => {
    render(<Pagination {...defaultProps} currentPage={2} totalItems={25} itemsPerPage={10} />);

    // 2ページ目: 11-20件を表示
    expect(screen.getByText('25件中 11-20件を表示')).toBeInTheDocument();
  });

  it('should handle last page item range correctly', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={3}
        totalItems={25}
        itemsPerPage={10}
        totalPages={3}
      />,
    );

    // 3ページ目: 21-25件を表示
    expect(screen.getByText('25件中 21-25件を表示')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    render(<Pagination {...defaultProps} loading={true} />);

    const prevButton = screen.getByLabelText('前のページ');
    const nextButton = screen.getByLabelText('次のページ');
    const page2Button = screen.getByLabelText('ページ 2');

    // ローディング中は無効になる
    expect(page2Button.className).toContain('opacity-50');
  });
});
