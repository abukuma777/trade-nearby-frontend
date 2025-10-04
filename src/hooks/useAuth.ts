/**
 * 認証用カスタムフック
 * ログイン、登録、ログアウトのロジック管理
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import authService from '@/services/authService';
import type { LoginRequest, RegisterRequest } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/stores/authStore';

// フォームバリデーションエラー
interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  display_name?: string;
  confirmPassword?: string;
}

/**
 * 認証フック
 */
export const useAuth = (): {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationErrors;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest & { confirmPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<{ success: boolean; user?: User; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearValidationErrors: () => void;
} => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    setError,
  } = useAuthStore();

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  /**
   * バリデーション
   */
  const validateLogin = (data: LoginRequest): boolean => {
    const errors: ValidationErrors = {};

    // メールアドレスのバリデーション
    if (!data.email) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }

    // パスワードのバリデーション
    if (!data.password) {
      errors.password = 'パスワードを入力してください';
    } else if (data.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = (data: RegisterRequest & { confirmPassword?: string }): boolean => {
    const errors: ValidationErrors = {};

    // メールアドレスのバリデーション
    if (!data.email) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }

    // パスワードのバリデーション
    if (!data.password) {
      errors.password = 'パスワードを入力してください';
    } else if (data.password.length < 12) {
      errors.password = 'パスワードは12文字以上で入力してください';
    } else {
      // パスワード強度チェック
      const hasUpperCase = /[A-Z]/.test(data.password);
      const hasLowerCase = /[a-z]/.test(data.password);
      const hasNumbers = /\d/.test(data.password);
      const hasSymbols = /[^A-Za-z0-9]/.test(data.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSymbols) {
        errors.password = 'パスワードは大文字・小文字・数字・記号を必ず含めてください';
      }
    }

    // パスワード確認
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }

    // ユーザー名のバリデーション（必須）
    if (!data.username) {
      errors.username = 'ユーザー名を入力してください';
    } else if (data.username.length < 3) {
      errors.username = 'ユーザー名は3文字以上で入力してください';
    } else if (!/^[a-z0-9_]+$/.test(data.username)) {
      errors.username = 'ユーザー名は英小文字、数字、アンダーバーのみ使用できます';
    }

    // 表示名のバリデーション（必須）
    if (!data.display_name) {
      errors.display_name = '表示名を入力してください';
    } else if (data.display_name.length > 50) {
      errors.display_name = '表示名は50文字以内で入力してください';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * ログイン処理
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      // バリデーション
      if (!validateLogin(credentials)) {
        return { success: false };
      }

      setLoading(true);
      setError(null);
      setValidationErrors({});

      try {
        // APIコール
        const response = await authService.login(credentials);

        // ストアに保存
        storeLogin(response.user, response.session);

        // ホームページへリダイレクト
        navigate('/');

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [navigate, storeLogin, setLoading, setError],
  );

  /**
   * ユーザー登録処理
   */
  const register = useCallback(
    async (userData: RegisterRequest & { confirmPassword?: string }) => {
      // バリデーション
      if (!validateRegister(userData)) {
        return { success: false };
      }

      setLoading(true);
      setError(null);
      setValidationErrors({});

      try {
        // confirmPasswordは送信しない
        const { confirmPassword: _confirmPassword, ...registerData } = userData;

        // APIコール
        const response = await authService.register(registerData);

        // ストアに保存
        storeLogin(response.user, response.session);

        // ホームページへリダイレクト
        navigate('/');

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '登録に失敗しました';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [navigate, storeLogin, setLoading, setError],
  );

  /**
   * ログアウト処理
   */
  const logout = useCallback(async () => {
    setLoading(true);

    try {
      // APIコール（エラーは無視）
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // ストアをクリア
      storeLogout();

      // ホームページへリダイレクト（ログインページではなく）
      navigate('/');

      setLoading(false);
    }
  }, [navigate, storeLogout, setLoading]);

  /**
   * 現在のユーザー情報を取得
   */
  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.getCurrentUser();
      // ユーザー情報のみ更新（セッションは維持）
      useAuthStore.getState().setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザー情報の取得に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * パスワードリセット要求
   */
  const requestPasswordReset = useCallback(
    async (email: string) => {
      setLoading(true);
      setError(null);

      try {
        await authService.requestPasswordReset(email);
        return {
          success: true,
          message: 'パスワードリセットメールを送信しました',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'リセット要求に失敗しました';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  // バリデーションエラーをクリア
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    // 状態
    user,
    isAuthenticated,
    isLoading,
    error,
    validationErrors,

    // アクション
    login,
    register,
    logout,
    fetchCurrentUser,
    requestPasswordReset,
    clearValidationErrors,
  };
};

/**
 * 認証状態チェックフック
 */
export const useAuthCheck = (): {
  isAuthenticated: boolean;
  isGuest: boolean;
} => {
  const { checkAuth } = useAuthStore();

  // コンポーネントマウント時に認証状態をチェック
  const isValidAuth = checkAuth();

  return {
    isAuthenticated: isValidAuth,
    isGuest: !isValidAuth,
  };
};
