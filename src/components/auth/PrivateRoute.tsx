/**
 * PrivateRouteコンポーネント
 * 認証が必要なルートを保護する
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string[];
}

/**
 * 認証保護ルートコンポーネント
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectTo = '/login',
  requiredRole = []
}) => {
  const location = useLocation();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  
  // コンポーネントマウント時に認証状態をチェック
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 認証されていない場合
  if (!isAuthenticated) {
    // ログイン後に元のページに戻れるよう、現在のパスを保存
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ロールベースのアクセス制御（将来実装用）
  if (requiredRole.length > 0 && user) {
    // ユーザーのロールをチェック（現在は未実装）
    // const hasRequiredRole = requiredRole.some(role => user.roles?.includes(role));
    // if (!hasRequiredRole) {
    //   return <Navigate to="/unauthorized" replace />;
    // }
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
};

/**
 * ゲスト専用ルートコンポーネント（ログイン済みの場合はリダイレクト）
 */
export const GuestRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  // コンポーネントマウント時に認証状態をチェック
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 既に認証済みの場合はホームへリダイレクト
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 未認証の場合は子コンポーネントを表示
  return <>{children}</>;
};

/**
 * 認証状態のローディング表示コンポーネント
 */
export const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-600">認証状態を確認中...</p>
      </div>
    </div>
  );
};
