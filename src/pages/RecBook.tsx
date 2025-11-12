import { useState, useEffect } from "react";
import Placeholder from "@/components/Placeholder";
import Header from "@/components/layout/Header";
import Frame from "@/components/ui/frame";
import basicBookImg from "@/assets/basicBookImg.png";
import {
  getEmotionData,
  createBookRecommendation,
  createMovieRecommendation,
  createMusicRecommendation,
  createPoemRecommendation,
} from "@/lib/apiClient";

// 타입 정의
interface EmotionData {
  emotion?: string;
  description?: string;
  emoji?: string;
  temperature?: string;
}
interface Recommendation {
  imageUrl?: string | null;
  title: string;
  content: string;
  contentId?: string | null;
  author?: string;
}
interface Category {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

export default function RecBook() {
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("book");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [recommendLoading, setRecommendLoading] = useState<boolean>(false);

  // 감정 데이터 로드 (axios api 사용)
  useEffect(() => {
    const loadEmotionData = async () => {
      try {
        setLoading(true);
        const data = await getEmotionData();
        setEmotionData(data || null);
      } catch (err: any) {
        console.error("감정 데이터 로드 실패:", err);
        setError(err.message || "감정 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadEmotionData();
  }, []);

  // 카테고리 -> API 매핑
  const recommendationApiMap: Record<
    string,
    () => Promise<Recommendation | null>
  > = {
    book: async () => (await createBookRecommendation()) ?? null,
    movie: async () => (await createMovieRecommendation()) ?? null,
    music: async () => (await createMusicRecommendation()) ?? null,
    poem: async () => (await createPoemRecommendation()) ?? null,
    quote: async () => null,
  };

  // 추천 콘텐츠 로드
  const handleCategorySelect = async (category: string) => {
    if (selectedCategory === category && recommendation) return;

    setSelectedCategory(category);
    setRecommendLoading(true);
    setError(null);

    try {
      const loader = recommendationApiMap[category];
      if (!loader) throw new Error("해당 카테고리의 추천 API가 없습니다.");
      const data = await loader();
      setRecommendation(data);
    } catch (err: any) {
      console.error(`추천 콘텐츠 로드 실패 (${category}):`, err);
      setError(err.message || `추천 콘텐츠를 불러오지 못했습니다: ${category}`);
      setRecommendation(null);
    } finally {
      setRecommendLoading(false);
    }
  };

  const categories: Category[] = [
    { id: "book", label: "책", icon: "📚" },
    { id: "movie", label: "영화", icon: "🎬" },
    { id: "music", label: "음악", icon: "🎵" },
    { id: "poem", label: "시", icon: "📜" },
    { id: "quote", label: "명언", icon: "💭", disabled: true },
  ];

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      book: "from-blue-500 to-purple-600",
      movie: "from-red-500 to-pink-600",
      music: "from-green-500 to-teal-600",
      poem: "from-indigo-500 to-blue-600",
      quote: "from-yellow-500 to-orange-600",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E573E] mx-auto"></div>
          <p className="mt-4 text-[#8E573E]">감정 분석 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#8E573E] text-white rounded-lg hover:bg-[#7D4D37]"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-white w-full" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-[1217px] h-[1980px] flex flex-col">
        <section className="flex flex-1 h-full">
          <Frame />
          <div className="mt-16 flex flex-col flex-1 h-[1900px]" style={{ background: 'linear-gradient(90deg, #FFEAB1 7.55%, #FFDED3 121.31%)' }}>
            <Header />

            {/* 메인 콘텐츠 */}
            <section className="flex flex-col items-center mt-12 max-w-[1021px] mx-auto">
              {/* 타이틀 섹션 */}
              <div className="text-center mb-12">
                <div className="flex justify-center">
                  <span className="text-5xl font-['jsMath-cmti10'] text-[#8E573E] font-normal">
                    mooDiary
                  </span>
                </div>
                <div className="flex justify-center mt-6">
                  <span className="text-2xl font-normal font-['Inter'] text-[#8E573E]">
                    당신의 감정에 맞는 특별한 추천
                  </span>
                </div>
                <div className="flex justify-center mt-2">
                  <span className="text-lg font-['Inter'] text-[#FDA54E] max-w-2xl">
                    AI가 분석한 감정을 바탕으로 책, 영화, 음악 등을 추천해드려요!
                  </span>
                </div>
              </div>

              {/* 감정 표시 섹션 */}
              <div
                className={`flex flex-col justify-center items-center w-full max-w-[915px] h-[323px] rounded-lg p-6 shadow-lg mb-8 ${
                  emotionData?.temperature === "따뜻함"
                    ? "bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 border border-green-200"
                    : "bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 border border-purple-200"
                }`}
              >
                {emotionData ? (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      <div className="text-6xl mb-2">
                        {emotionData.emoji || "😊"}
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800">
                        오늘의 감정: {emotionData.emotion || "알 수 없음"}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {emotionData.description ||
                          "감정 데이터를 불러오는 중입니다."}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 text-lg">
                        "
                        {emotionData.description ||
                          "오늘의 감정을 분석 중입니다."}
                        "
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">감정 데이터를 불러오는 중입니다...</p>
                  </div>
                )}
              </div>

              {/* 카테고리 버튼들 */}
              <div className="flex flex-wrap justify-center gap-4 w-full max-w-[915px] mb-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    disabled={recommendLoading || category.disabled}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium text-white shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[140px] ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${getCategoryColor(category.id)}`
                        : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>

              {/* 추천 콘텐츠 표시 영역 */}
              {recommendLoading ? (
                <div className="mt-8 flex items-center justify-center w-full max-w-[915px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E573E]"></div>
                  <span className="ml-2 text-gray-600">추천을 불러오는 중입니다...</span>
                </div>
              ) : recommendation ? (
                <div className="w-full max-w-[930px] bg-gradient-to-b from-[#FFFBF2] to-[#FFF3D7] p-6 rounded-lg shadow-lg">
                  {selectedCategory === "book" ? (
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* 추천 도서 섹션 */}
                      <div className="flex-1 bg-gradient-to-br from-white to-[#F8EFA9] p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">📚</span>
                          <h3 className="text-xl font-semibold text-[#7D4D37]">오늘의 추천 도서</h3>
                        </div>
                        <img
                          src={recommendation.imageUrl || basicBookImg}
                          alt={`책 표지: ${recommendation.title || "추천 도서"}`}
                          className="w-[272px] h-[347px] object-cover rounded-lg shadow-md mx-auto"
                        />
                        <div className="mt-4">
                          <p className="text-lg font-semibold text-[#7D4D37]">제목: {recommendation.title || "알 수 없음"}</p>
                          <p className="text-base text-[#7D4D37] mt-1">저자: {recommendation.author || "알 수 없음"}</p>
                        </div>
                      </div>
                      {/* 작품 설명 섹션 */}
                      <div className="flex-1 bg-gradient-to-br from-white to-[#F8EFA9] p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">📝</span>
                          <h3 className="text-xl font-semibold text-[#7D4D37]">작품 설명</h3>
                        </div>
                        <p className="text-base text-[#7D4D37] leading-relaxed">{recommendation.content || "이 작품은 당신의 감정을 더욱 풍부하게 만들어줄 것입니다."}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full p-6 bg-gradient-to-br from-white to-[#F8EFA9] rounded-lg shadow-md">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{categories.find((cat) => cat.id === selectedCategory)?.icon}</span>
                        <h3 className="text-xl font-semibold text-[#7D4D37]">추천 {categories.find((cat) => cat.id === selectedCategory)?.label}</h3>
                      </div>
                      {recommendation.imageUrl && (
                        <img
                          src={recommendation.imageUrl}
                          alt={`추천 ${selectedCategory}: ${recommendation.title || "추천 콘텐츠"}`}
                          className="w-[272px] h-[347px] object-cover rounded-lg shadow-md mx-auto mb-4"
                        />
                      )}
                      <p className="text-lg font-semibold text-[#7D4D37]">제목: {recommendation.title || "알 수 없음"}</p>
                      <p className="text-base text-[#7D4D37] mt-1 leading-relaxed">{recommendation.content || "추천 콘텐츠가 준비되었습니다."}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-[915px] p-6 bg-white rounded-lg shadow-lg">
                  <p className="text-gray-500">추천 콘텐츠를 선택해주세요.</p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
