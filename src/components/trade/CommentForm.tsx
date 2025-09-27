import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/commentService';

interface CommentFormProps {
  postId: string;
  postUserId: string;  // 投稿者のIDを追加
  onCommentAdded: (comment: any) => void;
  currentUserId?: string;
}

interface UserPost {
  id: string;
  give_item: string;
  want_item: string;
  give_item_images?: Array<{ url: string }>;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, postUserId, onCommentAdded, currentUserId }) => {
  const [content, setContent] = useState('');
  const [isOffer, setIsOffer] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // 自分の投稿かどうかを判定
  const isOwnPost = currentUserId === postUserId;

  // ユーザーのアクティブな投稿を取得
  useEffect(() => {
    if (isOffer && currentUserId) {
      fetchUserPosts();
    }
  }, [isOffer, currentUserId]);

  const fetchUserPosts = async () => {
    if (!currentUserId) return;

    try {
      setLoadingPosts(true);
      const posts = await commentService.getUserActivePosts(currentUserId);
      setUserPosts(posts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('コメントを入力してください');
      return;
    }

    if (isOffer && !selectedPostId) {
      setError('交換提案するアイテムを選択してください');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentData = {
        content: content.trim(),
        is_offer: isOffer,
        related_post_id: isOffer ? selectedPostId : undefined,
      };

      const newComment = await commentService.createComment(postId, commentData);
      
      // フォームをリセット
      setContent('');
      setIsOffer(false);
      setSelectedPostId('');
      
      // 親コンポーネントに通知
      onCommentAdded(newComment);
    } catch (err: any) {
      setError(err.message || 'コメントの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 自分の投稿の場合のメッセージ */}
      {isOwnPost && (
        <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
          💡 あなたの投稿です。コメントで返信できます。
        </div>
      )}

      {/* コメント入力欄 */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isOwnPost ? "返信を入力..." : "コメントを入力..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={submitting}
        />
      </div>

      {/* 交換提案チェックボックス（他人の投稿の場合のみ表示） */}
      {currentUserId && !isOwnPost && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is-offer"
            checked={isOffer}
            onChange={(e) => {
              setIsOffer(e.target.checked);
              if (!e.target.checked) {
                setSelectedPostId('');
              }
            }}
            disabled={submitting}
            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is-offer" className="text-sm text-gray-700 cursor-pointer">
            自分のアイテムと交換を提案する
          </label>
        </div>
      )}

      {/* 交換提案用のアイテム選択 */}
      {isOffer && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-gray-700 mb-3">
            交換に出すアイテムを選択してください
          </p>
          
          {loadingPosts ? (
            <div className="text-center py-3 text-gray-500">
              読み込み中...
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-3 text-gray-500">
              交換可能なアイテムがありません。
              <br />
              <a href="/trade-posts/create" className="text-blue-600 hover:underline">
                新しく投稿を作成する
              </a>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {userPosts.map((post) => (
                <label
                  key={post.id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    selectedPostId === post.id
                      ? 'bg-white border-2 border-blue-500'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="related_post"
                    value={post.id}
                    checked={selectedPostId === post.id}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                    disabled={submitting}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex items-center gap-3 flex-1">
                    {post.give_item_images?.[0] && (
                      <img
                        src={post.give_item_images[0].url}
                        alt={post.give_item}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        <span className="font-medium">譲: </span>
                        {post.give_item}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        <span className="font-medium">求: </span>
                        {post.want_item}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            submitting || !content.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {submitting ? '送信中...' : isOffer ? '交換を提案' : 'コメントを投稿'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
