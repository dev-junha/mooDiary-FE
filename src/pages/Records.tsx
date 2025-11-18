import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/common/PageLayout";

interface DiaryCard {
  id: number;
  title: string;
  date: string;
  temperature: string;
  content: string;
  progress: number;
  isRecorded: boolean;
}

// TODO: API에서 받아올 데이터 (임시 데이터)
const mockDiaries: DiaryCard[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  title: "새로운 시작",
  date: "2025.08.28",
  temperature: "37.5",
  content:
    "오늘은 새로운 프로젝트를 시작했다. 설레는 마음으로 첫 걸음을 내딛었다. 앞으로 어떤 일들이 기다리고 있을지 기대가 된다. 새로운 도전은 언제나 흥미진진하다...",
  progress: 75,
  isRecorded: true,
}));

export default function Records() {
  const navigate = useNavigate();
  const [diaries] = useState<DiaryCard[]>(mockDiaries);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 페이지네이션 계산
  const totalPages = Math.ceil(diaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDiaries = diaries.slice(startIndex, endIndex);

  const handleEdit = (id: number) => {
    console.log("수정하기:", id);
    // TODO: 수정 페이지로 이동
    navigate(`/write?id=${id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      console.log("삭제:", id);
      // TODO: API 호출
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleWriteNew = () => {
    navigate("/write");
  };

  return (
    <PageLayout>
      {/* 메인 타이틀 */}
      <div className="text-center mt-24 mb-8">
        <h1 className="text-5xl font-['jsMath-cmti10'] text-[#8E573E] mb-4">
          mooDiary
        </h1>
        <h2 className="text-3xl font-semibold text-[#8E573E] mb-2">
          지난 일기
        </h2>
        <p className="text-lg text-[#C49B7A]">
          지금까지 기록한 모든 순간들을 되돌아보세요.
        </p>
      </div>

      {/* 통계 */}
      <div className="text-center mb-12">
        <h3 className="text-2xl font-semibold text-[#8E573E]">
          총 {diaries.length} 개의 기록
        </h3>
      </div>

      {/* 일기 카드 그리드 */}
      <div className="max-w-[900px] mx-auto mb-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentDiaries.map((diary) => (
            <div
              key={diary.id}
              className="bg-[#FFFEF9] rounded-lg p-6 shadow-md border-4 border-[#FFD66B] relative"
            >
              {/* 기록 표시 아이콘 */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-sm text-gray-600">기록</span>
              </div>

              {/* 제목과 날짜 */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2 pr-16">
                {diary.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{diary.date}</p>

              {/* 내용 미리보기 */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {diary.content}
              </p>

              {/* 기분 슬라이더 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">기분</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {diary.temperature}°C
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full transition-all"
                    style={{ width: `${diary.progress}%` }}
                  />
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(diary.id)}
                  className="flex-1 py-2 px-4 bg-white border-2 border-[#FFD66B] text-gray-700 rounded-md hover:bg-[#FFF9E6] transition-colors text-sm font-medium"
                >
                  수정하기
                </button>
                <button
                  onClick={() => handleDelete(diary.id)}
                  className="flex-1 py-2 px-4 bg-[#FF6B6B] text-white rounded-md hover:bg-[#FF5252] transition-colors text-sm font-medium"
                >
                  삭제하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mb-12">
        {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-8 h-8 rounded ${
                currentPage === pageNum
                  ? "bg-[#8E573E] text-white font-semibold"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } transition-colors`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* 새로운 일기 작성 버튼 */}
      <div className="flex justify-center mb-16">
        <button
          onClick={handleWriteNew}
          className="px-8 py-3 bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2 text-lg font-semibold"
        >
          새로운 일기 작성하기 →
        </button>
      </div>
    </PageLayout>
  );
}

