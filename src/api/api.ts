import axios, { AxiosInstance } from "axios";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "";

// 디버깅용 로그
console.log("API_BASE:", API_BASE);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 응답 인터셉터로 에러 디버깅
api.interceptors.response.use(
  response => response,
  error => {
    console.error("API 요청 에러 상세:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;

// 감정 데이터 조회
export const getEmotionData = async () => {
  try {
    const response = await api.get("/emotion");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "감정 데이터 조회 실패";
    console.error("getEmotionData 오류:", message, error);
    throw new Error(message);
  }
};

// 최근 일기 기반 추천 생성 (책/영화/음악/시)
export const createBookRecommendation = async () => {
  try {
    const response = await api.get("/recommend/book/create");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "책 추천 생성 실패";
    console.error("createBookRecommendation 오류:", message, error);
    throw new Error(message);
  }
};

export const createMovieRecommendation = async () => {
  try {
    const response = await api.get("/recommend/movie/create");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "영화 추천 생성 실패";
    console.error("createMovieRecommendation 오류:", message, error);
    throw new Error(message);
  }
};

export const createMusicRecommendation = async () => {
  try {
    const response = await api.get("/recommend/music/create");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "음악 추천 생성 실패";
    console.error("createMusicRecommendation 오류:", message, error);
    throw new Error(message);
  }
};

export const createPoemRecommendation = async () => {
  try {
    const response = await api.get("/recommend/poem/create");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "시 추천 생성 실패";
    console.error("createPoemRecommendation 오류:", message, error);
    throw new Error(message);
  }
};

// 월별 추천 컨텐츠 모음 조회
export const getRecommendationList = async (
  year: number,
  month: number,
  contentType: string, // BOOK | MUSIC | POEM | MOVIE
) => {
  try {
    const response = await api.get("/recommend/read", {
      params: { year, month, contentType },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      `추천 목록 조회 실패: ${year}-${month} ${contentType}`;
    console.error("getRecommendationList 오류:", message, error);
    throw new Error(message);
  }
};

// 추천 콘텐츠 상세조회 (id)
export const getRecommendationDetail = async (id: string | number) => {
  try {
    const response = await api.get(`/recommend/read/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || `추천 상세 조회 실패: id=${id}`;
    console.error("getRecommendationDetail 오류:", message, error);
    throw new Error(message);
  }
}
