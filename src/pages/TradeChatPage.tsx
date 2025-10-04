/**
 * 取引チャットページ
 * trade_chat_roomsテーブルを使用した取引専用チャット
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
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
import { tradeChatService } from '@/services/tradeChatService';

// 型定義
interface ChatRoom {
  id: string;
  post1_id: string;
  post2_id: string;
  user1_id: string;
  user2_id: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  post1?: TradePost;
  post2?: TradePost;
  user1?: UserInfo;
  user2?: UserInfo;
  messages?: ChatMessage[];
}

interface TradePost {
  id: string;
  give_item: string;
  want_item: string;
  give_item_images?: Array<{ url: string }>;
  want_item_images?: Array<{ url: string }>;
  status: 'active' | 'trading' | 'completed';
}

interface UserInfo {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: UserInfo;
}

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // チャットルーム情報とメッセージを取得
  useEffect(() => {
    if (!chatRoomId) return;

    const loadChatRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // チャットルーム情報を取得
        const roomData = await tradeChatService.getChatRoomById(chatRoomId);
        setChatRoom(roomData);

        // メッセージを取得
        const messagesData = await tradeChatService.getMessages(chatRoomId);
        // eslint-disable-next-line no-console
        console.log('取得したメッセージ:', messagesData);
        setMessages(messagesData);
      } catch (err) {
        console.error('チャットルーム読み込みエラー:', err);
        setError('チャットルームの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadChatRoom();

    // 定期的にメッセージを更新（ポーリング）
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatRoomId]);

  // メッセージをリロード
  const loadMessages = async () => {
    if (!chatRoomId) return;
    try {
      const messagesData = await tradeChatService.getMessages(chatRoomId);
      // eslint-disable-next-line no-console
      console.log('メッセージ更新:', messagesData);
      setMessages(messagesData);
    } catch (err) {
      console.error('メッセージ更新エラー:', err);
    }
  };

  // メッセージ送信
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !chatRoomId || isSending) return;

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
  const handleCompleteTransaction = async () => {
    if (!chatRoomId || !window.confirm('取引を完了しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await tradeChatService.completeTransaction(chatRoomId);
      alert('取引が完了しました！');
      navigate('/trade-posts/my');
    } catch (err) {
      console.error('取引完了エラー:', err);
      setError('取引の完了に失敗しました');
    }
  };

  // スクロールを最下部へ
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('現在のメッセージ数:', messages.length, messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ローディング
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  // エラー
  if (error || !chatRoom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-600 mb-2">エラー</h2>
          <p className="text-red-600 mb-4">{error || 'チャットルームが見つかりません'}</p>
          <button
            onClick={() => navigate('/trade-posts/my')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
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
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {(otherUser?.display_name || otherUser?.username)?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {otherUser?.display_name || otherUser?.username || '不明なユーザー'}
                </p>
                <p className="text-xs text-gray-500">取引チャット</p>
              </div>
            </div>
          </div>

          {/* ステータス表示 */}
          {chatRoom.status === 'active' ? (
            <button
              onClick={handleCompleteTransaction}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
            >
              <CheckCircle size={16} />
              取引完了
            </button>
          ) : (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg">
              取引完了済み
            </span>
          )}
        </div>

        {/* 取引アイテム情報 */}
        <div className="px-4 pb-3 flex gap-2 text-sm">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
            <Package size={14} />
            <span>譲: {myPost?.give_item}</span>
          </div>
          <span className="flex items-center text-gray-400">⇔</span>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
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
          <div className="text-center py-8">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">メッセージはまだありません</p>
            <p className="text-sm text-gray-400 mt-2">最初のメッセージを送ってみましょう</p>
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
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isMyMessage ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className={`text-sm ${isMyMessage ? 'text-white' : 'text-gray-900'}`}>
                      {message.message}
                    </p>
                    <p
                      className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}
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
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TradeChatPage;
