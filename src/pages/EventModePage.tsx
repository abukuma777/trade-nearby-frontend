/**
 * イベントマッチング検索ページ
 * イベント会場での即交換相手を検索
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventTradeStore } from '../stores/eventTradeStore';
import EventMatchingModal from '../components/trade/EventMatchingModal';

const EventModePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    loading,
    error,
    fetchActiveEvents,
    clearError,
  } = useEventTradeStore();

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState<boolean>(false);

  // イベント一覧取得
  useEffect(() => {
    fetchActiveEvents();
    return () => clearError();
  }, []);

  const handleOpenMatching = () => {
    if (!selectedEventId) {
      return;
    }
    setIsMatchingModalOpen(true);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🎪 イベントモード</h1>
          <p className="text-gray-600 mb-6">
            イベント会場での即交換相手を検索できます。マッチング機能で効率的に交換相手を見つけましょう。
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* メインカード */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* アクション選択 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">イベントで何をしますか？</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* 投稿作成カード */}
              <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors cursor-pointer"
                   onClick={() => navigate('/create-trade-post')}>
                <h3 className="text-lg font-bold text-blue-600 mb-3">📝 投稿を作成</h3>
                <p className="text-sm text-gray-600 mb-4">
                  譲渡・求めるアイテムを投稿して、他のユーザーからのリクエストを待ちます
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  投稿画面へ
                </button>
              </div>

              {/* マッチング検索カード */}
              <div className="border-2 border-orange-200 rounded-lg p-6 hover:border-orange-400 transition-colors">
                <h3 className="text-lg font-bold text-orange-600 mb-3">⚡ マッチング検索</h3>
                <p className="text-sm text-gray-600 mb-4">
                  条件を入力して、マッチする投稿を検索し、すぐにチャットを開始できます
                </p>
                <div className="text-sm text-gray-500">
                  ↓ 下でイベントを選択してください
                </div>
              </div>
            </div>
          </div>

          {/* マッチング検索セクション */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ マッチング検索</h2>
            
            {/* イベント選択 */}
            <div className="mb-6">
              <label htmlFor="event_select" className="block text-sm font-medium text-gray-700 mb-2">
                イベントを選択 <span className="text-red-500">*</span>
              </label>
              <select
                id="event_select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                disabled={loading}
              >
                <option value="">イベントを選択してください</option>
                {events.map((event) => {
                  const startDate = new Date(event.start_date).toLocaleDateString('ja-JP');
                  const endDate = new Date(event.end_date).toLocaleDateString('ja-JP');
                  const dateStr = startDate === endDate ? startDate : `${startDate}〜${endDate}`;
                  return (
                    <option key={event.id} value={event.id}>
                      {event.name} - {dateStr} ({event.venue})
                    </option>
                  );
                })}
              </select>
              {!selectedEventId && (
                <p className="mt-2 text-sm text-gray-500">
                  イベントを選択すると、そのイベントの投稿を検索できます
                </p>
              )}
            </div>

            {/* マッチング検索ボタン */}
            <button
              onClick={handleOpenMatching}
              disabled={!selectedEventId || loading}
              className="w-full px-6 py-4 bg-orange-600 text-white text-lg font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              ⚡ マッチング検索を開く
            </button>

            {/* 選択中のイベント情報 */}
            {selectedEvent && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedEvent.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📅 {new Date(selectedEvent.start_date).toLocaleDateString('ja-JP')} 〜 {new Date(selectedEvent.end_date).toLocaleDateString('ja-JP')}</p>
                  <p>📍 {selectedEvent.venue}</p>
                  {selectedEvent.artist && <p>🎤 {selectedEvent.artist}</p>}
                </div>
              </div>
            )}
          </div>

          {/* その他の選択肢 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">その他の機能</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/trade-posts')}
                className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                📋 すべての交換投稿を見る
              </button>
              {selectedEventId && (
                <button
                  onClick={() => navigate(`/events/${selectedEventId}`)}
                  className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  🎪 このイベントの投稿一覧を見る
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* マッチングモーダル */}
      {selectedEvent && (
        <EventMatchingModal
          isOpen={isMatchingModalOpen}
          onClose={() => setIsMatchingModalOpen(false)}
          eventId={selectedEventId}
          eventName={selectedEvent.name}
        />
      )}
    </div>
  );
};

export default EventModePage;
