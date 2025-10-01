import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { commentService, Comment } from '../../services/commentService';
import { useAuthStore } from '../../stores/authStore';

import CommentForm from './CommentForm';

interface CommentSectionProps {
  postId: string;
  postUserId: string;
  postStatus: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  postUserId,
  postStatus,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // コメント一覧を取得
  const fetchComments = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentService.getCommentsByPostId(postId);
      setComments(data);
    } catch (err) {
      setError('コメントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void fetchComments();
  }, [postId, fetchComments]);

  // 新しいコメントを追加
  const handleCommentAdded = (newComment: Comment): void => {
    setComments((prev) => [...prev, newComment]);
  };

  // コメントアバター表示
  const CommentAvatar = ({ comment }: { comment: Comment }): JSX.Element => {
    if (comment.user?.avatar_url) {
      return (
        <img
          src={comment.user.avatar_url}
          alt={comment.user.display_name || comment.user.username}
          className="h-10 w-10 rounded-full object-cover"
        />
      );
    }

    // デフォルトアバター
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-semibold text-white">
        {(comment.user?.display_name ||
          comment.user?.username ||
          '?')[0].toUpperCase()}
      </div>
    );
  };

  // 交換提案の承認/拒否処理
  const handleAcceptOffer = async (commentId: string): Promise<void> => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('この交換提案を承認して取引を開始しますか？')) {return;}

    try {
      const result = await commentService.acceptOffer(postId, commentId);
      if (result.chatRoomId) {
        // 取引チャット画面へ遷移
        navigate(`/chat/${result.chatRoomId}`);
      } else {
        // コメントを再取得
        await fetchComments();
        // eslint-disable-next-line no-alert
        alert('交換を承認しました！');
      }
    } catch (err) {
      setError('交換提案の承認に失敗しました');
    }
  };

  const handleRejectOffer = async (commentId: string): Promise<void> => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('この交換提案を拒否しますか？')) {return;}

    try {
      await commentService.rejectOffer(postId, commentId);
      // コメントを更新
      await fetchComments();
      // eslint-disable-next-line no-alert
      alert('交換提案を拒否しました');
    } catch (err) {
      setError('交換提案の拒否に失敗しました');
    }
  };

  // 交換提案コメントの表示
  const OfferBadge = ({
    comment,
  }: {
    comment: Comment;
  }): JSX.Element | null => {
    if (!comment.is_offer || !comment.related_post) {return null;}

    const isPostOwner = user?.id === postUserId;
    const isOfferPending =
      comment.offer_status === 'pending' || !comment.offer_status;

    return (
      <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
            交換提案
          </span>
          <span className="text-xs text-gray-500">
            以下のアイテムとの交換を提案しています
          </span>
        </div>
        <div className="flex items-center gap-4">
          {comment.related_post.give_item_images?.[0] && (
            <img
              src={comment.related_post.give_item_images[0].url}
              alt={comment.related_post.give_item}
              className="h-16 w-16 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <div className="text-sm">
              <span className="font-medium">譲: </span>
              <span className="text-gray-700">
                {comment.related_post.give_item}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">求: </span>
              <span className="text-gray-700">
                {comment.related_post.want_item}
              </span>
            </div>
          </div>
        </div>

        {/* 投稿者のみ承認/拒否ボタンを表示 */}
        {isPostOwner && isOfferPending && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => void handleAcceptOffer(comment.id)}
              className="rounded bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-700"
            >
              承認して取引開始
            </button>
            <button
              onClick={() => void handleRejectOffer(comment.id)}
              className="rounded bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
            >
              拒否
            </button>
          </div>
        )}

        {/* ステータス表示 */}
        {!isOfferPending && (
          <div className="mt-3">
            {comment.offer_status === 'accepted' && (
              <span className="text-sm font-medium text-green-600">
                ✓ 承認済み
              </span>
            )}
            {comment.offer_status === 'rejected' && (
              <span className="text-sm font-medium text-red-600">
                ✗ 拒否済み
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-6 rounded-lg bg-white p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-24 rounded bg-gray-200" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="mb-2 h-3 w-32 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="comment-section" className="mt-6 rounded-lg bg-white shadow-lg">
      <div className="border-b p-6">
        <h2 className="text-lg font-bold text-gray-900">
          コメント ({comments.length})
        </h2>
      </div>

      {/* コメント一覧 */}
      <div className="p-6">
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</div>
        )}

        {comments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            まだコメントがありません
          </div>
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
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {comment.user?.display_name ||
                        comment.user?.username ||
                        '名無しユーザー'}
                    </span>
                    {comment.user_id === postUserId && (
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                        投稿者
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'M月d日 HH:mm', {
                        locale: ja,
                      })}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-gray-700">
                    {comment.content}
                  </p>

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
        <div className="border-t bg-gray-50 p-6">
          {isAuthenticated ? (
            <CommentForm
              postId={postId}
              postUserId={postUserId}
              onCommentAdded={handleCommentAdded}
              currentUserId={user?.id}
            />
          ) : (
            <div className="py-4 text-center">
              <p className="mb-3 text-gray-600">
                コメントを投稿するにはログインが必要です
              </p>
              <a
                href="/login"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
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
