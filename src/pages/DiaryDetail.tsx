import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/common/PageLayout";
import { getDiaryById, getUserId, deleteDiary, type DiaryDtoResponse } from "@/lib/apiClient";
import { useUserData } from "@/hooks/useUserData";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

// 날짜 포맷 변환 함수
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error("날짜 파싱 오류:", error);
    return "";
  }
};

// 일기 제목 추출 함수 (내용의 첫 50자)
const getTitleFromContent = (content: string): string => {
  if (!content) return "제목 없음";
  return content.length > 50 ? content.substring(0, 50) + "..." : content;
};

// 감정별 이모지 매핑
const EMOTION_EMOJI: Record<string, string> = {
  HAPPY: "😊",
  SAD: "😢",
  ANGRY: "😠",
  ANXIOUS: "😰",
  NEUTRAL: "😐",
  SURPRISED: "😲",
  DISGUST: "🤢",
  CALM: "😌",
  EXCITED: "🤩",
};

export default function DiaryDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserData();
  const [diary, setDiary] = useState<DiaryDtoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const diaryId = searchParams.get("id");

  useEffect(() => {
    const fetchDiary = async () => {
      if (!diaryId) {
        setError("일기 ID가 없습니다.");
        setLoading(false);
        return;
      }

      const userId = user.id || getUserId();

      try {
        setLoading(true);
        setError(null);
        const data = await getDiaryById(diaryId);
        setDiary(data);
      } catch (err) {
        console.error("일기 조회 실패:", err);
        setError("일기를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [diaryId, user.id]);

  const handleBack = () => {
    navigate("/records");
  };

  const handleEdit = () => {
    if (diaryId) {
      navigate(`/write?id=${diaryId}`);
    }
  };

  const handleDelete = async () => {
    if (!diary || !confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteDiary(diary.id);
      alert("일기가 삭제되었습니다.");
      navigate("/records");
    } catch (err) {
      console.error("일기 삭제 실패:", err);
      alert("일기 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8E573E] mb-4"></div>
            <p className="text-lg text-[#8E573E]">일기를 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !diary) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-4">{error || "일기를 찾을 수 없습니다."}</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-[#8E573E] text-white rounded-md hover:bg-[#7A4A35] transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const emotion = diary.emotionAnalysis?.integratedEmotion?.emotion || "NEUTRAL";
  const emoji = EMOTION_EMOJI[emotion] || "😐";

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mt-8 mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#8E573E] hover:text-[#7A4A35] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </button>

        {/* 제목 영역 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-['jsMath-cmti10'] text-[#8E573E] font-bold mb-2">
              {getTitleFromContent(diary.content)}
            </h1>
            <p className="text-lg text-gray-500">{formatDate(diary.createdAt)}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-[#8E573E] text-white rounded-lg hover:bg-[#7A4A35] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Edit className="w-4 h-4 flex-shrink-0" />
              <span>수정</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span>삭제</span>
            </button>
          </div>
        </div>

        {/* 일기 내용 카드 */}
        <div className="bg-[#FFFEF9] rounded-lg p-8 shadow-md border-4 border-[#FFD66B] mb-6">
          {/* 이미지 */}
          {diary.imageUrl && (
            <div className="mb-6">
              <img
                src={diary.imageUrl}
                alt="일기 이미지"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 일기 내용 */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
              {diary.content}
            </p>
          </div>

          {/* 감정 분석 결과 */}
          {diary.emotionAnalysis && (
            <div className="border-t-2 border-[#FFD66B] pt-6">
              <h3 className="text-xl font-semibold text-[#8E573E] mb-4">감정 분석</h3>
              
              {/* 통합 감정 */}
              <div className="mb-4 p-4 bg-[#FFF9E6] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {diary.emotionAnalysis.integratedEmotion?.emotion || "NEUTRAL"}
                    </p>
                    <p className="text-sm text-gray-600">
                      신뢰도: {((diary.emotionAnalysis.integratedEmotion?.confidence || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 텍스트 감정 */}
              {diary.emotionAnalysis.textEmotion && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">텍스트 감정</p>
                  <p className="text-base font-medium text-gray-800">
                    {diary.emotionAnalysis.textEmotion.emotion} 
                    <span className="text-sm text-gray-600 ml-2">
                      (점수: {diary.emotionAnalysis.textEmotion.score?.toFixed(2) || "N/A"})
                    </span>
                  </p>
                </div>
              )}

              {/* 얼굴 감정 */}
              {diary.emotionAnalysis.facialEmotion && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">얼굴 감정</p>
                  <p className="text-base font-medium text-gray-800">
                    {diary.emotionAnalysis.facialEmotion.emotion}
                    <span className="text-sm text-gray-600 ml-2">
                      (점수: {diary.emotionAnalysis.facialEmotion.score?.toFixed(2) || "N/A"})
                    </span>
                  </p>
                </div>
              )}

              {/* 키워드 */}
              {diary.emotionAnalysis.keywords && diary.emotionAnalysis.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">주요 키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {diary.emotionAnalysis.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#FFF9E6] text-[#8E573E] text-sm rounded-full border border-[#FFD66B]"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 타임스탬프 */}
              {diary.emotionAnalysis.timestamp && (
                <p className="text-xs text-gray-500">
                  분석 시간: {new Date(diary.emotionAnalysis.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

