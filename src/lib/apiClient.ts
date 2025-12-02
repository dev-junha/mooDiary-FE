import axios, { AxiosInstance, AxiosError } from "axios";
import type { Recommendation, EmotionData, ContentType, ApiError, DiaryResponse, UserProfile, BookmarkItem, BookmarkWithStats } from "@shared/types";
import { getAccessToken } from "./auth";

/**
 * API Base URL 설정 로직
 */
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL as string;
  
  if (envUrl) {
    return envUrl;
  }
  
  if (import.meta.env.PROD) {
    console.warn("VITE_API_URL이 설정되지 않았습니다. 기본 배포 주소를 사용합니다.");
    return "https://www.jinwook.shop";
  }
  
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

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("인증이 만료되었습니다. 로그인 페이지로 이동합니다.");
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

// Recommendation API
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
export const createWiseSayingRecommendation = () => createRecommendation("wise-saying");

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
      return null;
    }
    handleApiError(error, "오늘 일기 조회 실패");
  }
};

export const getRecentDiaries = async (): Promise<DiaryResponse[]> => {
  try {
    const response = await api.get<DiaryResponse[]>("/api/diary/recent");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    console.warn("최근 일기 API가 배열이 아닌 데이터를 반환했습니다:", data);
    return [];
  } catch (error) {
    console.error("최근 일기 조회 실패:", error);
    return [];
  }
};

// Diary write / analysis APIs
export const saveDraft = async (formData: FormData): Promise<{ status?: string; message?: string; draftId?: string }> => {
  try {
    const response = await api.post('/api/diary/draft', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, '임시저장 실패');
  }
};

export const analyzeEmotion = async (formData: FormData): Promise<any> => {
  try {
    const response = await api.post('/api/emotion/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, '감정 분석 실패');
  }
};

export const submitDiary = async (formData: FormData): Promise<any> => {
  try {
    const response = await api.post('/api/diary', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, '일기 제출 실패');
  }
};

// Diary Records API
export const getUserDiaries = async (userId: number): Promise<DiaryResponse[]> => {
  try {
    console.log(`📋 일기 목록 조회 요청: /api/user/${userId}`);
    const response = await api.get<DiaryResponse[]>(`/api/user/${userId}`);
    console.log("✅ 일기 목록 조회 성공:", response.data);
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    console.warn("일기 목록 API가 배열이 아닌 데이터를 반환했습니다:", data);
    return [];
  } catch (error) {
    console.error("❌ 일기 목록 조회 실패:", error);
    
    // 인증 에러인 경우 에러를 throw
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("로그인이 필요합니다.");
    }
    
    // 302 리다이렉트인 경우에도 인증 에러로 처리
    if (axios.isAxiosError(error) && error.response?.status === 302) {
      throw new Error("로그인이 필요합니다.");
    }
    
    // 기타 에러는 빈 배열 반환
    return [];
  }
};

export const deleteDiary = async (diaryId: number): Promise<void> => {
  try {
    await api.delete(`/api/diary/${diaryId}`);
  } catch (error) {
    handleApiError(error, "일기 삭제 실패");
  }
};

// Bookmark API
export const getBookmarksWithStats = async (): Promise<BookmarkWithStats> => {
  try {
    const response = await api.get<BookmarkWithStats>("/api/bookmarks/registered");
    return response.data;
  } catch (error) {
    console.error("북마크 조회 실패:", error);
    throw error;
  }
};

export const getAllBookmarks = async (): Promise<BookmarkItem[]> => {
  try {
    const response = await api.get<BookmarkItem[]>("/api/bookmarks/all");
    return response.data;
  } catch (error) {
    console.error("북마크 조회 실패:", error);
    return [];
  }
};

export const addBookmark = async (diaryId: number): Promise<void> => {
  try {
    await api.post(`/api/bookmarks/${diaryId}`);
  } catch (error) {
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