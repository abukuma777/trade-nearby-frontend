import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { PrivateRoute, GuestRoute } from '@/components/auth/PrivateRoute';
import MainLayout from '@components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
// 譲求システム（シンプル版）
import TradePostsPage from './pages/TradePostsPage';
import CreateTradePostPage from './pages/CreateTradePostPage';
import MyTradePostsPage from './pages/MyTradePostsPage';
import UserTradePostsPage from './pages/UserTradePostsPage';
import TradePostDetailPage from './pages/TradePostDetailPage';
// 交換リクエスト管理
import TradePage from './pages/TradePage';
import TradeDetailPage from './pages/TradeDetailPage';
// 取引チャット
import TradeChatPage from './pages/TradeChatPage';
// import ImageTestPage from './pages/ImageTestPage';
import './App.css';

function App() {
  // Zustandストアから認証状態を取得
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const username = user?.username || user?.email || '';

  // アプリ起動時に認証状態をチェック
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        {/* ホームページ（認証不要） */}
        <Route
          path="/"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <HomePage />
            </MainLayout>
          }
        />

        {/* ログインページ（ゲスト専用） */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        {/* 登録ページ（ゲスト専用） */}
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* ==== シンプル譲求システム ==== */}

        {/* 譲求投稿一覧（認証不要） */}
        <Route
          path="/trade-posts"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <TradePostsPage />
            </MainLayout>
          }
        />

        {/* 譲求投稿詳細（認証不要） */}
        <Route
          path="/trade-posts/:id"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <TradePostDetailPage />
            </MainLayout>
          }
        />

        {/* 譲求投稿作成（認証必要） */}
        <Route
          path="/trade-posts/create"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <CreateTradePostPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* 自分の譲求投稿（認証必要） */}
        <Route
          path="/trade-posts/my"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <MyTradePostsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* ==== 交換リクエスト管理 ==== */}

        {/* 交換リクエスト一覧（認証必要） */}
        <Route
          path="/trade"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <TradePage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* 交換リクエスト詳細（認証必要） */}
        <Route
          path="/trade/:id"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <TradeDetailPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* 取引チャット（認証必要） */}
        <Route
          path="/chat/:chatRoomId"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <TradeChatPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* プロフィール（認証必要・自分） */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <ProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* プロフィール（認証不要・他人） */}
        <Route
          path="/profile/:username"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <ProfilePage />
            </MainLayout>
          }
        />

        {/* ユーザーの出品一覧（認証不要） */}
        <Route
          path="/user/:username/trade-posts"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <UserTradePostsPage />
            </MainLayout>
          }
        />

        {/* 設定（認証必要） */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold">設定</h1>
                  <p className="mt-4 text-gray-600">設定ページ（実装予定）</p>
                </div>
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* 画像テストページ（デバッグ用） 一時的に無効化 */}
        {/* <Route
          path="/test/images"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <ImageTestPage />
            </MainLayout>
          }
        /> */}

        {/* 404ページ */}
        <Route
          path="*"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl text-gray-600">ページが見つかりません</p>
              </div>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
