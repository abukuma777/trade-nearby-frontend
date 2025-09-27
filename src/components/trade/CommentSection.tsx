import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { commentService, Comment } from '../../services/commentService';
import { useAuthStore } from '../../stores/authStore';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  postId: string;
  postUserId: string;
  postStatus: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postUserId, postStatus }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // コメント一覧を取得
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentService.getCommentsByPostId(postId);
      setComments(data);
    } catch (err) {
      setError('コメントの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 新しいコメントを追加
  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment]);
  };

  // コメントアバター表示
  const CommentAvatar = ({ comment }: { comment: Comment }) => {
    if (comment.user?.avatar_url) {
      return (
        <img
          src={comment.user.avatar_url}
          alt={comment.user.display_name || comment.user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    // デフォルトアバター
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
        {(comment.user?.display_name || comment.user?.username || '?')[0].toUpperCase()}
      </div>
    );
  };

  // 交換提案の承認/拒否処理
  const handleAcceptOffer = async (commentId: string) => {
    if (!window.confirm('この交換提案を承認して取引を開始しますか？')) return;

    try {
      const result = await commentService.acceptOffer(postId, commentId);
      if (result.chatRoomId) {
        // 取引チャット画面へ遷移
        navigate(`/chat/${result.chatRoomId}`);
      } else {
        // コメントを再取得
        await fetchComments();
        alert('交換を承認しました！');
      }
    } catch (err) {
      console.error('交換提案の承認に失敗しました:', err);
      setError('交換提案の承認に失敗しました');
    }
  };

  const handleRejectOffer = async (commentId: string) => {
    if (!window.confirm('この交換提案を拒否しますか？')) return;

    try {
      await commentService.rejectOffer(postId, commentId);
      // コメントを更新
      await fetchComments();
      alert('交換提案を拒否しました');
    } catch (err) {
      console.error('交換提案の拒否に失敗しました:', err);
      setError('交換提案の拒否に失敗しました');
    }
  };

  // 交換提案コメントの表示
  const OfferBadge = ({ comment }: { comment: Comment }) => {
    if (!comment.is_offer || !comment.related_post) return null;

    const isPostOwner = user?.id === postUserId;
    const isOfferPending = comment.offer_status === 'pending' || !comment.offer_status;

    return (
      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
            交換提案
          </span>
          <span className="text-xs text-gray-500">以下のアイテムとの交換を提案しています</span>
        </div>
        <div className="flex items-center gap-4">
          {comment.related_post.give_item_images?.[0] && (
            <img
              src={comment.related_post.give_item_images[0].url}
              alt={comment.related_post.give_item}
              className="w-16 h-16 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <div className="text-sm">
              <span className="font-medium">譲: </span>
              <span className="text-gray-700">{comment.related_post.give_item}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">求: </span>
              <span className="text-gray-700">{comment.related_post.want_item}</span>
            </div>
          </div>
        </div>

        {/* 投稿者のみ承認/拒否ボタンを表示 */}
        {isPostOwner && isOfferPending && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleAcceptOffer(comment.id)}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              承認して取引開始
            </button>
            <button
              onClick={() => handleRejectOffer(comment.id)}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              拒否
            </button>
          </div>
        )}

        {/* ステータス表示 */}
        {!isOfferPending && (
          <div className="mt-3">
            {comment.offer_status === 'accepted' && (
              <span className="text-green-600 text-sm font-medium">✓ 承認済み</span>
            )}
            {comment.offer_status === 'rejected' && (
              <span className="text-red-600 text-sm font-medium">✗ 拒否済み</span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="comment-section" className="bg-white rounded-lg shadow-lg mt-6">
      <div className="border-b p-6">
        <h2 className="text-lg font-bold text-gray-900">コメント ({comments.length})</h2>
      </div>

      {/* コメント一覧 */}
      <div className="p-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">まだコメントがありません</div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                {/* アバター */}
                <div className="flex-shrink-0">
                  <CommentAvatar comment={comment} />
                </div>

                {/* コメント本体 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {comment.user?.display_name || comment.user?.username || '名無しユーザー'}
                    </span>
                    {comment.user_id === postUserId && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
                        投稿者
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'M月d日 HH:mm', { locale: ja })}
                    </span>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

                  {/* 交換提案バッジ */}
                  <OfferBadge comment={comment} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* コメント投稿フォーム */}
      {postStatus === 'active' && (
        <div className="border-t p-6 bg-gray-50">
          {isAuthenticated ? (
            <CommentForm
              postId={postId}
              postUserId={postUserId}
              onCommentAdded={handleCommentAdded}
              currentUserId={user?.id}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-3">コメントを投稿するにはログインが必要です</p>
              <a
                href="/login"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ログインする
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
