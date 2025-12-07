import { useState, useEffect } from "react";
import { PageLayout } from "@/components/common/PageLayout.tsx";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { getBookmarksWithStats, removeBookmark, deleteDiary } from "@/lib/apiClient";
import type { BookmarkItem } from "@shared/types";

export default function Bookmark() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 통계 데이터
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [averageTemp, setAverageTemp] = useState(0);
  const [totalDiaryCount, setTotalDiaryCount] = useState(0);

  // 북마크 데이터 로드
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBookmarksWithStats();
      setBookmarks(data.bookmarks || []);
      setBookmarkCount(data.numberOfBookmarkedDiary || 0);
      setAverageTemp(data.averageTemperature || 0);
      setTotalDiaryCount(data.numberOfTotalDiary || 0);
    } catch (err) {
      setError("북마크를 불러오는데 실패했습니다.");
      console.error(err);
      // 에러 발생 시 기본값 설정
      setBookmarks([]);
      setBookmarkCount(0);
      setAverageTemp(0);
      setTotalDiaryCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (diaryId: number) => {
    console.log("수정하기:", diaryId);
    // TODO: 수정 페이지로 이동
    // navigate(`/diary/edit/${diaryId}`);
  };

  const handleDelete = async (diaryId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      await deleteDiary(diaryId);
      // 삭제 성공 시 목록에서 제거
      setBookmarks((prev) => (prev || []).filter((b) => b.diaryId !== diaryId));
    } catch (err) {
      alert("일기 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  const handleToggleBookmark = async (diaryId: number) => {
    try {
      // 북마크 해제
      await removeBookmark(diaryId);
      // UI에서 제거하고 통계 업데이트
      setBookmarks((prev) => (prev || []).filter((b) => b.diaryId !== diaryId));
      setBookmarkCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert("북마크 해제에 실패했습니다.");
      console.error(err);
    }
  };

  // 날짜 포맷팅 함수 - 일기 작성 당일 날짜를 안전하게 추출
  const formatDate = (dateString: string) => {
    if (!dateString) {
      // 날짜가 없으면 오늘 날짜 사용
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    }
    
    try {
      // LocalDateTime 형식 (예: "2024-01-15T10:30:00" 또는 "2024-01-15T10:30:00.123")
      let date: Date;
      
      if (typeof dateString === 'string') {
        // ISO 형식이 아닌 경우를 대비해 여러 형식 시도
        date = new Date(dateString);
        
        // Invalid Date 체크
        if (isNaN(date.getTime())) {
          // 다른 형식 시도: "2024-01-15 10:30:00" 형식
          const normalized = dateString.replace(' ', 'T');
          date = new Date(normalized);
          
          // 여전히 유효하지 않으면 오늘 날짜 사용
          if (isNaN(date.getTime())) {
            date = new Date();
          }
        }
      } else {
        // 문자열이 아니면 오늘 날짜 사용
        date = new Date();
      }
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // NaN 체크 - 유효하지 않으면 오늘 날짜 사용
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        return `${y}.${m}.${d}`;
      }
      
      return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
    } catch (error) {
      console.error("날짜 파싱 오류:", error, dateString);
      // 오류 발생 시 오늘 날짜 사용
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-xl text-gray-600">북마크를 불러오는 중...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={loadBookmarks}
            className="px-6 py-2 bg-[#8E573E] text-white rounded-lg hover:bg-[#7A4A35] transition-colors"
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

        {/* 평균 북마크 온도 */}
        <div className="w-[200px] h-[100px] bg-[#D1F5D3] rounded-lg flex flex-col items-center justify-center shadow-md border-2 border-[#4ADE80]">
          <span className="text-4xl font-bold text-[#22C55E]">{(averageTemp || 0).toFixed(1)}°C</span>
          <span className="text-lg text-gray-700 mt-1">평균 북마크 온도</span>
        </div>

        {/* 총 일기 수 */}
        <div className="w-[200px] h-[100px] bg-[#DBEAFE] rounded-lg flex flex-col items-center justify-center shadow-md">
          <span className="text-4xl font-bold text-[#3B82F6]">{totalDiaryCount}</span>
          <span className="text-lg text-gray-700 mt-1">총 일기 수</span>
        </div>
      </div>

      {/* 북마크된 일기 카드 섹션 */}
      <div className="mt-16 pb-16">
        {!bookmarks || bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 mb-4">북마크한 일기가 없습니다</p>
            <p className="text-gray-400">마음에 드는 일기를 북마크해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto px-4">
            {(bookmarks || []).map((bookmark, index) => (
              <div
                key={`${bookmark.diaryId}-${index}`}
                className="relative bg-[#FFF9E6] rounded-lg p-6 shadow-md border-2 border-[#FFD66B] hover:shadow-lg transition-shadow"
              >
                {/* 북마크 아이콘 */}
                <button
                  onClick={() => handleToggleBookmark(bookmark.diaryId)}
                  className="absolute -top-3 -left-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                  title="북마크 해제"
                >
                  <BookmarkIcon
                    className="w-5 h-5 text-white"
                    fill="white"
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

                {/* 일기 ID와 온도 */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    일기 #{bookmark.diaryId}
                  </h3>
                  <span className="text-sm text-gray-600">{(bookmark.temperature || 0).toFixed(1)}°C</span>
                </div>

                {/* 날짜 */}
                <p className="text-sm text-gray-500 mb-3">{formatDate(bookmark.createdAt)}</p>

                {/* 내용 미리보기 */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {bookmark.content}
                </p>

                {/* 버튼 그룹 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(bookmark.diaryId)}
                    className="flex-1 py-2 px-4 bg-white border-2 border-[#FFD66B] text-gray-700 rounded-lg hover:bg-[#FFF5D6] transition-colors text-sm font-medium"
                  >
                    수정하기
                  </button>
                  <button
                    onClick={() => handleDelete(bookmark.diaryId)}
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
          <button className="px-8 py-3 bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white rounded-lg shadow-md hover:brightness-110 transition-all flex items-center gap-2">
            <span className="text-xl">▶</span>
            새 일기 작성하기
          </button>
          <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-all">
            📋 입시자료 페이지
          </button>
          <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-all">
            🔍 감정 분석 보기
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
