import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/common/PageLayout";
import { getDiaryById, getUserId, deleteDiary, updateDiary, type DiaryDtoResponse } from "@/lib/apiClient";
import { useUserData } from "@/hooks/useUserData";
import { ArrowLeft, Edit, Trash2, Check } from "lucide-react";

// 날짜 포맷 변환 함수 - 일기 작성 당일 날짜를 안전하게 추출
const formatDate = (dateString: string | Date | null | undefined): string => {
  // 오늘 날짜 반환 헬퍼 함수
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  // 값이 없으면 오늘 날짜 반환
  if (!dateString) {
    return getTodayDate();
  }

  try {
    // Date 객체인 경우 직접 사용
    let date: Date;
    if (dateString instanceof Date) {
      date = dateString;
    } else {
      // 문자열인 경우에만 처리
      if (typeof dateString !== 'string') {
        return getTodayDate();
      }
      
      date = new Date(dateString);
      
      // 유효하지 않은 날짜인지 확인
      if (isNaN(date.getTime())) {
        // 다른 형식 시도: 공백을 T로 변환
        const normalized = dateString.replace(' ', 'T');
        date = new Date(normalized);
        
        // 여전히 유효하지 않으면 오늘 날짜 사용
        if (isNaN(date.getTime())) {
          return getTodayDate();
        }
      }
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // NaN 체크 - 유효하지 않으면 오늘 날짜 사용
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return getTodayDate();
    }
    
    // hours와 minutes가 NaN이면 0으로 설정
    const h = isNaN(hours) ? 0 : hours;
    const min = isNaN(minutes) ? 0 : minutes;
    
    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  } catch (error) {
    // 오류 발생 시 오늘 날짜 사용 (에러 로그 제거)
    return getTodayDate();
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

// 감정 영어 -> 한글 매핑
const EMOTION_TRANSLATION: Record<string, string> = {
  HAPPY: "행복",
  EXCITED: "흥분",
  CALM: "평온",
  ANXIOUS: "불안",
  ANGRY: "화남",
  SAD: "우울",
  NEUTRAL: "평온",
  SURPRISED: "놀람",
  DISGUST: "혐오",
  FEAR: "두려움",
};

// 감정을 한글로 변환하는 함수
const translateEmotion = (emotion: string | undefined): string => {
  if (!emotion) return "평온";
  return EMOTION_TRANSLATION[emotion.toUpperCase()] || emotion;
};

// 숫자 포맷팅 함수 (NaN 방지)
const formatNumber = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }
  return value.toFixed(decimals);
};

// 점수를 온도로 변환하는 함수 (0-100 점수를 36.0-38.0도로 매핑)
const getEmotionTemperature = (score: number | undefined | null): string => {
  if (score === undefined || score === null || isNaN(score)) {
    return "36.5°C";
  }
  // 점수 범위: 0-100을 36.0-38.0도로 매핑
  const temp = 36.0 + (score / 100) * 2.0;
  return `${temp.toFixed(1)}°C`;
};

export default function DiaryDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserData();
  const [diary, setDiary] = useState<DiaryDtoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleCursorPositionRef = useRef<number>(0);

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
        setEditedContent(data.content || "");
        setEditedTitle(getTitleFromContent(data.content || ""));
      } catch (err) {
        console.error("일기 조회 실패:", err);
        setError("일기를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [diaryId, user.id]);

  // 제목 수정 시 커서 위치 복원
  useEffect(() => {
    if (isEditing && titleInputRef.current && titleCursorPositionRef.current > 0) {
      const position = titleCursorPositionRef.current;
      titleInputRef.current.setSelectionRange(position, position);
    }
  }, [editedTitle, isEditing]);

  const handleBack = () => {
    navigate("/records");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (diary) {
      setEditedContent(diary.content || "");
      setEditedTitle(getTitleFromContent(diary.content || ""));
    }
  };

  const handleSave = async () => {
    if (!diary || !diaryId) return;

    try {
      setSaving(true);
      // 제목이 변경된 경우, editedContent의 첫 부분(제목 부분)을 교체
      let finalContent = editedContent;
      const originalContent = diary.content || "";
      const originalTitle = getTitleFromContent(originalContent);
      
      if (editedTitle !== originalTitle && editedTitle.trim()) {
        // 원본 content에서 제목 부분의 실제 길이 계산 (최대 50자, "..." 제외)
        const titleLength = originalContent.length > 50 ? 50 : originalContent.length;
        // editedContent의 첫 부분을 새 제목으로 교체
        const contentAfterTitle = editedContent.substring(titleLength);
        finalContent = editedTitle + contentAfterTitle;
      }
      
      const updatedDiary = await updateDiary(diaryId, finalContent, diary.imageUrl);
      setDiary(updatedDiary);
      setEditedContent(updatedDiary.content || "");
      setEditedTitle(getTitleFromContent(updatedDiary.content || ""));
      setIsEditing(false);
      alert("일기가 수정되었습니다.");
    } catch (err) {
      console.error("일기 수정 실패:", err);
      alert("일기 수정에 실패했습니다.");
    } finally {
      setSaving(false);
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

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="mt-8 mb-8 px-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#8E573E] hover:text-[#7A4A35] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </button>

        {/* 제목 영역 */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <span className="text-4xl font-['jsMath-cmti10'] text-[#8E573E] font-bold">제목</span>
              </div>
              {isEditing ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => {
                    const input = e.target;
                    const cursorPosition = input.selectionStart || 0;
                    const newValue = input.value;
                    // 커서 위치 저장 (입력된 문자 수를 고려)
                    const oldValue = editedTitle;
                    let newCursorPosition = cursorPosition;
                    
                    // 삭제가 아닌 경우 (입력인 경우)
                    if (newValue.length > oldValue.length) {
                      newCursorPosition = cursorPosition;
                    } else {
                      // 삭제인 경우
                      newCursorPosition = Math.max(0, cursorPosition);
                    }
                    
                    titleCursorPositionRef.current = newCursorPosition;
                    setEditedTitle(newValue);
                  }}
                  onKeyDown={(e) => {
                    // Enter 키로 줄바꿈 방지
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full text-4xl font-['jsMath-cmti10'] text-[#8E573E] font-bold mb-3 p-4 border-2 border-[#FFD66B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E573E] whitespace-nowrap overflow-hidden"
                  placeholder="제목을 입력하세요..."
                />
              ) : (
                <h1 className="text-4xl font-['jsMath-cmti10'] text-[#8E573E] font-bold mb-3 break-words">
                  {getTitleFromContent(diary.content)}
                </h1>
              )}
              <p className="text-lg text-gray-500">{formatDate(diary.createdAt)}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 pt-8">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{saving ? "저장 중..." : "완료"}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    <span>취소</span>
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
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
          <div className="mb-6 min-h-[500px]">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[500px] p-8 text-xl text-gray-800 border-2 border-[#FFD66B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E573E] resize-y leading-relaxed"
                placeholder="일기 내용을 입력하세요..."
              />
            ) : (
              <div className="min-h-[500px] p-8 bg-white rounded-lg">
                <p className="text-xl text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {diary.content}
                </p>
              </div>
            )}
          </div>

          {/* 감정 분석 결과 */}
          {diary.emotionAnalysis && diary.emotionAnalysis.textEmotion && (
            <div className="border-t-2 border-[#FFD66B] pt-6">
              <h3 className="text-xl font-semibold text-[#8E573E] mb-4">감정 분석</h3>
              
              {/* 오늘의 감정 */}
              <div className="mb-4 p-4 bg-[#FFF9E6] rounded-lg">
                <p className="text-sm text-gray-600 mb-3">오늘의 감정</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {EMOTION_EMOJI[diary.emotionAnalysis.textEmotion.emotion?.toUpperCase() || "NEUTRAL"] || "😐"}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {translateEmotion(diary.emotionAnalysis.textEmotion.emotion)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      온도: {getEmotionTemperature(diary.emotionAnalysis.textEmotion.score)}
                    </p>
                  </div>
                </div>
              </div>

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

            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

