/**
 * チャットルーム一覧コンポーネント
 */

import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

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

interface ApiResponse {
  success: boolean;
  data?: ChatRoom[];
  message?: string;
}

interface TradeChatListProps {
  status?: 'active' | 'completed';
}

const TradeChatList: React.FC<TradeChatListProps> = ({ status = 'active' }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // authStoreからユーザー情報を取得
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  useEffect(() => {
    const loadChatRooms = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<ApiResponse>(
          '/trade-chat/rooms/my',
        );

        if (response.data.success && response.data.data) {
          const rooms = response.data.data;
          // statusに応じてフィルタリング
          const filteredRooms = rooms.filter((room) => room.status === status);
          setChatRooms(filteredRooms);
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

    void loadChatRooms();
  }, [status]); // statusが変わったら再読み込み

  // 相手のユーザー情報を取得
  const getOtherUser = (room: ChatRoom): User | undefined => {
    if (!currentUserId) {return undefined;}

    if (room.user1_id === currentUserId) {
      return room.user2;
    } else {
      return room.user1;
    }
  };

  // 自分の投稿と相手の投稿を取得
  const getMyPost = (room: ChatRoom): TradePost | undefined => {
    if (!currentUserId) {return undefined;}

    if (room.user1_id === currentUserId) {
      return room.post1;
    } else {
      return room.post2;
    }
  };

  const getOtherPost = (room: ChatRoom): TradePost | undefined => {
    if (!currentUserId) {return undefined;}

    if (room.user1_id === currentUserId) {
      return room.post2;
    } else {
      return room.post1;
    }
  };

  // ステータスバッジの表示
  const getStatusBadge = (roomStatus: string): JSX.Element => {
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
        className={`rounded-full px-2 py-1 text-xs font-medium ${styles[roomStatus as keyof typeof styles] || styles.active}`}
      >
        {labels[roomStatus as keyof typeof labels] || roomStatus}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={(): void => {
            const loadChatRooms = async (): Promise<void> => {
              try {
                setIsLoading(true);
                setError(null);
                const response = await apiClient.get<ApiResponse>(
                  '/trade-chat/rooms/my',
                );
                if (response.data.success && response.data.data) {
                  const rooms = response.data.data;
                  const filteredRooms = rooms.filter(
                    (room) => room.status === status,
                  );
                  setChatRooms(filteredRooms);
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
            void loadChatRooms();
          }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 py-12 text-center">
        <p className="text-gray-500">
          {status === 'completed'
            ? '完了した取引はありません'
            : '進行中の取引チャットはありません'}
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

        // ユーザー名の取得を改善
        const getUserName = (): string => {
          if (otherUser?.display_name) {return otherUser.display_name;}
          if (otherUser?.username) {return otherUser.username;}
          if (otherUser?.name) {return otherUser.name;}
          if (otherUser?.id) {return `ユーザー${otherUser.id.slice(-4)}`;}
          return '不明なユーザー';
        };

        return (
          <Link
            key={room.id}
            to={`/chat/${room.id}`}
            className="block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* ヘッダー */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {otherUser?.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={getUserName()}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                    <span className="font-semibold text-gray-600">
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
            <div className="grid gap-4 md:grid-cols-2">
              {/* 自分の投稿 */}
              <div className="rounded-lg border bg-gray-50 p-3">
                <h4 className="mb-2 text-xs font-medium text-gray-600">
                  あなたの投稿
                </h4>
                {myPost ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">譲)</span>
                      <span className="text-sm font-medium">
                        {myPost.give_item}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">求)</span>
                      <span className="text-sm font-medium">
                        {myPost.want_item}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">投稿情報なし</p>
                )}
              </div>

              {/* 相手の投稿 */}
              <div className="rounded-lg border bg-gray-50 p-3">
                <h4 className="mb-2 text-xs font-medium text-gray-600">
                  相手の投稿
                </h4>
                {otherPost ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">譲)</span>
                      <span className="text-sm font-medium">
                        {otherPost.give_item}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">求)</span>
                      <span className="text-sm font-medium">
                        {otherPost.want_item}
                      </span>
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
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
