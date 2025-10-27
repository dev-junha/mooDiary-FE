// api.ts
interface Recommendation {
  imageUrl: string | null;
  title: string;
  content: string;
  contentId: string | null;
  author?: string;
}

interface EmotionData {
  emotion?: string;
  description?: string;
  emoji?: string;
  temperature?: string;
}

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Vite 환경 변수 사용
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// 공통 API 호출 함수
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const token = localStorage.getItem('authToken');

    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new ApiError('응답이 JSON 형식이 아닙니다.');
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API 호출 실패 (${endpoint}):`, error);
    if (error.status === 401) {
      throw new ApiError('인증이 필요합니다. 다시 로그인해주세요.', 401);
    }
    throw new ApiError(error.message || 'API 요청 중 오류가 발생했습니다.', error.status);
  }
};

// 감정 데이터 가져오기
export const getEmotionData = async (): Promise<EmotionData | null> => {
  return apiRequest<EmotionData>('/api/emotion', { method: 'GET' });
};

// 추천 데이터 가져오기 (공통)
const getRecommendation = async (category: string): Promise<Recommendation | null> => {
  const data = await apiRequest<Recommendation>(`/api/recommend/${category}/create`, { method: 'GET' });
  if (!data || !data.title || !data.content) {
    return null;
  }
  return {
    imageUrl: data.imageUrl || null,
    title: data.title,
    content: data.content,
    contentId: data.contentId || null,
    author: data.author || undefined,
  };
};

// 책 추천
export const getBookRecommendation = async (): Promise<Recommendation | null> => {
  return getRecommendation('book');
};

// 영화 추천
export const getMovieRecommendation = async (): Promise<Recommendation | null> => {
  return getRecommendation('movie');
};

// 음악 추천
export const getMusicRecommendation = async (): Promise<Recommendation | null> => {
  return getRecommendation('music');
};

// 시 추천
export const getPoemRecommendation = async (): Promise<Recommendation | null> => {
  return getRecommendation('poem');
};

// 로그인 API
export const login = async (credentials: { username: string; password: string }): Promise<{ token: string }> => {
  return apiRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};