import MainLayout from '@components/Layout/MainLayout';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 譲求システム（シンプル版）
import CreateTradePostPage from './pages/CreateTradePostPage';
import EventDetailPage from './pages/EventDetailPage';
import EventModePage from './pages/EventModePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyTradePostsPage from './pages/MyTradePostsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
// 交換リクエスト管理
import TradeChatPage from './pages/TradeChatPage';
import TradeDetailPage from './pages/TradeDetailPage';
// 取引チャット
import TradePage from './pages/TradePage';
import TradePostDetailPage from './pages/TradePostDetailPage';
import TradePostEditPage from './pages/TradePostEditPage';
import TradePostsPage from './pages/TradePostsPage';
import UserTradePostsPage from './pages/UserTradePostsPage';

import { PrivateRoute, GuestRoute } from '@/components/auth/PrivateRoute';
import { useAuthStore } from '@/stores/authStore';
// import ImageTestPage from './pages/ImageTestPage';
import './App.css';

function App(): JSX.Element {
  // Zustandストアから認証状態を取得
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const username = user?.username || user?.email || '';

  // アプリ起動時に認証状態をチェック
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          // デフォルトオプション
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
          },
          // 成功時のスタイル
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          // エラー時のスタイル
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
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

        {/* 統計ページ（認証不要） */}
        <Route
          path="/statistics"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <StatisticsPage />
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

        {/* イベントモード（認証必要） */}
        <Route
          path="/event-mode"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <EventModePage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* イベント専用ページ（認証不要） */}
        <Route
          path="/events/:eventId"
          element={
            <MainLayout isAuthenticated={isAuthenticated} username={username}>
              <EventDetailPage />
            </MainLayout>
          }
        />

        {/* 譲求投稿編集（認証必要） */}
        <Route
          path="/trade-posts/:id/edit"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <TradePostEditPage />
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

        {/* 通知一覧（認証必要） */}
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <MainLayout isAuthenticated={isAuthenticated} username={username}>
                <NotificationsPage />
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
                <SettingsPage />
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
                <h1 className="mb-4 text-4xl font-bold">404</h1>
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
