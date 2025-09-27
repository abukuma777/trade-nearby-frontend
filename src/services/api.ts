/**
 * API通信基盤（Axios設定）
 * 認証インターセプター、エラーハンドリング含む
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// APIベースURLの設定（環境変数から取得）
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';

// Axiosインスタンスの作成
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒タイムアウト（Render無料プランのコールドスタート対応）
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookie送信を有効化
});

// リクエストインターセプター（認証トークン付与）
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 認証トークンの取得
    const token = useAuthStore.getState().getAccessToken();

    if (token) {
      // Authorizationヘッダーにトークンを設定
      config.headers.Authorization = `Bearer ${token}`;
    }

    // デバッグ用ログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => {
    // デバッグ用ログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const { response } = error;
    const authStore = useAuthStore.getState();

    // エラーログ
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: response?.status,
      message: error.message,
    });

    // 401 Unauthorized: トークン無効・期限切れ
    if (response?.status === 401) {
      // 認証エラーメッセージ
      const message = (response.data as any)?.message || '認証エラーが発生しました';

      // ログアウト処理
      authStore.logout();
      authStore.setError(message);

      // ログインページへリダイレクト（React Router使用）
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // 403 Forbidden: アクセス権限なし
    if (response?.status === 403) {
      authStore.setError('このリソースへのアクセス権限がありません');
    }

    // 404 Not Found
    if (response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    }

    // 500 Internal Server Error
    if (response?.status === 500) {
      authStore.setError('サーバーエラーが発生しました。時間をおいて再度お試しください');
    }

    // ネットワークエラー
    if (!response && error.message === 'Network Error') {
      authStore.setError('ネットワークエラーが発生しました。接続を確認してください');
    }

    return Promise.reject(error);
  },
);

// エクスポート
export default apiClient;

// 型定義
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T; // /api/auth/meエンドポイント用
  error?: {
    code: string;
    details?: any;
  };
}

// 便利なヘルパー関数
export const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    // サーバーからのエラーレスポンス
    const data = error.response.data as ApiResponse;
    return data.message || 'エラーが発生しました';
  } else if (error.request) {
    // リクエストは送信されたがレスポンスなし
    return 'サーバーから応答がありません';
  } else {
    // リクエスト設定時のエラー
    return error.message || '予期しないエラーが発生しました';
  }
};
