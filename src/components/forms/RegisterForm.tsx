/**
 * 登録フォームコンポーネント
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { InputField } from './InputField';

import { useAuth } from '@/hooks/useAuth';

export const RegisterForm: React.FC = () => {
  const { register, isLoading, error, validationErrors, clearValidationErrors } = useAuth();

  // フォームの状態
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    display_name: '', // 表示名を必須項目として追加
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // パスワード強度の計算
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    const hasLength = password.length >= 12;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);

    if (password.length >= 8) {strength += 10;}
    if (password.length >= 12) {strength += 20;}
    if (password.length >= 16) {strength += 10;}
    if (hasLowerCase) {strength += 15;}
    if (hasUpperCase) {strength += 15;}
    if (hasNumbers) {strength += 15;}
    if (hasSymbols) {strength += 15;}

    // 必須条件を満たしていない場合は最大で30%
    if (!hasLength || !hasLowerCase || !hasUpperCase || !hasNumbers || !hasSymbols) {
      return Math.min(strength, 30);
    }

    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const passwordStrengthText =
    passwordStrength < 30
      ? '弱い'
      : passwordStrength < 60
        ? '普通'
        : passwordStrength < 90
          ? '強い'
          : '非常に強い';
  const passwordStrengthColor =
    passwordStrength < 30
      ? 'bg-red-500'
      : passwordStrength < 60
        ? 'bg-yellow-500'
        : passwordStrength < 90
          ? 'bg-blue-500'
          : 'bg-green-500';

  // 入力変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      alert('利用規約に同意してください');
      return;
    }

    await register(formData);
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
            新規アカウント作成
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            すでにアカウントをお持ちですか？{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              ログインはこちら
            </Link>
          </p>
        </div>

        {/* フォーム */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            {/* ユーザー名 */}
            <InputField
              id="username"
              name="username"
              type="text"
              label="ユーザー名"
              required
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={validationErrors.username}
              placeholder="username_123"
              helperText={[
                '英小文字、数字、アンダーバー（_）のみ使用可。3文字以上。',
                '※登録後は変更できません',
              ]}
            />

            {/* 表示名 */}
            <InputField
              id="display_name"
              name="display_name"
              type="text"
              label="表示名"
              required
              autoComplete="name"
              value={formData.display_name}
              onChange={handleChange}
              error={validationErrors.display_name}
              placeholder="山田 太郎"
              helperText={['プロフィールで表示される名前', '※後から変更可能です']}
            />

            {/* パスワード */}
            <div className="relative">
              <InputField
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="パスワード"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={validationErrors.password}
                placeholder="••••••••"
                helperText={[
                  '12文字以上で以下をすべて含む：',
                  '・大文字（A-Z） ・小文字（a-z）',
                  '・数字（0-9） ・記号（!@#$%など）',
                ]}
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

            {/* パスワード強度メーター */}
            {formData.password && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">パスワード強度</span>
                  <span className="text-sm font-medium">{passwordStrengthText}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${passwordStrengthColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                   />
                </div>
              </div>
            )}

            {/* パスワード確認 */}
            <div className="relative">
              <InputField
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="パスワード（確認）"
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={validationErrors.confirmPassword}
                placeholder="••••••••"
              />

              {/* パスワード表示切り替えボタン */}
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '隠す' : '表示'}
              </button>
            </div>

            {/* 利用規約 */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="agree-terms" className="text-gray-900">
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    利用規約
                  </Link>{' '}
                  と{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || !agreeToTerms}
                className={`
                  w-full flex justify-center py-2 px-4 
                  border border-transparent rounded-md 
                  shadow-sm text-sm font-medium text-white 
                  ${
                    isLoading || !agreeToTerms
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }
                `}
              >
                {isLoading ? '登録中...' : 'アカウント作成'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
