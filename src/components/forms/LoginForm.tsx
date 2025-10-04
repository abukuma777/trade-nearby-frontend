/**
 * ログインフォームコンポーネント
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { InputField } from './InputField';

import { useAuth } from '@/hooks/useAuth';

export const LoginForm: React.FC = () => {
  const { login, isLoading, error, validationErrors, clearValidationErrors } = useAuth();

  // フォームの状態
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 入力変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // エラーをクリア
    if (validationErrors[name as keyof typeof validationErrors]) {
      clearValidationErrors();
    }
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴ（ホームリンク） */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-3xl font-bold text-blue-600">Trade</span>
            <span className="text-3xl font-bold text-gray-800">Nearby</span>
          </Link>
        </div>

        {/* ヘッダー */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウントにログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            または{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              新規アカウントを作成
            </Link>
          </p>
        </div>

        {/* フォーム */}
        <form className="mt-8 space-y-6" onSubmit={(e) => void handleSubmit(e)}>
          <div className="bg-white p-8 rounded-lg shadow">
            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* メールアドレス */}
            <InputField
              id="email"
              name="email"
              type="email"
              label="メールアドレス"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              placeholder="example@email.com"
            />

            {/* パスワード */}
            <div className="relative">
              <InputField
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="パスワード"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={validationErrors.password}
                placeholder="••••••••"
              />

              {/* パスワード表示切り替えボタン */}
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '隠す' : '表示'}
              </button>
            </div>

            {/* オプション */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  ログイン状態を保持
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  パスワードをお忘れですか？
                </Link>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full flex justify-center py-2 px-4 
                  border border-transparent rounded-md 
                  shadow-sm text-sm font-medium text-white 
                  ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }
                `}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
