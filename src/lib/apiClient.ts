import axios, { AxiosInstance } from "axios";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "";
if (import.meta.env.DEV) console.log("API_BASE:", API_BASE);

export interface Recommendation {
  imageUrl?: string | null;
  title: string;
  content: string;
  contentId?: string | null;
}

export interface EmotionData {
  emotion?: string;
  description?: string;
  emoji?: string;
  temperature?: string;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("API ERROR:", {
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });
    return Promise.reject(err);
  }
);

export const getEmotionData = async (): Promise<EmotionData> => {
  try {
    const resp = await api.get<EmotionData>("/emotion");
    return resp.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || "감정 데이터 조회 실패";
    throw new Error(message);
  }
};

export const createBookRecommendation = async (): Promise<Recommendation> => {
  const resp = await api.get<Recommendation>("/recommend/book/create");
  return resp.data;
};

export const createMovieRecommendation = async (): Promise<Recommendation> => {
  const resp = await api.get<Recommendation>("/recommend/movie/create");
  return resp.data;
};

export const createMusicRecommendation = async (): Promise<Recommendation> => {
  const resp = await api.get<Recommendation>("/recommend/music/create");
  return resp.data;
};

export const createPoemRecommendation = async (): Promise<Recommendation> => {
  const resp = await api.get<Recommendation>("/recommend/poem/create");
  return resp.data;
};

export const getRecommendationList = async (
  year: number,
  month: number,
  contentType: "BOOK" | "MOVIE" | "MUSIC" | "POEM"
): Promise<Recommendation[]> => {
  const resp = await api.get<Recommendation[]>("/recommend/read", { params: { year, month, contentType } });
  return resp.data;
};

export const getRecommendationDetail = async (id: string | number): Promise<Recommendation> => {
  const resp = await api.get<Recommendation>(`/recommend/read/${id}`);
  return resp.data;
};
