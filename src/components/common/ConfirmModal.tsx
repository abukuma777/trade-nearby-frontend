/**
 * 汎用確認モーダルコンポーネント
 * window.confirmの代替として使用
 */

import { AlertTriangle, Info, XCircle } from 'lucide-react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'info',
  loading = false,
}) => {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading]);

  // ボディのスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // バリアントに応じたスタイルとアイコン
  const getVariantStyles = (): {
    icon: JSX.Element;
    iconBg: string;
    confirmBtn: string;
    confirmBtnHover: string;
  } => {
    switch (variant) {
      case 'danger':
        return {
          icon: <XCircle size={24} />,
          iconBg: 'bg-red-100 text-red-600',
          confirmBtn: 'bg-red-600 text-white',
          confirmBtnHover: 'hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} />,
          iconBg: 'bg-yellow-100 text-yellow-600',
          confirmBtn: 'bg-yellow-600 text-white',
          confirmBtnHover: 'hover:bg-yellow-700',
        };
      default:
        return {
          icon: <Info size={24} />,
          iconBg: 'bg-blue-100 text-blue-600',
          confirmBtn: 'bg-blue-600 text-white',
          confirmBtnHover: 'hover:bg-blue-700',
        };
    }
  };

  const variantStyles = getVariantStyles();

  const handleConfirm = async (): Promise<void> => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirm action failed:', error);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      {/* モーダル本体 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg max-w-md w-full shadow-xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="p-6">
            <div className="flex items-start">
              <div
                className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${variantStyles.iconBg}`}
              >
                {variantStyles.icon}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 whitespace-pre-wrap">{message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`
                w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 
                bg-white border border-gray-300 rounded-md shadow-sm
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={loading}
              className={`
                w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md shadow-sm
                ${variantStyles.confirmBtn} ${variantStyles.confirmBtnHover}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center
              `}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  処理中...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ポータルを使用してbody直下にレンダリング
  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
