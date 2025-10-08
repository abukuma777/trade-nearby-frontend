/**
 * 検索モーダルコンポーネント
 * ヘッダーから呼び出されるシンプルな検索UI
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // モーダルが開いたら入力フィールドにフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // スクロール無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 検索実行
  const handleSearch = (): void => {
    const keyword = searchKeyword.trim();
    if (keyword) {
      // 検索結果ページに遷移（URLパラメータにキーワードを付与）
      navigate(`/trade-posts?search=${encodeURIComponent(keyword)}`);
      onClose();
      setSearchKeyword(''); // 検索後はクリア
    }
  };

  // Enterキーで検索実行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) {return null;}

  return (
    <>
      {/* オーバーレイとモーダルコンテナー */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-20 transition-opacity sm:pt-32"
        onClick={(e) => {
          // オーバーレイ（背景）がクリックされた場合のみ閉じる
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* モーダルコンテンツ */}
        <div className="relative w-full max-w-2xl" style={{ margin: '0 1rem' }}>
          <div
            className="rounded-lg bg-white p-6 shadow-2xl transition-all sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="閉じる"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* タイトル */}
            <div className="mb-6">
              <h2
                id="search-modal-title"
                className="text-2xl font-bold text-gray-900"
              >
                投稿を検索
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                キーワードを入力して交換投稿を検索できます
              </p>
            </div>

            {/* 検索バー */}
            <div className="mb-6">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="キーワードを入力（例: ポケモンカード、ぬいぐるみ）"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-12 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 ヒント:
                検索後、結果画面で「譲)のみ」「求)のみ」の絞り込みができます
              </p>
            </div>

            {/* ボタン */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={onClose}
                className="order-2 rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 transition-colors hover:bg-gray-50 sm:order-1"
              >
                キャンセル
              </button>
              <button
                onClick={handleSearch}
                disabled={!searchKeyword.trim()}
                className="order-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:order-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                検索する
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;
