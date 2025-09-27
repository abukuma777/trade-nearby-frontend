// API設定ファイル
const isDevelopment = process.env.NODE_ENV === 'development';

// 本番環境のAPIエンドポイント
const PRODUCTION_API_URL = 'https://trade-nearby-api.onrender.com/api';

// 開発環境のAPIエンドポイント
const DEVELOPMENT_API_URL = 'http://localhost:4000/api';

// 環境に応じてAPIのベースURLを切り替え
export const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// Supabase設定
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// その他の設定
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_IMAGES_PER_POST = 6;
