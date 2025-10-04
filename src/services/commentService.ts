import { useAuthStore } from '../stores/authStore';

import { API_BASE_URL } from './api.config';

// APIレスポンス用の型定義
interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// ユーザーのアクティブな投稿の型
interface UserActivePost {
  id: string;
  give_item: string;
  want_item: string;
  give_item_images?: Array<{ url: string; is_main?: boolean }>;
  status: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  related_post_id?: string;
  is_offer?: boolean;
  offer_status?: 'pending' | 'accepted' | 'rejected'; // 交換提案のステータス
  created_at: string;
  updated_at?: string;
  user?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  related_post?: {
    id: string;
    give_item: string;
    want_item: string;
    give_item_images?: Array<{ url: string; is_main?: boolean }>;
  };
}

export interface CreateCommentData {
  content: string;
  related_post_id?: string;
  is_offer?: boolean;
}

class CommentService {
  /**
   * 投稿のコメント一覧を取得
   */
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/trade-posts/${postId}/comments`,
      );

      if (!response.ok) {
        throw new Error('コメントの取得に失敗しました');
      }

      const result = (await response.json()) as ApiResponse<Comment[]>;
      return result.data || [];
    } catch (error: unknown) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * コメントを投稿
   */
  async createComment(
    postId: string,
    data: CreateCommentData,
  ): Promise<Comment> {
    try {
      // authストアからアクセストークンを取得
      const accessToken = useAuthStore.getState().getAccessToken();

      if (!accessToken) {
        throw new Error('認証が必要です');
      }

      const response = await fetch(
        `${API_BASE_URL}/trade-posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiResponse<never>;
        throw new Error(errorData.message || 'コメントの投稿に失敗しました');
      }

      const result = (await response.json()) as ApiResponse<Comment>;
      return result.data as Comment;
    } catch (error: unknown) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * ユーザーのアクティブな投稿一覧を取得（交換提案用）
   */
  async getUserActivePosts(userId: string): Promise<UserActivePost[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/active-posts`,
      );

      if (!response.ok) {
        throw new Error('投稿の取得に失敗しました');
      }

      const result = (await response.json()) as ApiResponse<UserActivePost[]>;
      return result.data || [];
    } catch (error: unknown) {
      console.error('Error fetching user active posts:', error);
      throw error;
    }
  }

  /**
   * 交換提案を承認
   */
  async acceptOffer(
    postId: string,
    commentId: string,
  ): Promise<{
    message: string;
    myPostId: string;
    partnerPostId: string;
    chatRoomId?: string;
  }> {
    try {
      const accessToken = useAuthStore.getState().getAccessToken();

      if (!accessToken) {
        throw new Error('認証が必要です');
      }

      const response = await fetch(
        `${API_BASE_URL}/trade-posts/${postId}/comments/${commentId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}), // 空のJSONオブジェクトを送る
        },
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiResponse<never>;
        throw new Error(errorData.error || '交換提案の承認に失敗しました');
      }

      const result = (await response.json()) as ApiResponse<{
        message: string;
        myPostId: string;
        partnerPostId: string;
        chatRoomId?: string;
      }>;
      return result.data as {
        message: string;
        myPostId: string;
        partnerPostId: string;
        chatRoomId?: string;
      };
    } catch (error: unknown) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  /**
   * 交換提案を拒否
   */
  async rejectOffer(
    postId: string,
    commentId: string,
  ): Promise<{
    message: string;
    commentId: string;
  }> {
    try {
      const accessToken = useAuthStore.getState().getAccessToken();

      if (!accessToken) {
        throw new Error('認証が必要です');
      }

      const response = await fetch(
        `${API_BASE_URL}/trade-posts/${postId}/comments/${commentId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}), // 空のJSONオブジェクトを送る
        },
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiResponse<never>;
        throw new Error(errorData.error || '交換提案の拒否に失敗しました');
      }

      const result = (await response.json()) as ApiResponse<{
        message: string;
        commentId: string;
      }>;
      return result.data as {
        message: string;
        commentId: string;
      };
    } catch (error: unknown) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  }
}

export const commentService = new CommentService();
