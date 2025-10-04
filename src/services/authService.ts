/**
 * 認証APIサービス
 * ログイン、登録、ログアウト、ユーザー情報取得
 */

import { AxiosError } from 'axios';

import apiClient, { ApiResponse, handleApiError } from './api';

import { User, Session } from '@/stores/authStore';

// リクエスト型定義
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  display_name: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

// 認証APIサービスクラス
class AuthService {
  /**
   * ログイン
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'ログインに失敗しました');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * ユーザー登録
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '登録に失敗しました');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // ログアウトエラーは無視（ローカルでクリアすれば十分）
      console.error('Logout API error:', error);
    }
  }

  /**
   * 現在のユーザー情報取得
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');

      if (!response.data.success) {
        throw new Error('ユーザー情報の取得に失敗しました');
      }

      // dataまたはuserフィールドからユーザー情報を取得
      const userData = response.data.data || response.data.user;

      if (!userData) {
        throw new Error('ユーザー情報が空です');
      }

      return userData;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * パスワードリセット要求
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/reset-password', { email });

      if (!response.data.success) {
        throw new Error(response.data.message || 'パスワードリセットに失敗しました');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * トークンのリフレッシュ
   */
  async refreshToken(refreshToken: string): Promise<Session> {
    try {
      const response = await apiClient.post<ApiResponse<Session>>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error('トークンの更新に失敗しました');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * メールアドレスの確認
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/verify-email', { token });

      if (!response.data.success) {
        throw new Error(response.data.message || 'メールアドレスの確認に失敗しました');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * パスワード変更
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'パスワードの変更に失敗しました');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * プロフィール更新
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<User>>('/users/me', updates);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'プロフィールの更新に失敗しました');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }
}

// シングルトンインスタンスをエクスポート
const authService = new AuthService();
export default authService;
