import { useState, useEffect } from "react";
import writeBgImg from "../assets/writeBgImg.png";
import recordBg from "../assets/recordBg.png";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/useUserData";
import { RECOMMENDATION_CATEGORIES } from "../constants/navigation";
import { PageLayout } from "../components/common/PageLayout";
import { getRecentDiaries, getTodayDiary } from "../lib/apiClient";
import type { DiaryResponse } from "../../shared/types";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

// 감정을 온도와 진행도로 변환하는 헬퍼 함수
const getEmotionMetrics = (emotion: string) => {
  const emotionMap: Record<string, { temperature: string; progress: number }> = {
    HAPPY: { temperature: "38.5", progress: 85 },
    SAD: { temperature: "35.2", progress: 40 },
    ANGRY: { temperature: "40.1", progress: 95 },
    ANXIOUS: { temperature: "36.8", progress: 60 },
    CALM: { temperature: "37.0", progress: 70 },
  };
  return emotionMap[emotion] || { temperature: "37.0", progress: 50 };
};

// 날짜 포맷팅 헬퍼 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}`;
};

// 감정을 한글로 변환하는 헬퍼 함수
const getEmotionLabel = (emotion: string) => {
  const emotionLabels: Record<string, string> = {
    HAPPY: "행복함",
    SAD: "슬픔",
    ANGRY: "화남",
    ANXIOUS: "불안함",
    CALM: "평온함",
  };
  return emotionLabels[emotion] || "알 수 없음";
};

export default function Index() {
  const navigate = useNavigate();
  const { user } = useUserData();
  const [recentDiaries, setRecentDiaries] = useState<DiaryResponse[]>([]);
  const [todayDiary, setTodayDiary] = useState<DiaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 최근 일기 4개와 오늘 일기 동시 조회
        const [diaries, today] = await Promise.all([
          getRecentDiaries(),
          getTodayDiary(),
        ]);
        
        // 배열인지 다시 한번 확인 (타입 가드)
        if (Array.isArray(diaries)) {
          setRecentDiaries(diaries);
        } else {
          console.warn("최근 일기 데이터가 배열이 아닙니다:", diaries);
          setRecentDiaries([]);
        }
        setTodayDiary(today);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError("데이터를 불러오는데 실패했습니다.");
        setRecentDiaries([]); // 에러 시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
            {/* 메인 섹션 */}
            <section className="mt-24 flex flex-col justify-center items-center flex-1">
              <div>
                <span className="text-5xl font-['jsMath-cmti10'] text-[#8E573E] font-bold">
                  mooDiary
                </span>
              </div>
              <div className="mt-12">
                <span className="text-4xl">안녕하세요, {user.nickname}님!</span>
              </div>
              <div className="mt-16">
                <span className="text-2xl">
                  오늘의 감정을 표현해 보세요. <br /> 당신의 하루가 어떠셨나요?
                </span>
              </div>

              {/* 일기 작성 영역 */}
              <div
                className="mt-8 flex flex-col items-center w-[360px] aspect-[1696/1284] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${writeBgImg})` }}
              >
                <div className="flex rounded-lg shadow-sm h-[92px] w-[92px] mt-16">
                  <img
                    src="/diaries.png"
                    alt="다이어리 이미지"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex w-[240px] h-[35px] mt-8">
                  <button
                    onClick={() => navigate("/write")}
                    className="w-full h-full rounded-md bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white font-semibold hover:brightness-110 flex justify-center items-center gap-2"
                  >
                    + 오늘의 일기 작성하기
                  </button>
                </div>
              </div>
            </section>

            {/* 최근 일기 기록 */}
            <section className="py-16">
              <div className="text-center">
                <h2 className="mt-1 text-[40px] sm:text-3xl font-semibold tracking-tight text-[#8E573E] font-['Inter']">
                  최근 일기 기록
                </h2>
              </div>
              <div className="w-full max-w-[700px] mx-auto flex justify-center items-center gap-8 mt-16 flex-wrap">
                {recentDiaries.length === 0 ? (
                  <div className="text-gray-500 text-xl">
                    아직 작성된 일기가 없습니다.
                  </div>
                ) : (
                  recentDiaries.map((diary) => {
                    const emotion = diary.emotionAnalysis.integratedEmotion.emotion;
                    const metrics = getEmotionMetrics(emotion);
                    const summary = diary.content.length > 50 
                      ? diary.content.substring(0, 50) + "..." 
                      : diary.content;

                    return (
                      <div
                        key={diary.id}
                        className="p-5 bg-white rounded-[10px] inline-flex flex-col gap-3 w-[332px] h-[203px] bg-contain bg-center bg-no-repeat cursor-pointer hover:shadow-lg transition-shadow"
                        style={{
                          backgroundImage: `url(${recordBg})`,
                          backgroundSize: "contain",
                        }}
                        onClick={() => navigate(`/diary/${diary.id}`)}
                      >
                        <div className="mt-2 self-stretch text-neutral-800 text-[22px] font-semibold font-['Inter'] capitalize tracking-tight">
                          <span className="text-[#9A623D] font-normal">
                            {formatDate(diary.createdAt)}
                          </span>
                        </div>
                        <div className="self-stretch text-neutral-500 text-base font-normal font-['Inter'] leading-normal tracking-tight line-clamp-2">
                          오늘의 감정: {getEmotionLabel(emotion)}
                        </div>
                        {/* 감정 온도 그래프 */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">기분</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {metrics.temperature}°C
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full transition-all"
                              style={{ width: `${metrics.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="w-64 h-12 mt-10 mx-auto">
                <button 
                  onClick={() => navigate("/records")}
                  className="w-full h-full rounded-md bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white font-semibold hover:brightness-110"
                >
                  <span className="text-2xl font-['Inter']">
                    &gt; 모든 일기 보기
                  </span>
                </button>
              </div>
            </section>

            {/* 추천 콘텐츠 */}
            <section className="pb-16 mt-12">
              <h2 className="text-center">
                <span className="text-[40px] sm:text-3xl font-semibold font-['Inter'] text-[#8E573E]">
                  추천 콘텐츠
                </span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
                {RECOMMENDATION_CATEGORIES.map((item) => {
                  // 각 카테고리별 라우트 매핑
                  const getRoutePath = (id: string) => {
                    switch (id) {
                      case "book":
                        return "/recommendation";
                      case "movie":
                        return "/movies";
                      case "music":
                        return "/music";
                      case "poem":
                        return "/poem";
                      case "phrase":
                        return "/phrase";
                      default:
                        return "/main";
                    }
                  };

                  return (
                    <div key={item.id} className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => navigate(getRoutePath(item.id))}
                        className="grid w-[133px] h-[101px] place-items-center rounded-md hover:scale-105 transition-transform"
                      >
                        <img
                          src={item.icon}
                          alt={`${item.label} 아이콘`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
    </PageLayout>
  );
}
