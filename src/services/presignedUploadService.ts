/**
 * Supabase直接アップロード方式のサービス
 * Pre-signed URLの代わりにSupabase SDKを使用
 */

import { createClient } from '@supabase/supabase-js';
import { AxiosError } from 'axios';

import apiClient, { ApiResponse } from './api';

// ========== 型定義 ==========

export interface PresignedUrlResponse {
  uploadUrl: string;
  bucketName: string;
  path: string;
  publicUrl: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  expiresAt: string;
}

export interface UploadedImage {
  url: string;
  path: string;
  size: number;
  type: string;
  order?: number;
  is_main?: boolean;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

// ========== サービスクラス ==========

class PresignedUploadService {
  private supabaseClient: unknown = null;

  /**
   * Supabaseクライアントの初期化
   */
  private async initSupabaseClient(): Promise<unknown> {
    if (this.supabaseClient) {
      return this.supabaseClient;
    }

    try {
      // サーバーから接続情報を取得
      const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
        '/upload/presigned-url',
        {
          fileName: 'init.txt',
          fileType: 'image/jpeg',
          fileSize: 1,
        },
      );

      if (response.data.success && response.data.data) {
        const { supabaseUrl, supabaseAnonKey } = response.data.data;
        if (supabaseUrl && supabaseAnonKey) {
          this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        }
      }
    } catch (error) {
      console.error('Failed to init Supabase client:', error);
    }

    return this.supabaseClient;
  }

  /**
   * Supabase Storageを使用した直接アップロード
   */
  async uploadImage(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadedImage> {
    const { onProgress, signal } = options;

    try {
      // Step 1: サーバーからパス情報を取得
      const presignedResponse = await apiClient.post<
        ApiResponse<PresignedUrlResponse>
      >(
        '/upload/presigned-url',
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
        { signal },
      );

      if (!presignedResponse.data.success || !presignedResponse.data.data) {
        throw new Error('アップロード情報の取得に失敗しました');
      }

      const { bucketName, path, publicUrl, supabaseUrl, supabaseAnonKey } =
        presignedResponse.data.data;

      // デバッグログ
      // eslint-disable-next-line no-console
      console.log('Pre-signed URL response:', {
        bucketName,
        path,
        publicUrl,
        supabaseUrl: supabaseUrl ? '✓ Exists' : '✗ Missing',
        supabaseAnonKey: supabaseAnonKey ? '✓ Exists' : '✗ Missing',
      });

      // Step 2: Supabaseクライアントでアップロード
      if (supabaseUrl && supabaseAnonKey) {
        // const supabase = createClient(supabaseUrl, supabaseAnonKey);
        // Note: supabase variable is currently not used due to using XHR for progress tracking

        // プログレス対応のためXHRを使用
        const formData = new FormData();
        formData.append('file', file);

        // XHRでアップロード
        const xhr = new XMLHttpRequest();

        // プログレス監視
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              onProgress(percentComplete);
            }
          });
        }

        // Promiseでラップ
        const uploadPromise = new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error'));

          // アボート処理
          if (signal) {
            signal.addEventListener('abort', () => {
              xhr.abort();
              reject(new Error('Upload cancelled'));
            });
          }
        });

        // Supabase Storage APIのURLを構築
        const uploadApiUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${path}`;

        // アップロード実行
        xhr.open('POST', uploadApiUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.send(file);

        await uploadPromise;

        // Step 3: 成功レスポンス返却
        return {
          url: publicUrl,
          path,
          size: file.size,
          type: file.type,
        };
      } else {
        // フォールバック：従来のサーバー経由アップロード
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await apiClient.post<ApiResponse<UploadedImage>>(
          '/upload/single',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (onProgress && progressEvent.total) {
                const percentComplete = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                onProgress(percentComplete);
              }
            },
            signal,
          },
        );

        if (!uploadResponse.data.success || !uploadResponse.data.data) {
          throw new Error('アップロードに失敗しました');
        }

        return uploadResponse.data.data;
      }
    } catch (error) {
      console.error('Upload error:', error);

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiResponse | undefined;
        throw new Error(responseData?.message || 'アップロードに失敗しました');
      }

      throw error;
    }
  }

  /**
   * 複数画像の並列アップロード
   */
  async uploadMultipleImages(
    files: File[],
    options: {
      onProgress?: (progress: number, fileIndex: number) => void;
      onOverallProgress?: (progress: number) => void;
      signal?: AbortSignal;
    } = {},
  ): Promise<UploadedImage[]> {
    const { onProgress, onOverallProgress, signal } = options;

    const progressMap = new Map<number, number>();

    // 全体プログレス計算
    const updateOverallProgress = (): void => {
      if (onOverallProgress) {
        const totalProgress = Array.from(progressMap.values()).reduce(
          (sum, progress) => sum + progress,
          0,
        );
        const overallProgress = Math.round(totalProgress / files.length);
        onOverallProgress(overallProgress);
      }
    };

    // 並列アップロード実行
    const uploadPromises = files.map((file, index) =>
      this.uploadImage(file, {
        signal,
        onProgress: (progress) => {
          progressMap.set(index, progress);

          if (onProgress) {
            onProgress(progress, index);
          }

          updateOverallProgress();
        },
      }).then((result) => ({
        ...result,
        order: index,
        is_main: index === 0,
      })),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * 画像の削除
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `/upload/${encodeURIComponent(path)}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiResponse | undefined;
        throw new Error(responseData?.message || '画像の削除に失敗しました');
      }

      throw error;
    }
  }

  /**
   * ファイル検証
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '対応していないファイル形式です（JPEG、PNG、WebP、GIFのみ）',
      };
    }

    // ファイルサイズチェック（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'ファイルサイズが大きすぎます（最大10MB）',
      };
    }

    return { valid: true };
  }
}

// シングルトンインスタンスのエクスポート
export const presignedUploadService = new PresignedUploadService();
