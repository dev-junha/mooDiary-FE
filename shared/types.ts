// 공통 타입 정의

export interface User {
  id?: number;
  email?: string;
  nickname: string;
  username?: string;
  phone?: string;
  location?: string;
  bio?: string;
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

export type ContentType = "BOOK" | "MOVIE" | "MUSIC" | "POEM" | "PHRASE" | "WISE-SAYING";

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
  temperature?: string;
  progress?: number;
}

// 메인 페이지 API 응답 타입
export interface UserProfile {
  nickname: string;
  profileImage: string;
}

export interface EmotionDetail {
  emotion: string;
  score: number;
  confidence: number;
}

export interface EmotionAnalysis {
  textEmotion: EmotionDetail;
  facialEmotion: EmotionDetail;
  integratedEmotion: EmotionDetail;
  keywords: string[];
  timestamp: string;
}

export interface DiaryResponse {
  id: number;
  userId: number;
  content: string;
  imageUrl: string | null;
  emotionAnalysis: EmotionAnalysis;
  createdAt: string;
  updatedAt: string;
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

// 북마크 관련 타입
export interface BookmarkItem {
  diaryId: number;
  content: string;
  temperature: number;
  createdAt: string; // ISO 8601 형식 (예: "2024-01-15T10:30:00")
}

export interface BookmarkWithStats {
  numberOfBookmarkedDiary: number;
  numberOfTotalDiary: number;
  averageTemperature: number;
  bookmarks: BookmarkItem[];
}

// 일기 분석 요약 타입
export interface DiarySummary {
  diaryId: number;
  summary: string;
  mainEmotion: string;
  keywords: string[];
  createdAt: string;
}

// 메인 페이지 통합 조회 응답 타입
export interface MainPageData {
  userProfile: UserProfile;
  todayDiary: DiaryResponse | null;
  recentDiaries: DiaryResponse[];
}

// 토큰 갱신 요청 타입
export interface RefreshTokenRequest {
  refreshToken: string;
}

// API 테스트 응답 타입
export interface ApiTestResponse {
  status: string;
  message: string;
  timestamp?: string;
}

