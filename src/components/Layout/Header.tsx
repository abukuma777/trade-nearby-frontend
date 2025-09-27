import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  isAuthenticated?: boolean;
  username?: string;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, username = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Trade</span>
            <span className="text-2xl font-bold text-gray-800">Nearby</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/trade-posts" className="text-gray-700 hover:text-blue-600 transition-colors">
              交換投稿
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/trade-posts/my"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  マイ投稿
                </Link>
                <Link
                  to="/trade"
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/trade-posts/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  投稿作成
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <span>{username || 'ユーザー'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
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
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
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
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden p-2 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="メニュー"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link
                to="/trade-posts"
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                交換投稿
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/trade-posts/my"
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    マイ投稿
                  </Link>
                  <Link
                    to="/trade"
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    投稿作成
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    プロフィール
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
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
    </header>
  );
};

export default Header;
