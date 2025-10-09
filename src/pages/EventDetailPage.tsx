/**
 * イベント専用ページ
 * 特定イベントの投稿一覧とマッチング表示
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEventTradeStore } from '../stores/eventTradeStore';
import EventMatchingModal from '../components/trade/EventMatchingModal';

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const {
    events,
    eventTrades,
    loading,
    error,
    fetchActiveEvents,
    fetchEventTrades,
    clearError,
  } = useEventTradeStore();

  // フィルター状態
  const [filterZone, setFilterZone] = useState<string>('');
  const [filterInstantOnly, setFilterInstantOnly] = useState<boolean>(false);
  
  // モーダル状態
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState<boolean>(false);

  // イベント情報
  const event = events.find((e) => e.id === eventId);

  // 初回ロード
  useEffect(() => {
    if (!eventId) return;

    fetchActiveEvents();
    fetchEventTrades(eventId);

    return () => clearError();
  }, [eventId]);

  // フィルタリング適用
  const filteredTrades = eventTrades.filter((trade) => {
    if (filterZone && trade.zone_code !== filterZone) {
      return false;
    }
    if (filterInstantOnly && !trade.is_instant) {
      return false;
    }
    return true;
  });

  // ゾーンコード一覧取得
  const availableZones = Array.from(
    new Set(eventTrades.map((t) => t.zone_code).filter(Boolean)),
  );

  // カウントダウン計算
  const getTimeRemaining = () => {
    if (!event) return null;

    const now = new Date().getTime();
    const endDate = new Date(event.end_date).getTime();
    const diff = endDate - now;

    if (diff <= 0) return '終了';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `あと${days}日${hours}時間`;
    }
    return `あと${hours}時間`;
  };

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">イベントIDが指定されていません</p>
          <button
            onClick={() => navigate('/event-mode')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            イベント一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* イベントヘッダー */}
        {event && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🎪 {event.name}
                </h1>
                <div className="space-y-1 text-gray-600">
                  <p>
                    📅{' '}
                    {new Date(event.start_date).toLocaleDateString('ja-JP')}
                    {event.start_date !== event.end_date && (
                      <> 〜 {new Date(event.end_date).toLocaleDateString('ja-JP')}</>
                    )}
                  </p>
                  <p>📍 {event.venue}</p>
                  {event.artist && <p>🎤 {event.artist}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {getTimeRemaining()}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setIsMatchingModalOpen(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    ⚡ マッチング検索
                  </button>
                  <button
                    onClick={() => navigate(`/create-trade-post?event_id=${eventId}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    投稿する
                  </button>
                </div>
              </div>
            </div>

            {event.description && (
              <p className="mt-4 text-gray-700">{event.description}</p>
            )}
          </div>
        )}

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">ゾーン:</label>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {availableZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterInstantOnly}
                onChange={(e) => setFilterInstantOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                ⚡ 爆死即交換のみ
              </span>
            </label>

            <div className="ml-auto text-sm text-gray-600">
              {filteredTrades.length}件の投稿
            </div>
          </div>
        </div>

        {/* 投稿一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {filterInstantOnly || filterZone
                ? '該当する投稿が見つかりません'
                : 'まだ投稿がありません'}
            </p>
            <button
              onClick={() => navigate(`/create-trade-post?event_id=${eventId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              最初の投稿をする
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrades.map((trade) => (
              <Link
                key={trade.id}
                to={`/trade-posts/${trade.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                {/* ユーザー情報 */}
                <div className="flex items-center gap-3 mb-4">
                  {trade.user?.avatar_url ? (
                    <img
                      src={trade.user.avatar_url}
                      alt={trade.user.display_name || trade.user.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {(trade.user?.display_name || trade.user?.username || '?')[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {trade.user?.display_name || trade.user?.username || '匿名'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(trade.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>

                {/* 取引内容 */}
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">譲）</span>
                    <span className="ml-2 text-lg font-bold text-gray-900">
                      {trade.give_item}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">求）</span>
                    <span className="ml-2 text-lg font-bold text-blue-600">
                      {trade.want_item}
                    </span>
                  </div>
                </div>

                {/* 詳細情報 */}
                {trade.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {trade.description}
                  </p>
                )}

                {/* バッジ */}
                <div className="flex flex-wrap gap-2">
                  {trade.zone_code && (
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      📍 {trade.zone_code}
                    </span>
                  )}
                  {trade.is_instant && (
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                      ⚡ 爆死即交換
                    </span>
                  )}
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    募集中
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* マッチングモーダル */}
      {event && (
        <EventMatchingModal
          isOpen={isMatchingModalOpen}
          onClose={() => setIsMatchingModalOpen(false)}
          eventId={eventId}
          eventName={event.name}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
