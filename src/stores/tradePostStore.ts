/**
 * 交換投稿ストア
 * Zustandを使用したグローバル状態管理
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  tradePostService,
  SimpleTradePost,
  CreateTradePostData,
  UpdateTradePostData,
} from '../services/tradePostService';

interface TradePostStore {
  // 状態
  posts: SimpleTradePost[];
  myPosts: SimpleTradePost[];
  currentPost: SimpleTradePost | null;
  loading: boolean;
  error: string | null;

  // アクション
  fetchPosts: (
    status?: string,
    contentId?: string,
    includeChildren?: boolean,
  ) => Promise<void>;
  fetchMyPosts: () => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (data: CreateTradePostData) => Promise<SimpleTradePost>;
  updatePost: (id: string, data: UpdateTradePostData) => Promise<void>;
  updateStatus: (
    id: string,
    status: 'active' | 'completed' | 'cancelled',
  ) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  clearError: () => void;
}

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useTradePostStore = create<TradePostStore>()(
  devtools(
    (set, get) => ({
      // 初期状態
      posts: [],
      myPosts: [],
      currentPost: null,
      loading: false,
      error: null,

      // 投稿一覧取得
      fetchPosts: async (
        status?: string,
        contentId?: string,
        includeChildren?: boolean,
      ) => {
        set({ loading: true, error: null });
        try {
          const posts = await tradePostService.getAllPosts(
            status,
            contentId,
            includeChildren,
          );
          set({ posts, loading: false });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message || '投稿の取得に失敗しました',
            loading: false,
          });
        }
      },

      // 自分の投稿一覧取得
      fetchMyPosts: async () => {
        set({ loading: true, error: null });
        try {
          const myPosts = await tradePostService.getMyPosts();
          set({ myPosts, loading: false });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message || '投稿の取得に失敗しました',
            loading: false,
          });
        }
      },

      // 投稿詳細取得
      fetchPost: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const currentPost = await tradePostService.getPost(id);
          set({ currentPost, loading: false });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message || '投稿の取得に失敗しました',
            loading: false,
          });
        }
      },

      // 投稿作成
      createPost: async (data: CreateTradePostData) => {
        set({ loading: true, error: null });
        try {
          const newPost = await tradePostService.createPost(data);
          const { myPosts } = get();
          set({
            myPosts: [newPost, ...myPosts],
            loading: false,
          });
          return newPost;
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message || '投稿の作成に失敗しました',
            loading: false,
          });
          throw error;
        }
      },

      // 投稿更新
      updatePost: async (id: string, data: UpdateTradePostData) => {
        set({ loading: true, error: null });
        try {
          const updatedPost = await tradePostService.updatePost(id, data);
          const { posts, myPosts } = get();

          set({
            posts: posts.map((p) => (p.id === id ? updatedPost : p)),
            myPosts: myPosts.map((p) => (p.id === id ? updatedPost : p)),
            currentPost:
              get().currentPost?.id === id ? updatedPost : get().currentPost,
            loading: false,
          });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message || '投稿の更新に失敗しました',
            loading: false,
          });
          throw error;
        }
      },

      // ステータス更新
      updateStatus: async (
        id: string,
        status: 'active' | 'completed' | 'cancelled',
      ) => {
        set({ loading: true, error: null });
        try {
          const updatedPost = await tradePostService.updateStatus(id, status);
          const { posts, myPosts } = get();

          set({
            posts: posts.map((p) => (p.id === id ? updatedPost : p)),
            myPosts: myPosts.map((p) => (p.id === id ? updatedPost : p)),
            currentPost:
              get().currentPost?.id === id ? updatedPost : get().currentPost,
            loading: false,
          });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message ||
              'ステータスの更新に失敗しました',
            loading: false,
          });
          throw error;
        }
      },

      // 投稿削除
      deletePost: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await tradePostService.deletePost(id);
          const { posts, myPosts } = get();

          set({
            posts: posts.filter((p) => p.id !== id),
            myPosts: myPosts.filter((p) => p.id !== id),
            currentPost:
              get().currentPost?.id === id ? null : get().currentPost,
            loading: false,
          });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message || '投稿の削除に失敗しました',
            loading: false,
          });
          throw error;
        }
      },

      // エラークリア
      clearError: () => set({ error: null }),
    }),
    {
      name: 'trade-post-store',
    },
  ),
);
