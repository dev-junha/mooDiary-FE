import {
  api,
  getEmotionData,
  createBookRecommendation,
  createMovieRecommendation,
  createMusicRecommendation,
  createPoemRecommendation,
  createWiseSayingRecommendation,
  getRecommendationList,
  getRecommendationDetail,
  // 메인 페이지 API
  getUserProfile,
  getTodayDiary,
  getRecentDiaries,
  getMainTest,
  // 북마크 API
  getAllBookmarks,
  getBookmarksWithStats,
  getBookmarkById,
  addBookmark,
  removeBookmark,
  // 일기 API (새로운 API 문서 기반)
  createDiary,
  createDiaryWithImage,
  createDiaryLegacy,
  updateDiary,
  deleteDiary,
  getDiaryById,
  getDiaryAnalysis,
  getDiarySummary,
  getDiaries,
  getUserDiariesPaginated,
  getUserDiaries,
  getDiaryByDate,
  getDiariesByEmotion,
  // 타입 export
  type DiaryDtoResponse,
  type EmotionAnalysisResponse,
  type AnalysisSummaryResponse,
  type Page,
  // 파일 API
  uploadFile,
  downloadFile,
  getFileDownloadUrl,
  // 유틸리티
  getUserId,
} from "@/lib/apiClient";

export default api;

// 추천 API
export {
  getEmotionData,
  createBookRecommendation,
  createMovieRecommendation,
  createMusicRecommendation,
  createPoemRecommendation,
  createWiseSayingRecommendation,
  getRecommendationList,
  getRecommendationDetail,
};

// 메인 페이지 API
export {
  getUserProfile,
  getTodayDiary,
  getRecentDiaries,
  getMainTest,
};

// 북마크 API
export {
  getAllBookmarks,
  getBookmarksWithStats,
  getBookmarkById,
  addBookmark,
  removeBookmark,
};

// 일기 API
export {
  createDiary,
  createDiaryWithImage,
  createDiaryLegacy,
  updateDiary,
  deleteDiary,
  getDiaryById,
  getDiaryAnalysis,
  getDiarySummary,
  getDiaries,
  getUserDiariesPaginated,
  getUserDiaries,
  getDiaryByDate,
  getDiariesByEmotion,
};

// 일기 API 타입
export type {
  DiaryDtoResponse,
  EmotionAnalysisResponse,
  AnalysisSummaryResponse,
  Page,
};

// 파일 API
export {
  uploadFile,
  downloadFile,
  getFileDownloadUrl,
};

// 유틸리티
export {
  getUserId,
};


