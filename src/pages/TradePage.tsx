/**
 * 取引管理ページ
 * 取引中・取引完了の管理
 */

import React, { useEffect, useState } from 'react';

import TradeChatList from '@/components/trade/TradeChatList';
import { useTradeStore } from '@/stores/tradeStore';

// ========================================
// メインコンポーネント
// ========================================

const TradePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trading' | 'completed'>(
    'trading',
  );

  const { error, successMessage, clearMessages } = useTradeStore();

  // メッセージクリア
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, clearMessages]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">取引管理</h1>
        <p className="text-gray-600">
          進行中の取引と完了した取引を管理できます
        </p>
      </div>

      {/* メッセージ表示 */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {/* タブ */}
      <div className="mb-6 border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('trading')}
            className={`px-1 pb-3 font-medium transition-colors ${
              activeTab === 'trading'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            取引中
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-1 pb-3 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            取引完了
          </button>
        </div>
      </div>

      {/* 取引一覧 */}
      {activeTab === 'trading' ? (
        // 取引中タブの場合
        <TradeChatList status="active" />
      ) : (
        // 取引完了タブの場合
        <TradeChatList status="completed" />
      )}
    </div>
  );
};

export default TradePage;
