/**
 * ItemFilterコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ItemFilter from '../ItemFilter';
import { ItemsQueryParams } from '@/types/item';

describe('ItemFilter', () => {
  let mockOnFilterChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnFilterChange = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<ItemFilter onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('グッズを検索...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    vi.useFakeTimers();
    render(<ItemFilter onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('グッズを検索...') as HTMLInputElement;

    // 検索テキストを入力
    fireEvent.change(searchInput, { target: { value: '鬼滅' } });

    // すぐには呼ばれない
    expect(mockOnFilterChange).not.toHaveBeenCalled();

    // 500ms待つ
    vi.advanceTimersByTime(500);

    // デバウンス後に呼ばれる
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ search: '鬼滅' }));
    });

    vi.useRealTimers();
  });

  it('should toggle filter expansion', () => {
    render(<ItemFilter onFilterChange={mockOnFilterChange} />);

    // 初期状態では詳細フィルターは非表示
    expect(screen.queryByText('カテゴリー')).not.toBeInTheDocument();

    // フィルターボタンをクリック
    const filterButton = screen.getByText('フィルター');
    fireEvent.click(filterButton);

    // 詳細フィルターが表示される
    expect(screen.getByText('カテゴリー')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('並び順')).toBeInTheDocument();
  });

  it('should handle category filter', () => {
    render(<ItemFilter onFilterChange={mockOnFilterChange} />);

    // フィルターを展開
    fireEvent.click(screen.getByText('フィルター'));

    // アニメカテゴリーを選択
    const animeButton = screen.getByText('アニメ');
    fireEvent.click(animeButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'anime', page: 1 }),
    );
  });

  it('should handle status filter', () => {
    render(<ItemFilter onFilterChange={mockOnFilterChange} />);

    // フィルターを展開
    fireEvent.click(screen.getByText('フィルター'));

    // 公開中ステータスを選択
    const activeButton = screen.getByText('公開中');
    fireEvent.click(activeButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active', page: 1 }),
    );
  });

  it('should handle sort change', () => {
    render(<ItemFilter onFilterChange={mockOnFilterChange} />);

    // フィルターを展開
    fireEvent.click(screen.getByText('フィルター'));

    // ソートドロップダウンを変更
    const sortSelect = screen.getByLabelText('並び順') as HTMLSelectElement;
    fireEvent.change(sortSelect, { target: { value: 'created_at' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'created_at', page: 1 }),
    );
  });

  it('should reset filters', () => {
    const initialFilters: ItemsQueryParams = {
      category: 'anime',
      status: 'active',
      search: 'test',
    };

    render(<ItemFilter onFilterChange={mockOnFilterChange} initialFilters={initialFilters} />);

    // フィルターを展開
    fireEvent.click(screen.getByText('フィルター'));

    // リセットボタンが表示される
    const resetButton = screen.getByText('フィルターをリセット');
    fireEvent.click(resetButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });

  it('should show active filter count', () => {
    const initialFilters: ItemsQueryParams = {
      category: 'anime',
      status: 'active',
    };

    render(<ItemFilter onFilterChange={mockOnFilterChange} initialFilters={initialFilters} />);

    // アクティブなフィルター数が表示される
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should disable inputs when loading', () => {
    render(<ItemFilter onFilterChange={mockOnFilterChange} loading={true} />);

    const searchInput = screen.getByPlaceholderText('グッズを検索...') as HTMLInputElement;
    expect(searchInput).toBeDisabled();
  });
});
