/**
 * 画像アップロードサービス
 * Supabase Storageへの画像アップロード、削除、管理機能
 */

import { AxiosProgressEvent, AxiosError } from 'axios';

import apiClient, { ApiResponse } from './api';

// ========== 型定義 ==========

/**
 * アップロードされた画像の情報
 */
export interface UploadedImage {
  url: string; // 画像のフルURL
  path: string; // ストレージ内のパス
  thumbnail?: string; // サムネイルURL（アイテム画像のみ）
  size?: number; // ファイルサイズ
  type?: string; // MIMEタイプ
}

/**
 * アップロードレスポンス
 */
export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadedImage | UploadedImage[];
}

/**
 * アップロードオプション
 */
export interface UploadOptions {
  type?: 'item' | 'avatar'; // アップロードタイプ
  onProgress?: (progress: number) => void; // プログレスコールバック
  signal?: AbortSignal; // キャンセル用シグナル
}

/**
 * 削除リクエスト
 */
export interface DeleteImageRequest {
  bucket: 'item-images' | 'user-avatars';
  filePath: string;
}

// ========== サービスクラス ==========

class UploadService {
  /**
   * 単一画像のアップロード
   * @param file アップロードするファイル
   * @param options アップロードオプション
   * @returns アップロードされた画像情報
   */
  async uploadSingleImage(
    file: File,
    options: UploadOptions = {},
  ): Promise<UploadedImage> {
    const { type = 'item', onProgress, signal } = options;

    // FormDataの作成
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const response = await apiClient.post<ApiResponse<UploadedImage>>(
        '/api/upload/single',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(percentCompleted);
            }
          },
          signal,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'アップロードに失敗しました');
      }

      return response.data.data as UploadedImage;
    } catch (error) {
      console.error('Upload single image error:', error);

      // キャンセルエラーの場合
      if (error instanceof Error && error.name === 'CanceledError') {
        throw new Error('アップロードがキャンセルされました');
      }

      // Axiosエラーの場合
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiResponse | undefined;
        const errorMessage =
          responseData?.message ||
          error.message ||
          'アップロードに失敗しました';
        throw new Error(errorMessage);
      }

      // その他のエラー
      throw new Error('アップロードに失敗しました');
    }
  }

  /**
   * 画像の削除
   * @param bucket バケット名
   * @param filePath 削除するファイルのパス
   */
  async deleteImage(
    bucket: 'item-images' | 'user-avatars',
    filePath: string,
  ): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        '/api/upload/delete',
        {
          data: {
            bucket,
            filePath,
          },
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete image error:', error);

      // Axiosエラーの場合
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiResponse | undefined;
        const errorMessage =
          responseData?.message || error.message || '画像の削除に失敗しました';
        throw new Error(errorMessage);
      }

      // その他のエラー
      throw new Error('画像の削除に失敗しました');
    }
  }

  /**
   * 画像URLからファイルパスを抽出
   * @param url 画像のフルURL
   * @returns ファイルパス
   */
  extractFilePathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');

      // Supabase StorageのURL構造から抽出
      // /storage/v1/object/public/{bucket}/{path}
      const bucketIndex = pathParts.indexOf('public') + 1;
      if (bucketIndex > 0 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }

      throw new Error('Invalid URL format');
    } catch (error) {
      console.error('Extract file path error:', error);
      throw new Error('URLからファイルパスを抽出できませんでした');
    }
  }

  /**
   * ファイルサイズの検証
   * @param file 検証するファイル
   * @param maxSizeInMB 最大サイズ（MB）
   * @returns 検証結果
   */
  validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * ファイルタイプの検証
   * @param file 検証するファイル
   * @returns 検証結果
   */
  validateFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return allowedTypes.includes(file.type);
  }

  /**
   * 複数ファイルの検証
   * @param files 検証するファイル配列
   * @param maxFiles 最大ファイル数
   * @param maxSizeInMB 各ファイルの最大サイズ（MB）
   * @returns 検証エラーメッセージ（エラーがない場合はnull）
   */
  validateFiles(
    files: File[],
    maxFiles: number = 5,
    maxSizeInMB: number = 10,
  ): string | null {
    // ファイル数チェック
    if (files.length > maxFiles) {
      return `アップロードできる画像は最大${maxFiles}枚です`;
    }

    // 各ファイルの検証
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // ファイルタイプチェック
      if (!this.validateFileType(file)) {
        return `${file.name} は対応していないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。`;
      }

      // ファイルサイズチェック
      if (!this.validateFileSize(file, maxSizeInMB)) {
        return `${file.name} のサイズが大きすぎます。最大${maxSizeInMB}MBまでアップロード可能です。`;
      }
    }

    return null;
  }

  /**
   * Base64エンコードされた画像データをFileオブジェクトに変換
   * @param base64 Base64文字列
   * @param filename ファイル名
   * @returns Fileオブジェクト
   */
  base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  /**
   * 画像のプレビューURL生成
   * @param file ファイル
   * @returns プレビューURL
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * プレビューURLの解放
   * @param url 解放するURL
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

// シングルトンインスタンスのエクスポート
export const uploadService = new UploadService();
