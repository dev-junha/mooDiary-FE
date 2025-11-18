import { useState } from "react";
import { PageLayout } from "../components/common/PageLayout";
import { Bookmark as BookmarkIcon } from "lucide-react";

interface DiaryCard {
  id: number;
  title: string;
  date: string;
  temperature: string;
  content: string;
  progress: number;
  isBookmarked: boolean;
}

// TODO: API에서 받아올 데이터 (임시 데이터)
const mockBookmarkedDiaries: DiaryCard[] = [
  {
    id: 1,
    title: "새로운 시작",
    date: "2025.08.28",
    temperature: "37.5°C",
    content: "오늘은 새로운 프로젝트를 시작했다. 설레는 마음으로 첫 걸음을 내딛었다. 앞으로 어떤 일들이 기다리고 있을지 기대가 된다...",
    progress: 75,
    isBookmarked: true,
  },
  {
    id: 2,
    title: "새로운 시작",
    date: "2025.08.28",
    temperature: "37.5°C",
    content: "오늘은 새로운 프로젝트를 시작했다. 설레는 마음으로 첫 걸음을 내딛었다. 앞으로 어떤 일들이 기다리고 있을지 기대가 된다...",
    progress: 75,
    isBookmarked: true,
  },
  {
    id: 3,
    title: "새로운 시작",
    date: "2025.08.28",
    temperature: "37.5°C",
    content: "오늘은 새로운 프로젝트를 시작했다. 설레는 마음으로 첫 걸음을 내딛었다. 앞으로 어떤 일들이 기다리고 있을지 기대가 된다...",
    progress: 75,
    isBookmarked: true,
  },
  {
    id: 4,
    title: "새로운 시작",
    date: "2025.08.28",
    temperature: "37.5°C",
    content: "오늘은 새로운 프로젝트를 시작했다. 설레는 마음으로 첫 걸음을 내딛었다. 앞으로 어떤 일들이 기다리고 있을지 기대가 된다...",
    progress: 75,
    isBookmarked: true,
  },
  {
    id: 5,
    title: "새로운 시작",
    date: "2025.08.28",
    temperature: "37.5°C",
    content: "오늘은 새로운 프로젝트를 시작했다. 설레는 마음으로 첫 걸음을 내딛었다. 앞으로 어떤 일들이 기다리고 있을지 기대가 된다...",
    progress: 75,
    isBookmarked: true,
  },
];

export default function Bookmark() {
  const [diaries, setDiaries] = useState<DiaryCard[]>(mockBookmarkedDiaries);

  // 통계 데이터
  const bookmarkCount = diaries.filter((d) => d.isBookmarked).length;
  const averageTemp = 37.8; // TODO: 실제 평균 온도 계산
  const totalDiaryCount = 47; // TODO: API에서 가져오기

  const handleEdit = (id: number) => {
    console.log("수정하기:", id);
    // TODO: 수정 페이지로 이동
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setDiaries(diaries.filter((d) => d.id !== id));
      console.log("삭제:", id);
      // TODO: API 호출
    }
  };

  const toggleBookmark = (id: number) => {
    setDiaries(
      diaries.map((d) =>
        d.id === id ? { ...d, isBookmarked: !d.isBookmarked } : d
      )
    );
    // TODO: API 호출
  };

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
          <span className="text-4xl font-bold text-[#22C55E]">{averageTemp}°C</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto px-4">
          {diaries.map((diary) => (
            <div
              key={diary.id}
              className="relative bg-[#FFF9E6] rounded-lg p-6 shadow-md border-2 border-[#FFD66B] hover:shadow-lg transition-shadow"
            >
              {/* 북마크 아이콘 */}
              <button
                onClick={() => toggleBookmark(diary.id)}
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

              {/* 제목과 온도 */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {diary.title}
                </h3>
                <span className="text-sm text-gray-600">{diary.temperature}</span>
              </div>

              {/* 날짜 */}
              <p className="text-sm text-gray-500 mb-3">{diary.date}</p>

              {/* 내용 미리보기 */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {diary.content}
              </p>

              {/* 감정 진행 바 */}
              <div className="mb-4">
                <span className="text-xs text-gray-500 block mb-1">기쁨</span>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                    style={{ width: `${diary.progress}%` }}
                  />
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(diary.id)}
                  className="flex-1 py-2 px-4 bg-white border-2 border-[#FFD66B] text-gray-700 rounded-lg hover:bg-[#FFF5D6] transition-colors text-sm font-medium"
                >
                  수정하기
                </button>
                <button
                  onClick={() => handleDelete(diary.id)}
                  className="flex-1 py-2 px-4 bg-white border-2 border-[#FFD66B] text-gray-700 rounded-lg hover:bg-[#FFF5D6] transition-colors text-sm font-medium"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
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
