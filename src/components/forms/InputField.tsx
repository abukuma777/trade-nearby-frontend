/**
 * 入力フィールドコンポーネント
 * 再利用可能なフォーム入力フィールド
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string | string[];
  required?: boolean;
  icon?: React.ReactNode;
}

/**
 * 入力フィールドコンポーネント
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, required, icon, className = '', ...props }, ref) => {
    // ヘルパーテキストを配列として処理
    const helperTextLines = Array.isArray(helperText) ? helperText : helperText ? [helperText] : [];

    return (
      <div className="mb-4">
        {/* ラベル */}
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* ヘルパーテキスト（入力フィールドの前に表示） */}
        {helperTextLines.length > 0 && !error && (
          <div id={`${props.id}-helper`} className="mb-2 text-xs text-gray-500">
            {helperTextLines.map((line) => (
              <div
                key={`helper-${line}`}
                className={line.startsWith('※') ? 'text-orange-600 font-medium mt-1' : ''}
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* 入力フィールド */}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            required={required}
            className={`
              block w-full rounded-md shadow-sm
              ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
              ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
              focus:outline-none focus:ring-1
              disabled:bg-gray-50 disabled:text-gray-500
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
        </div>

        {/* エラーメッセージ */}
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = 'InputField';
