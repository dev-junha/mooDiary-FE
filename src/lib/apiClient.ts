import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  Recommendation,
  EmotionData,
  ContentType,
  ApiError,
  DiaryResponse,
  UserProfile,
  BookmarkItem,
  BookmarkWithStats,
} from "@shared/types";
import {
  getAccessToken,
  getRefreshToken,
  refreshToken,
  saveTokens,
  clearTokens,
} from "./auth";

/**
 * API Base URL 설정
 */
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL as string;
  if (envUrl) return envUrl;
  if (import.meta.env.PROD) {
    return "https://www.jinwook.shop";
  }
  return "";
};

const API_BASE = getApiBaseUrl();

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 토큰 갱신 중인지 추적하는 플래그
let isRefreshing = false;
// 토큰 갱신 대기 중인 요청들을 저장
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      // 토큰이 이미 "Bearer "로 시작하는지 확인
      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      config.headers.Authorization = authToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고, 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 갱신 중인 경우, 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = token as string;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        // refreshToken이 없으면 로그인 페이지로 리다이렉트
        clearTokens();
        processQueue(new Error("Refresh token이 없습니다."), null);
        isRefreshing = false;

        // 로그인 페이지로 리다이렉트
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // 토큰 갱신 시도
        const newTokens = await refreshToken(refreshTokenValue);
        saveTokens(newTokens);

        // 새로운 토큰으로 Authorization 헤더 업데이트
        const newAccessToken = newTokens.accessToken.startsWith("Bearer ")
          ? newTokens.accessToken
          : `Bearer ${newTokens.accessToken}`;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = newAccessToken;
        }

        // 대기 중인 요청들 처리
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패
        clearTokens();
        processQueue(refreshError, null);
        isRefreshing = false;

        // 로그인 페이지로 리다이렉트
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // 401이 아니거나 이미 재시도한 경우, 일반 에러 처리
    console.error("API ERROR Response:", error.response?.data);
    console.error("API ERROR Status:", error.response?.status);
    return Promise.reject(error);
  },
);

// 에러 핸들링 헬퍼 (최상단 1회 정의)
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    // 서버에서 보내준 에러 메시지를 우선적으로 사용
    const serverMessage =
      typeof axiosError.response?.data === "string"
        ? axiosError.response?.data
        : axiosError.response?.data?.message;

    const message = serverMessage || axiosError.message || defaultMessage;

    throw {
      message,
      status: axiosError.response?.status,
      code: axiosError.code,
    } as ApiError;
  }
  throw new Error(defaultMessage);
};

// ============================================================================
// [Existing APIs] 기존 페이지에서 사용하는 API (유지)
// ============================================================================

// 감정별 이모지 매핑
const EMOTION_EMOJI: Record<string, string> = {
  HAPPY: "😊",
  SAD: "😢",
  ANGRY: "😠",
  NEUTRAL: "😐",
  ANXIOUS: "😰",
  SURPRISED: "😲",
  DISGUST: "🤢",
  CALM: "😌",
  EXCITED: "🤩",
  FEAR: "😨",
};

// 감정별 한글 설명 매핑
const EMOTION_DESCRIPTION: Record<string, string> = {
  HAPPY: "오늘은 기쁜 하루였네요. 따뜻한 감정이 가득한 하루를 보내셨군요.",
  SAD: "슬픈 감정이 느껴지네요. 힘든 하루였을 수도 있지만, 내일은 더 나아질 거예요.",
  ANGRY:
    "화가 난 감정이 느껴집니다. 감정을 표현하는 것도 중요하지만, 차분히 마음을 다스려보세요.",
  NEUTRAL: "평온한 하루였네요. 일상의 작은 행복을 찾아보세요.",
  ANXIOUS: "불안한 감정이 느껴집니다. 깊게 숨을 쉬며 마음을 진정시켜보세요.",
  SURPRISED: "놀라운 하루였네요! 새로운 경험이 기다리고 있을 거예요.",
  DISGUST: "불쾌한 감정이 느껴집니다. 마음을 정화하고 새로운 시작을 해보세요.",
  CALM: "차분하고 평온한 하루였네요. 마음의 여유를 느낄 수 있는 하루였습니다.",
  EXCITED: "신나고 즐거운 하루였네요! 에너지가 넘치는 하루를 보내셨군요.",
  FEAR: "두려운 감정이 느껴집니다. 하지만 용기를 내면 극복할 수 있을 거예요.",
};

// 감정 온도 매핑 (감정 점수를 온도로 변환)
const getEmotionTemperature = (score: number): string => {
  // 점수 범위: 0-100을 36.0-38.0도로 매핑
  const temp = 36.0 + (score / 100) * 2.0;
  return `${temp.toFixed(1)}°C`;
};

export const getEmotionData = async (): Promise<EmotionData> => {
  try {
    // 먼저 오늘의 일기를 가져옴
    const todayDiary = await getTodayDiary();

    if (todayDiary?.emotionAnalysis?.integratedEmotion) {
      const emotion =
        todayDiary.emotionAnalysis.integratedEmotion.emotion || "NEUTRAL";
      const score = todayDiary.emotionAnalysis.integratedEmotion.score || 50;

      return {
        emotion: emotion,
        description:
          EMOTION_DESCRIPTION[emotion] || EMOTION_DESCRIPTION.NEUTRAL,
        emoji: EMOTION_EMOJI[emotion] || EMOTION_EMOJI.NEUTRAL,
        temperature: getEmotionTemperature(score),
      };
    }

    // 오늘의 일기가 없으면 최근 일기를 가져옴
    const recentDiaries = await getRecentDiaries();

    if (recentDiaries.length > 0) {
      const latestDiary = recentDiaries[0];
      if (latestDiary?.emotionAnalysis?.integratedEmotion) {
        const emotion =
          latestDiary.emotionAnalysis.integratedEmotion.emotion || "NEUTRAL";
        const score = latestDiary.emotionAnalysis.integratedEmotion.score || 50;

        return {
          emotion: emotion,
          description:
            EMOTION_DESCRIPTION[emotion] || EMOTION_DESCRIPTION.NEUTRAL,
          emoji: EMOTION_EMOJI[emotion] || EMOTION_EMOJI.NEUTRAL,
          temperature: getEmotionTemperature(score),
        };
      }
    }

    // 일기가 없으면 기본값 반환
    return {
      emotion: "NEUTRAL",
      description: "아직 작성한 일기가 없습니다. 오늘의 감정을 기록해보세요!",
      emoji: EMOTION_EMOJI.NEUTRAL,
      temperature: "36.5°C",
    };
  } catch (error) {
    // 에러가 발생해도 기본값 반환 (페이지가 깨지지 않도록)
    console.error("감정 데이터 조회 실패:", error);
    return {
      emotion: "NEUTRAL",
      description: "감정 데이터를 불러오지 못했습니다.",
      emoji: EMOTION_EMOJI.NEUTRAL,
      temperature: "36.5°C",
    };
  }
};

const createRecommendation = async (
  type: Lowercase<ContentType>,
): Promise<Recommendation> => {
  try {
    const response = await api.get<Recommendation>(
      `/api/recommend/${type}/create`,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `${type} 추천 생성 실패`);
  }
};

export const createBookRecommendation = () => createRecommendation("book");
export const createMovieRecommendation = () => createRecommendation("movie");
export const createMusicRecommendation = () => createRecommendation("music");
export const createPoemRecommendation = () => createRecommendation("poem");
export const createWiseSayingRecommendation = () =>
  createRecommendation("wise-saying");

export const getRecommendationList = async (
  year: number,
  month: number,
  contentType: ContentType,
): Promise<Recommendation[]> => {
  try {
    const response = await api.get<Recommendation[]>("/api/recommend/read", {
      params: { year, month, contentType },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "추천 목록 조회 실패");
  }
};

export const getRecommendationDetail = async (
  id: string | number,
): Promise<Recommendation> => {
  try {
    const response = await api.get<Recommendation>(`/api/recommend/read/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "추천 상세 조회 실패");
  }
};

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
    if (axios.isAxiosError(error) && error.response?.status === 204)
      return null;
    handleApiError(error, "오늘 일기 조회 실패");
  }
};

export const getRecentDiaries = async (): Promise<DiaryResponse[]> => {
  try {
    const response = await api.get<DiaryResponse[]>("/api/main/diary/recent");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
};

export const deleteDiary = async (diaryId: number | string): Promise<void> => {
  try {
    await api.delete(`/api/diaries/${diaryId}`);
  } catch (error) {
    handleApiError(error, "일기 삭제 실패");
  }
};

export const getBookmarksWithStats = async (): Promise<BookmarkWithStats> => {
  try {
    const response = await api.get<BookmarkWithStats>(
      "/api/bookmarks/registered",
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllBookmarks = async (): Promise<BookmarkItem[]> => {
  try {
    const response = await api.get<BookmarkItem[]>("/api/bookmarks/all");
    return response.data;
  } catch (error) {
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

// ============================================================================
// [NEW APIs] WriteEdit & Results 페이지 전용 (백엔드 DTO 반영)
// ============================================================================

export interface EmotionScore {
  emotion: string;
  score: number;
  confidence: number;
}

export interface EmotionAnalysisResponse {
  textEmotion: EmotionScore;
  facialEmotion?: EmotionScore;
  integratedEmotion: EmotionScore;
  keywords: string[];
  timestamp: string;
}

export interface DiaryDtoResponse {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  emotionAnalysis?: EmotionAnalysisResponse | null;
  createdAt: string;
  updatedAt: string;
}

// 페이지네이션 응답 타입
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  size: number;
  number: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 감정 분석 요약 응답 타입 (API 문서에 맞게)
export interface AnalysisSummaryResponse {
  diaryId: number;
  content: string;
  overallEmotion: string;
  overallEmotionScore: number;
  dominantEmotion: string;
  topKeywords: string[];
  analysisInsight: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadResponse {
  filename: string;
  url: string;
  size: number;
}

// 1. 파일 업로드 (경로 수정: /files -> /api/files, 헤더 제거)
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // [중요] 'Content-Type': 'multipart/form-data' 헤더를 제거해야 Axios가 Boundary를 자동 생성함
    const response = await api.post<FileUploadResponse>(
      "/api/files/upload",
      formData,
    );
    return response.data.url;
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    throw error;
  }
};

// [Helper] 감정을 내용에 포함시키는 함수 (백엔드 분석 유도용)
const appendEmotionToContent = (
  content: string,
  emotion?: string | null,
): string => {
  if (!emotion) return content;
  // AI가 감정을 인식하도록 내용 앞단에 힌트 추가
  return `[Current Mood: ${emotion}] \n${content}`;
};

// ============================================================================
// [Diary APIs] API 문서에 맞게 수정된 일기 관련 API
// ============================================================================

// 1. 일기 작성 (텍스트 기반)
// POST /api/diaries
export const createDiary = async (
  content: string,
  imageUrl?: string | null,
): Promise<DiaryDtoResponse> => {
  try {
    const requestBody: { content: string; imageUrl?: string } = { content };
    if (imageUrl) {
      requestBody.imageUrl = imageUrl;
    }

    const response = await api.post<DiaryDtoResponse>(
      "/api/diaries",
      requestBody,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "일기 작성 실패");
  }
};

// 2. 이미지 포함 일기 작성
// POST /api/diaries/with-image
export const createDiaryWithImage = async (
  content: string,
  imageFile: File,
): Promise<DiaryDtoResponse> => {
  try {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("image", imageFile);

    // Content-Type 헤더를 명시하지 않아야 Axios가 자동으로 boundary를 설정함
    const response = await api.post<DiaryDtoResponse>(
      "/api/diaries/with-image",
      formData,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "이미지 포함 일기 작성 실패");
  }
};

// 기존 createDiary 함수를 래퍼로 유지 (호환성)
export const createDiaryLegacy = async (
  userId: number,
  content: string,
  imageFile?: File,
): Promise<DiaryDtoResponse> => {
  if (imageFile) {
    return createDiaryWithImage(content, imageFile);
  } else {
    return createDiary(content);
  }
};

// 3. 일기 상세 조회
// GET /api/diaries/{diaryId}
export const getDiaryById = async (
  diaryId: number | string,
): Promise<DiaryDtoResponse> => {
  try {
    const response = await api.get<DiaryDtoResponse>(`/api/diaries/${diaryId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "일기 상세 조회 실패");
  }
};

// 4. 사용자별 일기 목록 조회 (쿼리 파라미터)
// GET /api/diaries?page=0&size=10&sort=createdAt,desc
export const getDiaries = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Page<DiaryDtoResponse>> => {
  try {
    const response = await api.get<Page<DiaryDtoResponse>>("/api/diaries", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "createdAt,desc",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "일기 목록 조회 실패");
  }
};

// 5. 사용자별 일기 목록 조회 (/user 엔드포인트)
// GET /api/diaries/user?page=0&size=10
export const getUserDiariesPaginated = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Page<DiaryDtoResponse>> => {
  try {
    const response = await api.get<Page<DiaryDtoResponse>>(
      "/api/diaries/user",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "createdAt,desc",
        },
      },
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "사용자별 일기 목록 조회 실패");
  }
};

// 6. 특정 날짜 일기 조회
// GET /api/diaries/user/{userId}/date?date=2025-12-05
export const getDiaryByDate = async (
  userId: number,
  date: string,
): Promise<DiaryDtoResponse> => {
  try {
    const response = await api.get<DiaryDtoResponse>(
      `/api/diaries/user/${userId}/date`,
      {
        params: { date },
      },
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "특정 날짜 일기 조회 실패");
  }
};

// 7. 감정별 일기 조회
// GET /api/diaries/user/{userId}/emotion/{emotion}
export const getDiariesByEmotion = async (
  userId: number,
  emotion: string,
): Promise<DiaryDtoResponse[]> => {
  try {
    const response = await api.get<DiaryDtoResponse[]>(
      `/api/diaries/user/${userId}/emotion/${emotion}`,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "감정별 일기 조회 실패");
  }
};

// 8. 일기 수정
// PUT /api/diaries/{diaryId}
export const updateDiary = async (
  diaryId: number | string,
  content: string,
  imageUrl?: string | null,
): Promise<DiaryDtoResponse> => {
  try {
    const requestBody: { content: string; imageUrl?: string | null } = {
      content,
    };
    if (imageUrl !== undefined) {
      requestBody.imageUrl = imageUrl;
    }

    const response = await api.put<DiaryDtoResponse>(
      `/api/diaries/${diaryId}`,
      requestBody,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "일기 수정 실패");
  }
};

// 9. 일기 삭제
// DELETE /api/diaries/{diaryId}
// (기존 함수 유지, 경로만 확인)

// 10. 감정 분석 상세 조회
// GET /api/diaries/{diaryId}/analysis
export const getDiaryAnalysis = async (
  diaryId: number | string,
): Promise<EmotionAnalysisResponse> => {
  try {
    const response = await api.get<EmotionAnalysisResponse>(
      `/api/diaries/${diaryId}/analysis`,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "감정 분석 조회 실패");
  }
};

// 11. 감정 분석 요약 조회
// GET /api/diaries/{diaryId}/summary
export const getDiarySummary = async (
  diaryId: number | string,
): Promise<AnalysisSummaryResponse> => {
  try {
    const response = await api.get<AnalysisSummaryResponse>(
      `/api/diaries/${diaryId}/summary`,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "감정 분석 요약 조회 실패");
  }
};

// ============================================================================
// [Legacy/Helper Functions] 기존 코드 호환성을 위한 래퍼 함수들
// ============================================================================

// 사용자별 일기 목록 조회 (배열 반환, 기존 코드 호환성)
// 내부적으로 getDiaries를 사용하여 content 배열만 반환
export const getUserDiaries = async (
  userId: number,
): Promise<DiaryDtoResponse[]> => {
  try {
    const pageResponse = await getDiaries({ page: 0, size: 1000 });
    // pageResponse와 content가 존재하는지 확인
    if (pageResponse && Array.isArray(pageResponse.content)) {
      return pageResponse.content;
    }
    return [];
  } catch (error) {
    console.error("일기 목록 조회 실패:", error);
    return [];
  }
};

// 7. 사용자 ID Helper
export const getUserId = (): number => {
  const storedId = localStorage.getItem("userId");
  if (storedId) return parseInt(storedId, 10);
  return 1;
};

// ============================================================================
// [NEW APIs] 추가된 API 함수들
// ============================================================================

// 메인 페이지 통합 조회 (테스트 엔드포인트)
export interface MainTestResponse {
  userProfile: UserProfile;
  todayDiary: DiaryResponse | null;
  recentDiaries: DiaryResponse[];
}

export const getMainTest = async (): Promise<MainTestResponse> => {
  try {
    const response = await api.get<MainTestResponse>("/api/main/test");
    return response.data;
  } catch (error) {
    handleApiError(error, "메인 페이지 통합 조회 실패");
  }
};

// 특정 북마크 조회
export const getBookmarkById = async (
  diaryId: number,
): Promise<BookmarkItem> => {
  try {
    const response = await api.get<BookmarkItem>(`/api/bookmarks/${diaryId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "북마크 조회 실패");
  }
};

// 파일 다운로드 URL 생성
export const getFileDownloadUrl = (filename: string): string => {
  const baseUrl = api.defaults.baseURL || "";
  return `${baseUrl}/api/files/download/${filename}`;
};

// 파일 다운로드 (Blob 반환)
export const downloadFile = async (filename: string): Promise<Blob> => {
  try {
    const response = await api.get<Blob>(`/api/files/download/${filename}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "파일 다운로드 실패");
  }
};

// [LEGACY Stubs] WriteEdit 호환성 유지용 (실제 사용은 위 함수들로 대체됨)
export const saveDraft = async (formData: FormData): Promise<any> => {
  return {};
};
export const analyzeEmotion = async (formData: FormData): Promise<any> => {
  return {};
};
export const submitDiary = async (formData: FormData): Promise<any> => {
  return {};
};
