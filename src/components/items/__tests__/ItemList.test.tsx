/**
 * ItemListコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import ItemList from '../ItemList';

import { mockItems } from '@/__mocks__/itemMocks';

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ItemList', () => {
  it('should render items correctly', () => {
    render(
      <RouterWrapper>
        <ItemList items={mockItems} />
      </RouterWrapper>,
    );

    // すべてのアイテムが表示されている
    mockItems.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  it('should show loading skeleton when loading', () => {
    render(
      <RouterWrapper>
        <ItemList items={[]} loading />
      </RouterWrapper>,
    );

    // スケルトンローダーが表示されている
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show error message when error occurs', () => {
    const error = new Error('テストエラー');

    render(
      <RouterWrapper>
        <ItemList items={[]} error={error} />
      </RouterWrapper>,
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('テストエラー')).toBeInTheDocument();
    expect(screen.getByText('ページを再読み込み')).toBeInTheDocument();
  });

  it('should show empty message when no items', () => {
    render(
      <RouterWrapper>
        <ItemList items={[]} />
      </RouterWrapper>,
    );

    expect(screen.getByText('アイテムが見つかりませんでした')).toBeInTheDocument();
    expect(screen.getByText('条件を変更して再度検索してください')).toBeInTheDocument();
  });

  it('should show custom empty message', () => {
    const customMessage = 'カスタムメッセージ';

    render(
      <RouterWrapper>
        <ItemList items={[]} emptyMessage={customMessage} />
      </RouterWrapper>,
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should call onItemClick when item is clicked', () => {
    const handleClick = vi.fn();

    render(
      <RouterWrapper>
        <ItemList items={[mockItems[0]]} onItemClick={handleClick} />
      </RouterWrapper>,
    );

    const card = screen.getByText(mockItems[0].title).closest('div');
    if (card) {
      card.click();
      expect(handleClick).toHaveBeenCalledWith(mockItems[0]);
    }
  });

  it('should apply correct grid columns class', () => {
    const { container } = render(
      <RouterWrapper>
        <ItemList items={mockItems} columns={4} />
      </RouterWrapper>,
    );

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('xl:grid-cols-4');
  });
});
