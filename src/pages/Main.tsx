import { useState, useEffect } from "react";
import writeBgImg from "@/assets/writeBgImg.png";
import recordBg from "@/assets/recordBg.png";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { RECOMMENDATION_CATEGORIES } from "@/constants/navigation";
import { PageLayout } from "@/components/common/PageLayout";
import { getTodayDiary, getRecentDiaries } from "@/lib/apiClient";
import type { DiaryResponse } from "@shared/types";

// 감정별 이모지 매핑
const EMOTION_EMOJI: Record<string, string> = {
  HAPPY: "😊",
  SAD: "😢",
  ANGRY: "😠",
  NEUTRAL: "😐",
  ANXIOUS: "😰",
  SURPRISED: "😲",
  DISGUST: "🤢",
};

// 날짜 포맷 변환 함수 - 일기 작성 당일 날짜를 안전하게 추출
const formatDate = (dateString: string): string => {
  if (!dateString) {
    // 날짜가 없으면 오늘 날짜 사용
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}`;
  }
  
  try {
    let date = new Date(dateString);
    
    // 유효하지 않은 날짜인지 확인
    if (isNaN(date.getTime())) {
      // 다른 형식 시도: 공백을 T로 변환
      const normalized = dateString.replace(' ', 'T');
      date = new Date(normalized);
      
      // 여전히 유효하지 않으면 오늘 날짜 사용
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // NaN 체크 - 유효하지 않으면 오늘 날짜 사용
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      return `${y}. ${m}. ${d}`;
    }
    
    return `${year}. ${String(month).padStart(2, "0")}. ${String(day).padStart(2, "0")}`;
  } catch (error) {
    console.error("날짜 파싱 오류:", error);
    // 오류 발생 시 오늘 날짜 사용
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}`;
  }
};

// 내용 요약 함수 (첫 30자)
const summarizeContent = (content: string): string => {
  return content.length > 30 ? content.substring(0, 30) + "..." : content;
};

export default function Index() {
  const navigate = useNavigate();
  const { user } = useUserData();
  const [todayDiary, setTodayDiary] = useState<DiaryResponse | null>(null);
  const [recentDiaries, setRecentDiaries] = useState<DiaryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // 일기 데이터 로드
  useEffect(() => {
    const loadDiaries = async () => {
      try {
        setLoading(true);
        // 오늘 일기와 최근 일기 동시에 로드
        const [today, recent] = await Promise.all([
          getTodayDiary(),
          getRecentDiaries(),
        ]);
        setTodayDiary(today);
        setRecentDiaries(recent);
      } catch (err) {
        console.error("일기 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDiaries();
  }, []);

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
                  {todayDiary ? (
                    <button
                      onClick={() => navigate(`/write?id=${todayDiary.id}`)}
                      className="w-full h-full rounded-md bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-white font-semibold hover:brightness-110 flex justify-center items-center gap-2"
                    >
                      ✓ 오늘의 일기 보기
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/write")}
                      className="w-full h-full rounded-md bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white font-semibold hover:brightness-110 flex justify-center items-center gap-2"
                    >
                      + 오늘의 일기 작성하기
                    </button>
                  )}
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
              
              {loading ? (
                <div className="flex justify-center items-center mt-16 min-h-[203px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E573E]"></div>
                </div>
              ) : recentDiaries.length > 0 ? (
                <>
                  <div className="w-full max-w-[700px] mx-auto flex justify-center items-center gap-8 mt-16 flex-wrap">
                    {recentDiaries.map((diary) => {
                      const emotion = diary.emotionAnalysis?.integratedEmotion?.emotion || "NEUTRAL";
                      const emoji = EMOTION_EMOJI[emotion] || "😐";
                      
                      return (
                        <div
                          key={diary.id}
                          className="p-5 bg-white rounded-[10px] inline-flex flex-col gap-3 w-[332px] h-[203px] bg-contain bg-center bg-no-repeat cursor-pointer hover:scale-105 transition-transform"
                          style={{
                            backgroundImage: `url(${recordBg})`,
                            backgroundSize: "contain",
                          }}
                          onClick={() => navigate(`/write?id=${diary.id}`)}
                        >
                          <div className="mt-2 self-stretch text-neutral-800 text-[22px] font-semibold font-['Inter'] capitalize tracking-tight">
                            <span className="text-[#9A623D] font-normal">
                              {formatDate(diary.createdAt)}
                            </span>
                          </div>
                          <div className="self-stretch text-neutral-500 text-xl font-normal font-['Inter'] leading-normal tracking-tight">
                            {summarizeContent(diary.content)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{emoji}</span>
                            <span className="text-sm text-gray-600">{emotion}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-64 h-12 mt-10 mx-auto">
                    <button
                      className="w-full h-full rounded-md bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white font-semibold hover:brightness-110"
                      onClick={() => navigate("/records")}
                    >
                      <span className="text-2xl font-['Inter']">
                        &gt; 모든 일기 보기
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center mt-16">
                  <p className="text-xl text-gray-500 mb-8">
                    아직 작성한 일기가 없습니다.
                  </p>
                  <button
                    onClick={() => navigate("/write")}
                    className="px-8 py-3 bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white rounded-lg shadow-lg hover:brightness-110 transition-all"
                  >
                    첫 일기 작성하기 →
                  </button>
                </div>
              )}
            </section>

            {/* 추천 콘텐츠 */}
            <section className="pb-16 mt-12">
              <h2 className="text-center">
                <span className="text-[40px] sm:text-3xl font-semibold font-['Inter'] text-[#8E573E]">
                  추천 콘텐츠
                </span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
                {RECOMMENDATION_CATEGORIES.map((item) => (
                  <div key={item.id} className="flex flex-col items-center gap-3">
                    <button 
                      onClick={() => navigate(`/${item.id === "book" ? "recommendation" : item.id}`)}
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
                ))}
              </div>
            </section>
    </PageLayout>
  );
}
