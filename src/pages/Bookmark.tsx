import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/common/PageLayout";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { getBookmarks, removeBookmark } from "../lib/apiClient";
import type { BookmarkItem } from "@shared/types";

interface DiaryCard {
  id: number;
  diaryId: number;
  title: string;
  date: string;
  content: string;
  isBookmarked: boolean;
}

export default function Bookmark() {
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState<DiaryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 북마크 목록 불러오기
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBookmarks();
      
      console.log("📌 북마크 API 응답:", response);
      console.log("📌 응답 타입:", typeof response);
      console.log("📌 배열 여부:", Array.isArray(response));
      
      // 응답이 배열이 아닌 경우 처리
      if (!Array.isArray(response)) {
        console.error("API 응답이 배열이 아닙니다:", response);
        setDiaries([]);
        return;
      }
      
      // API 응답을 DiaryCard 형식으로 변환
      const transformedDiaries: DiaryCard[] = response.map((bookmark: BookmarkItem) => ({
        id: bookmark.id,
        diaryId: bookmark.diaryId,
        title: bookmark.diaryTitle,
        date: formatDate(bookmark.createdAt),
        content: bookmark.content,
        isBookmarked: true,
      }));
      
      setDiaries(transformedDiaries);
    } catch (err) {
      console.error("북마크 불러오기 실패:", err);
      setError("북마크를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷 변환 함수 (ISO 문자열 → YYYY.MM.DD)
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 통계 데이터
  const bookmarkCount = diaries.length;

  const handleEdit = (diaryId: number) => {
    navigate(`/write-edit?diaryId=${diaryId}`);
  };

  const handleDelete = async (id: number, diaryId: number) => {
    if (!confirm("북마크를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await removeBookmark(diaryId);
      setDiaries(diaries.filter((d) => d.id !== id));
    } catch (err) {
      console.error("북마크 삭제 실패:", err);
      alert("북마크 삭제에 실패했습니다.");
    }
  };

  const toggleBookmark = async (id: number, diaryId: number) => {
    try {
      await removeBookmark(diaryId);
      setDiaries(diaries.filter((d) => d.id !== id));
    } catch (err) {
      console.error("북마크 제거 실패:", err);
      alert("북마크 제거에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center mt-24">
          <h1 className="text-5xl font-['jsMath-cmti10'] text-[#8E573E] font-bold mb-8">
            mooDiary
          </h1>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={loadBookmarks}
            className="mt-4 px-6 py-2 bg-[#FF9E0D] text-white rounded-lg hover:brightness-110"
          >
            다시 시도
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* 메인 타이틀 */}
      <div className="text-center mt-24">
        <h1 className="text-5xl font-['jsMath-cmti10'] text-[#8E573E] font-bold">
          mooDiary
        </h1>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="flex justify-center gap-6 mt-16">
        {/* 북마크 수 */}
        <div className="w-[200px] h-[100px] bg-[#E6D5F5] rounded-lg flex flex-col items-center justify-center shadow-md">
          <span className="text-4xl font-bold text-[#8B5CF6]">{bookmarkCount}</span>
          <span className="text-lg text-gray-700 mt-1">북마크 수</span>
        </div>
      </div>

      {/* 북마크된 일기 카드 섹션 */}
      <div className="mt-16 pb-16">
        {diaries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">북마크된 일기가 없습니다.</p>
            <button
              onClick={() => navigate("/records")}
              className="mt-4 px-6 py-2 bg-[#FF9E0D] text-white rounded-lg hover:brightness-110"
            >
              일기 보러가기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto px-4">
            {diaries.map((diary) => (
              <div
                key={diary.id}
                className="relative bg-[#FFF9E6] rounded-lg p-6 shadow-md border-2 border-[#FFD66B] hover:shadow-lg transition-shadow"
              >
                {/* 북마크 아이콘 */}
                <button
                  onClick={() => toggleBookmark(diary.id, diary.diaryId)}
                  className="absolute -top-3 -left-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                >
                  <BookmarkIcon
                    className="w-5 h-5 text-white"
                    fill={diary.isBookmarked ? "white" : "none"}
                  />
                </button>

                {/* 이미지 플레이스홀더 */}
                <div className="w-full h-32 bg-[#FFE8B3] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-16 h-16 text-[#FFA726]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* 제목 */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {diary.title}
                  </h3>
                </div>

                {/* 날짜 */}
                <p className="text-sm text-gray-500 mb-3">{diary.date}</p>

                {/* 내용 미리보기 */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {diary.content}
                </p>

                {/* 버튼 그룹 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(diary.diaryId)}
                    className="flex-1 py-2 px-4 bg-white border-2 border-[#FFD66B] text-gray-700 rounded-lg hover:bg-[#FFF5D6] transition-colors text-sm font-medium"
                  >
                    수정하기
                  </button>
                  <button
                    onClick={() => handleDelete(diary.id, diary.diaryId)}
                    className="flex-1 py-2 px-4 bg-white border-2 border-[#FFD66B] text-gray-700 rounded-lg hover:bg-[#FFF5D6] transition-colors text-sm font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 추가 추천 섹션 */}
      <div className="bg-[#FFF9E6] py-12 mt-8 border-t-2 border-[#FFD66B]">
        <p className="text-center text-2xl text-gray-700 mb-6">
          더 많은 추억을 만들어보세요.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate("/write-edit")}
            className="px-8 py-3 bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white rounded-lg shadow-md hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span className="text-xl">▶</span>
            새 일기 작성하기
          </button>
          <button 
            onClick={() => navigate("/records")}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-all"
          >
            📋 일기 보러가기
          </button>
          <button 
            onClick={() => navigate("/main")}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-all"
          >
            🔍 메인으로 가기
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
