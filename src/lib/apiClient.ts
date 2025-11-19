import axios, { AxiosInstance, AxiosError } from "axios";
import type { Recommendation, EmotionData, ContentType, ApiError, UserProfile, DiaryResponse, BookmarkItem } from "@shared/types";
import { getAccessToken } from "./auth";

/**
 * API Base URL 설정 로직:
 * 
 * 1. 개발 환경 (DEV):
 *    - VITE_API_URL이 설정되어 있으면 그대로 사용
 *    - 없으면 빈 문자열 (상대 경로) → vite.config.ts의 프록시 사용
 * 
 * 2. 프로덕션 환경:
 *    - VITE_API_URL이 반드시 설정되어야 함 (.env.production)
 *    - 기본값: https://www.jinwook.shop
 */
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL as string;
  
  if (envUrl) {
    return envUrl;
  }
  
  // 프로덕션 환경에서는 기본 배포 주소 사용
  if (import.meta.env.PROD) {
    console.warn("VITE_API_URL이 설정되지 않았습니다. 기본 배포 주소를 사용합니다.");
    return "https://www.jinwook.shop";
  }
  
  // 개발 환경에서는 프록시 사용 (빈 문자열 = 상대 경로)
  return "";
};

const API_BASE = getApiBaseUrl();
if (import.meta.env.DEV) {
  console.log("🔧 API 설정:", {
    mode: import.meta.env.MODE,
    baseURL: API_BASE || "(프록시 사용 - vite.config.ts)",
    proxy: import.meta.env.DEV ? "활성화됨" : "비활성화",
  });
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: 인증 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 에러 핸들링 헬퍼 함수
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || axiosError.message || defaultMessage;
    const apiError: ApiError = {
      message,
      status: axiosError.response?.status,
      code: axiosError.code,
    };
    throw apiError;
  }
  throw new Error(defaultMessage);
};

// Response interceptor: 에러 처리 및 인증 실패 시 처리
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 Unauthorized: 인증 실패 → 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      console.warn("인증이 만료되었습니다. 로그인 페이지로 이동합니다.");
      // 필요시 여기서 로그아웃 처리 및 리다이렉트
      // window.location.href = "/login";
    }
    
    console.error("API ERROR:", {
      url: error.config?.url,
      fullUrl: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    
    return Promise.reject(error);
  }
);

// Emotion API
export const getEmotionData = async (): Promise<EmotionData> => {
  try {
    const response = await api.get<EmotionData>("/emotion");
    return response.data;
  } catch (error) {
    handleApiError(error, "감정 데이터 조회 실패");
  }
};

// Recommendation API - 통합된 함수로 개선
const createRecommendation = async (type: Lowercase<ContentType>): Promise<Recommendation> => {
  try {
    const response = await api.get<Recommendation>(`/recommend/${type}/create`);
    return response.data;
  } catch (error) {
    handleApiError(error, `${type} 추천 생성 실패`);
  }
};

export const createBookRecommendation = () => createRecommendation("book"); 
export const createMovieRecommendation = () => createRecommendation("movie");
export const createMusicRecommendation = () => createRecommendation("music");
export const createPoemRecommendation = () => createRecommendation("poem");

export const getRecommendationList = async (
  year: number,
  month: number,
  contentType: ContentType
): Promise<Recommendation[]> => {
  try {
    const response = await api.get<Recommendation[]>("/recommend/read", {
      params: { year, month, contentType },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "추천 목록 조회 실패");
  }
};

export const getRecommendationDetail = async (id: string | number): Promise<Recommendation> => {
  try {
    const response = await api.get<Recommendation>(`/recommend/read/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "추천 상세 조회 실패");
  }
};

// Main Page API
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>("/api/main/user/profile");
    return response.data;
  } catch (error) {
    handleApiError(error, "사용자 프로필 조회 실패");
  }
};

export const getTodayDiary = async (): Promise<DiaryResponse | null> => {
  try {
    const response = await api.get<DiaryResponse>("/api/main/diary/today");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 204) {
      return null; // 작성한 일기가 없는 경우
    }
    handleApiError(error, "오늘 일기 조회 실패");
  }
};

export const getRecentDiaries = async (): Promise<DiaryResponse[]> => {
  try {
    const response = await api.get<DiaryResponse[]>("/api/diary/recent");
    // 응답이 배열인지 확인하고, 아니면 빈 배열 반환
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    console.warn("최근 일기 API가 배열이 아닌 데이터를 반환했습니다:", data);
    return [];
  } catch (error) {
    console.error("최근 일기 조회 실패:", error);
    // 에러 발생 시 빈 배열 반환 (앱이 크래시되지 않도록)
    return [];
  }
};

// Bookmark API
export const addBookmark = async (diaryId: number): Promise<void> => {
  try {
    await api.post(`/api/bookmarks/${diaryId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new Error("이미 북마크된 일기입니다.");
    }
    handleApiError(error, "북마크 추가 실패");
  }
};

export const removeBookmark = async (diaryId: number): Promise<void> => {
  try {
    await api.delete(`/api/bookmarks/${diaryId}`);
  } catch (error) {
    handleApiError(error, "북마크 삭제 실패");
  }
};

export const getBookmarks = async (): Promise<BookmarkItem[]> => {
  try {
    const response = await api.get<BookmarkItem[]>("/api/bookmarks");
    return response.data;
  } catch (error) {
    console.error("북마크 조회 실패:", error);
    return [];
  }
};
