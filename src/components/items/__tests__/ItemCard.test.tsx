/**
 * ItemCardコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import ItemCard from '../ItemCard';

import { mockItems } from '@/__mocks__/itemMocks';

// ルーターのラッパー
const RouterWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => <BrowserRouter>{children}</BrowserRouter>;

describe('ItemCard', () => {
  const mockItem = mockItems[0];

  it('should render item information correctly', () => {
    render(
      <RouterWrapper>
        <ItemCard item={mockItem} />
      </RouterWrapper>,
    );

    // タイトルが表示されている
    expect(screen.getByText(mockItem.title)).toBeInTheDocument();

    // 説明が表示されている
    expect(screen.getByText(mockItem.description)).toBeInTheDocument();

    // カテゴリーが表示されている
    expect(screen.getByText('アニメ')).toBeInTheDocument();

    // コンディションが表示されている
    expect(screen.getByText('新品')).toBeInTheDocument();

    // ユーザー名が表示されている
    if (mockItem.user) {
      expect(screen.getByText(mockItem.user.username)).toBeInTheDocument();
    }
  });

  it('should display tags correctly', () => {
    render(
      <RouterWrapper>
        <ItemCard item={mockItem} />
      </RouterWrapper>,
    );

    // 最初の3つのタグが表示されている
    mockItem.tags.slice(0, 3).forEach((tag) => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument();
    });
  });

  it('should show status badge for non-active items', () => {
    const tradedItem = { ...mockItem, status: 'traded' as const };

    render(
      <RouterWrapper>
        <ItemCard item={tradedItem} />
      </RouterWrapper>,
    );

    expect(screen.getByText('交換済み')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();

    render(
      <RouterWrapper>
        <ItemCard item={mockItem} onClick={handleClick} />
      </RouterWrapper>,
    );

    // カード全体をクリック
    const card = screen
      .getByText(mockItem.title)
      .closest('div[class*="bg-white"]');
    if (card) {
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledWith(mockItem);
    }
  });

  it('should display location if provided', () => {
    render(
      <RouterWrapper>
        <ItemCard item={mockItem} />
      </RouterWrapper>,
    );

    if (mockItem.location?.city) {
      expect(screen.getByText(mockItem.location.city)).toBeInTheDocument();
    }
  });

  it('should handle image error gracefully', () => {
    render(
      <RouterWrapper>
        <ItemCard item={mockItem} />
      </RouterWrapper>,
    );

    const image = screen.getByAltText(mockItem.title);

    // エラーイベントを発火
    fireEvent.error(image);

    // デフォルト画像に切り替わることを確認
    expect(image.getAttribute('src')).toContain('No+Image');
  });
});
