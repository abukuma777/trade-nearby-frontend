/**
 * チャットルーム一覧コンポーネント
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import apiClient from '@/services/api';

interface User {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  name?: string;
}

interface TradePost {
  id: string;
  give_item: string;
  want_item: string;
  give_item_images?: Array<{ url: string }>;
}

interface ChatRoom {
  id: string;
  post1_id: string;
  post2_id: string;
  user1_id: string;
  user2_id: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  post1?: TradePost;
  post2?: TradePost;
  user1?: User;
  user2?: User;
}

interface TradeChatListProps {
  status?: 'active' | 'completed';
}

const TradeChatList: React.FC<TradeChatListProps> = ({ status = 'active' }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーIDの取得方法を改善
  const getUserId = () => {
    // さまざまな方法でユーザーIDを取得試行
    const attempts = [];

    // 1. localStorageから直接取得
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      attempts.push({ source: 'localStorage.userId', value: storedUserId });
      console.log('UserID from localStorage:', storedUserId);
      return storedUserId;
    }

    // 2. auth情報から取得
    const authDataStr = localStorage.getItem('auth');
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        const possibleId =
          authData.user?.id || authData.user?.sub || authData.userId || authData.sub;
        if (possibleId) {
          attempts.push({ source: 'auth data', value: possibleId });
          console.log('UserID from auth data:', possibleId, 'Full auth:', authData);
          return possibleId;
        }
      } catch (e) {
        console.error('認証情報のパースに失敗:', e);
      }
    }

    // 3. auth-storageから取得 (Auth0用)
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      try {
        const authStorage = JSON.parse(authStorageStr);
        const possibleId = authStorage.state?.user?.id || authStorage.state?.user?.sub;
        if (possibleId) {
          attempts.push({ source: 'auth-storage', value: possibleId });
          console.log('UserID from auth-storage:', possibleId);
          return possibleId;
        }
      } catch (e) {
        console.error('auth-storageのパースに失敗:', e);
      }
    }

    console.warn('ユーザーIDが取得できませんでした。試行:', attempts);
    console.log('localStorageの全キー:', Object.keys(localStorage));

    return null;
  };

  const currentUserId = getUserId();

  useEffect(() => {
    loadChatRooms();
  }, [status]); // statusが変わったら再読み込み

  const loadChatRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get('/trade-chat/rooms/my');

      if (response.data.success) {
        const rooms = response.data.data || [];
        // statusに応じてフィルタリング
        const filteredRooms = rooms.filter((room: ChatRoom) => room.status === status);
        setChatRooms(filteredRooms);

        // デバッグ情報
        console.log('チャットルーム一覧:', filteredRooms);
        console.log('現在のユーザーID:', currentUserId);
        if (filteredRooms.length > 0) {
          console.log('最初のルーム詳細:', {
            room: filteredRooms[0],
            user1: filteredRooms[0].user1,
            user2: filteredRooms[0].user2,
            user1_id: filteredRooms[0].user1_id,
            user2_id: filteredRooms[0].user2_id,
          });
        }
      } else {
        setError('チャットルームの取得に失敗しました');
      }
    } catch (err) {
      console.error('チャットルーム取得エラー:', err);
      setError('チャットルームの取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 相手のユーザー情報を取得
  const getOtherUser = (room: ChatRoom): User | undefined => {
    if (!currentUserId) return undefined;

    if (room.user1_id === currentUserId) {
      return room.user2;
    } else {
      return room.user1;
    }
  };

  // 自分の投稿と相手の投稿を取得
  const getMyPost = (room: ChatRoom): TradePost | undefined => {
    if (!currentUserId) return undefined;

    if (room.user1_id === currentUserId) {
      return room.post1;
    } else {
      return room.post2;
    }
  };

  const getOtherPost = (room: ChatRoom): TradePost | undefined => {
    if (!currentUserId) return undefined;

    if (room.user1_id === currentUserId) {
      return room.post2;
    } else {
      return room.post1;
    }
  };

  // ステータスバッジの表示
  const getStatusBadge = (roomStatus: string) => {
    const styles = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '取引中',
      completed: '完了',
      cancelled: 'キャンセル',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[roomStatus as keyof typeof styles] || styles.active}`}
      >
        {labels[roomStatus as keyof typeof labels] || roomStatus}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadChatRooms}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          {status === 'completed' ? '完了した取引はありません' : '進行中の取引チャットはありません'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chatRooms.map((room) => {
        const otherUser = getOtherUser(room);
        const myPost = getMyPost(room);
        const otherPost = getOtherPost(room);

        // デバッグ: 各ルームのユーザー情報を確認
        console.log(`Room ${room.id}:`, {
          currentUserId,
          room_user1_id: room.user1_id,
          room_user2_id: room.user2_id,
          otherUser,
          room_user1: room.user1,
          room_user2: room.user2,
        });

        // ユーザー名の取得を改善
        const getUserName = () => {
          if (otherUser?.display_name) return otherUser.display_name;
          if (otherUser?.username) return otherUser.username;
          if (otherUser?.name) return otherUser.name;
          if (otherUser?.id) return `ユーザー${otherUser.id.slice(-4)}`;
          return '不明なユーザー';
        };

        return (
          <Link
            key={room.id}
            to={`/chat/${room.id}`}
            className="block bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* ヘッダー */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {otherUser?.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={getUserName()}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {getUserName()[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{getUserName()}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(room.updated_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </p>
                </div>
              </div>
              {getStatusBadge(room.status)}
            </div>

            {/* 交換内容 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 自分の投稿 */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <h4 className="text-xs font-medium text-gray-600 mb-2">あなたの投稿</h4>
                {myPost ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">譲)</span>
                      <span className="text-sm font-medium">{myPost.give_item}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">求)</span>
                      <span className="text-sm font-medium">{myPost.want_item}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">投稿情報なし</p>
                )}
              </div>

              {/* 相手の投稿 */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <h4 className="text-xs font-medium text-gray-600 mb-2">相手の投稿</h4>
                {otherPost ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">譲)</span>
                      <span className="text-sm font-medium">{otherPost.give_item}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">求)</span>
                      <span className="text-sm font-medium">{otherPost.want_item}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">投稿情報なし</p>
                )}
              </div>
            </div>

            {/* チャットへのリンクテキスト */}
            {status === 'active' ? (
              <div className="mt-4 flex items-center justify-end text-blue-600">
                <span className="text-sm">チャットを開く</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-end text-gray-500">
                <span className="text-sm">取引完了</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default TradeChatList;
