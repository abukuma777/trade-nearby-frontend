/**
 * 認証ストア（Zustand）
 * ユーザー認証状態とトークン管理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ユーザー情報の型定義
export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

// セッション情報の型定義
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
}

// 認証ストアの型定義
interface AuthState {
  // 状態
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // アクション
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, session: Session) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => boolean;
  getAccessToken: () => string | null;
}

// 認証ストアの作成（永続化対応）
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初期状態
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ユーザー設定
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      // セッション設定
      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session,
          error: null,
        }),

      // ローディング状態設定
      setLoading: (isLoading) => set({ isLoading }),

      // エラー設定
      setError: (error) => set({ error, isLoading: false }),

      // ログイン処理
      login: (user, session) => {
        // セッションの有効期限を計算
        const expiresAt = Date.now() + session.expires_in * 1000;
        const sessionWithExpiry = { ...session, expires_at: expiresAt };

        // ユーザーIDを明示的にlocalStorageに保存
        if (user.id) {
          localStorage.setItem('userId', user.id);
        }

        // アクセストークンをlocalStorageに保存
        if (session.access_token) {
          localStorage.setItem('access_token', session.access_token);
          // console.log('アクセストークンをlocalStorageに保存');
        }

        // リフレッシュトークンをlocalStorageに保存
        if (session.refresh_token) {
          localStorage.setItem('refresh_token', session.refresh_token);
        }

        set({
          user,
          session: sessionWithExpiry,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      // ログアウト処理
      logout: () => {
        // localStorageからトークンとユーザーIDを削除
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userId');

        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // ユーザー情報の更新
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      // 認証状態のチェック
      checkAuth: () => {
        const { session } = get();

        if (!session) {
          return false;
        }

        // トークンの有効期限をチェック
        if (session.expires_at && session.expires_at < Date.now()) {
          // トークンが期限切れの場合はログアウト
          get().logout();
          return false;
        }

        return true;
      },

      // アクセストークンの取得
      getAccessToken: () => {
        const { session, checkAuth } = get();

        // 認証状態をチェック
        if (!checkAuth()) {
          return null;
        }

        return session?.access_token || null;
      },
    }),
    {
      name: 'auth-storage', // localStorage のキー名
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 永続化する項目を選択
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // ストレージから復元した際に実行
        if (state && state.user?.id) {
          localStorage.setItem('userId', state.user.id);
        }

        // セッション情報も復元
        if (state && state.session?.access_token) {
          localStorage.setItem('access_token', state.session.access_token);
          // console.log('ページリロード時にaccess_tokenを復元');
        }
        if (state && state.session?.refresh_token) {
          localStorage.setItem('refresh_token', state.session.refresh_token);
        }
      },
    },
  ),
);

// セレクター関数
export const selectUser = (state: AuthState): User | null => state.user;
export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.isAuthenticated;
export const selectIsLoading = (state: AuthState): boolean => state.isLoading;
export const selectError = (state: AuthState): string | null => state.error;
export const selectAccessToken = (state: AuthState): string | null =>
  state.getAccessToken();
