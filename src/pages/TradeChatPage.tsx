/**
 * 取引チャットページ
 * trade_chat_roomsテーブルを使用した取引専用チャット
 */

import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader,
  Package,
} from 'lucide-react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  tradeChatService,
  ChatRoom,
  ChatMessage,
} from '@/services/tradeChatService';
import { useAuthStore } from '@/stores/authStore';

const TradeChatPage: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompletingTransaction, setIsCompletingTransaction] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // メッセージをリロード
  const loadMessages = useCallback(async (): Promise<void> => {
    if (!chatRoomId) {
      return;
    }
    try {
      const messagesData = await tradeChatService.getMessages(chatRoomId);
      setMessages(messagesData);
    } catch (err) {
      console.error('メッセージ更新エラー:', err);
    }
  }, [chatRoomId]);

  // チャットルーム情報とメッセージを取得
  useEffect(() => {
    if (!chatRoomId) {
      return;
    }

    const loadChatRoom = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // チャットルーム情報を取得
        const roomData = await tradeChatService.getChatRoomById(chatRoomId);
        /* eslint-disable no-console */
        console.log('[DEBUG Frontend] chatRoom data received:', roomData);
        console.log('[DEBUG Frontend] user1:', roomData.user1);
        console.log('[DEBUG Frontend] user2:', roomData.user2);
        console.log('[DEBUG Frontend] post1:', roomData.post1);
        console.log('[DEBUG Frontend] post2:', roomData.post2);
        /* eslint-enable no-console */
        setChatRoom(roomData);

        // メッセージを取得
        const messagesData = await tradeChatService.getMessages(chatRoomId);
        setMessages(messagesData);
      } catch (err) {
        console.error('チャットルーム読み込みエラー:', err);
        setError('チャットルームの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    void loadChatRoom();

    // 定期的にメッセージを更新（ポーリング）
    const interval = setInterval(() => {
      if (!document.hidden) {
        void loadMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatRoomId, loadMessages]);

  // メッセージ送信
  const handleSendMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!newMessage.trim() || !chatRoomId || isSending) {
      return;
    }

    try {
      setIsSending(true);
      await tradeChatService.sendMessage(chatRoomId, newMessage.trim());
      setNewMessage('');
      await loadMessages();

      // スクロールを最下部へ
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError('メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  // 取引を完了
  const handleCompleteTransaction = async (): Promise<void> => {
    if (!chatRoomId || isCompletingTransaction) {
      return;
    }

    setIsCompletingTransaction(true);
    try {
      await tradeChatService.completeTransaction(chatRoomId);
      navigate('/trade-posts/my');
    } catch (err) {
      console.error('取引完了エラー:', err);
      setError('取引の完了に失敗しました');
    } finally {
      setIsCompletingTransaction(false);
    }
  };

  // スクロールを最下部へ
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ローディング
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  // エラー
  if (error || !chatRoom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="mb-2 text-2xl font-bold text-red-600">エラー</h2>
          <p className="mb-4 text-red-600">
            {error || 'チャットルームが見つかりません'}
          </p>
          <button
            onClick={() => navigate('/trade-posts/my')}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            投稿一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // 相手ユーザーを判定
  const isUser1 = user?.id === chatRoom.user1_id;
  const otherUser = isUser1 ? chatRoom.user2 : chatRoom.user1;
  const myPost = isUser1 ? chatRoom.post1 : chatRoom.post2;
  const otherPost = isUser1 ? chatRoom.post2 : chatRoom.post1;

  /* eslint-disable no-console */
  console.log('[DEBUG Frontend] Current user id:', user?.id);
  console.log('[DEBUG Frontend] isUser1:', isUser1);
  console.log('[DEBUG Frontend] otherUser:', otherUser);
  console.log('[DEBUG Frontend] myPost:', myPost);
  console.log('[DEBUG Frontend] otherPost:', otherPost);
  /* eslint-enable no-console */

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/trade-posts/my')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>

            {/* 相手ユーザー情報 */}
            <div className="flex items-center gap-2">
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.display_name || otherUser.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                  <span className="font-semibold text-gray-600">
                    {(otherUser?.display_name ||
                      otherUser?.username)?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {otherUser?.display_name ||
                    otherUser?.username ||
                    '不明なユーザー'}
                </p>
                <p className="text-xs text-gray-500">取引チャット</p>
              </div>
            </div>
          </div>

          {/* ステータス表示 */}
          {chatRoom.status === 'active' ? (
            showCompleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">本当に完了？</span>
                <button
                  onClick={() => void handleCompleteTransaction()}
                  disabled={isCompletingTransaction}
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isCompletingTransaction ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  はい
                </button>
                <button
                  onClick={(): void => setShowCompleteConfirm(false)}
                  className="rounded-lg bg-gray-400 px-3 py-1.5 text-sm text-white hover:bg-gray-500"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={(): void => setShowCompleteConfirm(true)}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
              >
                <CheckCircle size={16} />
                取引完了
              </button>
            )
          ) : (
            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
              取引完了済み
            </span>
          )}
        </div>

        {/* 取引アイテム情報 */}
        <div className="flex gap-2 px-4 pb-3 text-sm">
          <div className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-blue-700">
            <Package size={14} />
            <span>譲: {myPost?.give_item}</span>
          </div>
          <span className="flex items-center text-gray-400">⇔</span>
          <div className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-green-700">
            <Package size={14} />
            <span>求: {otherPost?.give_item}</span>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div
        className="flex-1 overflow-y-auto bg-gray-50 p-4"
        style={{ height: 'calc(100vh - 300px)' }}
      >
        {messages.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">メッセージはまだありません</p>
            <p className="mt-2 text-sm text-gray-400">
              最初のメッセージを送ってみましょう
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isMyMessage = message.sender_id === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                      isMyMessage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 bg-white'
                    }`}
                  >
                    <p
                      className={`text-sm ${isMyMessage ? 'text-white' : 'text-gray-900'}`}
                    >
                      {message.message}
                    </p>
                    <p
                      className={`mt-1 text-xs ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}
                    >
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* メッセージ入力エリア */}
      {chatRoom.status === 'active' && (
        <div className="border-t bg-white p-4">
          <form
            onSubmit={(e) => void handleSendMessage(e)}
            className="flex gap-2"
          >
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e): void => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage(e);
                }
              }}
              placeholder="メッセージを入力..."
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TradeChatPage;
