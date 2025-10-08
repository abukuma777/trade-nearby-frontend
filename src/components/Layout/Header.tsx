import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { SearchModal } from '@/components/search';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/stores/authStore';

interface HeaderProps {
  isAuthenticated?: boolean;
  username?: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    id?: string;
    sub?: string;
  };
}

interface UserWithSub extends User {
  sub?: string;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  username = '',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { logout, user } = useAuth();

  // ユーザーIDを取得
  useEffect(() => {
    if (isAuthenticated && user) {
      const typedUser = user as UserWithSub;
      const id: string | undefined = typedUser.id || typedUser.sub;
      setUserId(id ?? null);
    } else {
      // APIからユーザー情報を取得
      const token = localStorage.getItem('access_token');
      if (token && isAuthenticated) {
        void fetch(
          `${String(import.meta.env.VITE_API_URL) || 'http://localhost:3000'}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
          .then(async (res) => {
            const apiResponse = (await res.json()) as ApiResponse;
            return apiResponse;
          })
          .then((data: ApiResponse) => {
            if (data.success && data.data) {
              const id = data.data.id || data.data.sub;
              setUserId(id ?? null);
            }
          })
          .catch((err: unknown) =>
            console.error('Failed to get user ID:', err),
          );
      }
    }
  }, [isAuthenticated, user]);

  const handleLogout = async (): Promise<void> => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Trade</span>
            <span className="text-2xl font-bold text-gray-800">Nearby</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden items-center space-x-6 md:flex">
            <Link
              to="/trade-posts"
              className="text-gray-700 transition-colors hover:text-blue-600"
            >
              交換投稿
            </Link>
            <Link
              to="/statistics"
              className="text-gray-700 transition-colors hover:text-blue-600"
            >
              統計
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/trade-posts/my"
                  className="text-gray-700 transition-colors hover:text-blue-600"
                >
                  マイ投稿
                </Link>
                <Link
                  to="/trade"
                  className="flex items-center gap-1 text-gray-700 transition-colors hover:text-blue-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  取引
                </Link>
              </>
            )}
          </nav>

          {/* ユーザーメニュー/ログインボタン */}
          <div className="hidden items-center space-x-4 md:flex">
            {/* 検索ボタン */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
              aria-label="検索"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {isAuthenticated ? (
              <>
                {/* 通知ドロップダウン */}
                {userId && <NotificationDropdown userId={userId} />}

                <Link
                  to="/trade-posts/create"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  投稿作成
                </Link>
                <div className="group relative">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <span>{username || 'ユーザー'}</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div className="invisible absolute right-0 mt-2 w-48 rounded-lg bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      プロフィール
                    </Link>
                    <Link
                      to="/trade-posts/my"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      マイ投稿
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      設定
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={() => void handleLogout()}
                      className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  ログイン
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* モバイル用検索ボタン */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
              aria-label="検索"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* モバイル用通知ボタン */}
            {isAuthenticated && userId && (
              <NotificationDropdown userId={userId} />
            )}

            <button
              className="relative p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="メニュー"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <nav className="border-t border-gray-200 py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                to="/trade-posts"
                className="py-2 text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                交換投稿
              </Link>
              <Link
                to="/statistics"
                className="py-2 text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                統計
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/trade-posts/my"
                    className="py-2 text-gray-700 transition-colors hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    マイ投稿
                  </Link>
                  <Link
                    to="/trade"
                    className="flex items-center gap-2 py-2 text-gray-700 transition-colors hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    取引管理
                  </Link>
                </>
              )}
              <hr className="my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/trade-posts/create"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-center text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    投稿作成
                  </Link>
                  <Link
                    to="/profile"
                    className="py-2 text-gray-700 transition-colors hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    プロフィール
                  </Link>
                  <button
                    onClick={() => void handleLogout()}
                    className="py-2 text-left text-gray-700 transition-colors hover:text-blue-600"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-center text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* 検索モーダル */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  );
};

export default Header;
