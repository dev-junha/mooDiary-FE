// 공통 타입 정의

export interface User {
  id?: number;
  email?: string;
  nickname: string;
  username?: string;
  phone?: string;
  profileImage?: string;
  avatarUrl?: string; // 호환성을 위해 유지
  recentEmotion?: string;
  createdAt?: number[]; // [year, month, day, hour, minute, second]
  updatedAt?: number[]; // [year, month, day, hour, minute, second]
}

export interface EmotionData {
  emotion?: string;
  description?: string;
  emoji?: string;
  temperature?: string;
}

export interface Recommendation {
  imageUrl?: string | null;
  title: string;
  content: string;
  contentId?: number | null;
  author?: string;
}

export type ContentType = "BOOK" | "MOVIE" | "MUSIC" | "POEM" | "PHRASE";

export interface RecommendationRequest {
  year: number;
  month: number;
  contentType: ContentType;
}

export interface DiaryEntry {
  id?: number;
  date: string;
  summary: string;
  emotion?: string;
  content?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user?: User; // 로그인 응답에 포함되는 사용자 정보
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  phone: string;
  username: string;
  profileImage?: string;
}

export interface SocialLoginRequest {
  userID: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

