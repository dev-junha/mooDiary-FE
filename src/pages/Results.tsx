import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";
import {
  getUserDiaries,
  getUserId,
  type DiaryDtoResponse,
} from "@/lib/apiClient";

// [추가] 백엔드 영문 감정 -> 프론트엔드 한글 매핑
const EMOTION_TRANSLATION: Record<string, string> = {
  HAPPY: "기쁨",
  EXCITED: "흥분",
  CALM: "평온",
  ANXIOUS: "불안",
  ANGRY: "화남",
  SAD: "우울",
  NEUTRAL: "평온",
  SURPRISED: "흥분",
};

// 곡선 그래프를 위한 부드러운 스플라인 보간 함수 (Cubic Bezier 사용)
function createSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // 첫 번째 점으로 이동
  let path = `M ${points[0].x} ${points[0].y}`;

  // Cubic Bezier 곡선을 사용하여 부드러운 곡선 생성
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // 제어점 계산: 인접한 점들을 고려하여 부드러운 곡선 생성
    let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

    if (i === 0) {
      // 첫 번째 구간: 다음 점의 방향을 고려
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      cp1x = current.x + dx * 0.3;
      cp1y = current.y + dy * 0.3;
      cp2x = current.x + dx * 0.7;
      cp2y = current.y + dy * 0.7;
    } else if (i === points.length - 2) {
      // 마지막 구간: 이전 점의 방향을 고려
      const prev = points[i - 1];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      cp1x = current.x + dx * 0.3;
      cp1y = current.y + dy * 0.3;
      cp2x = next.x - dx * 0.1;
      cp2y = next.y - dy * 0.1;
    } else {
      // 중간 구간: 양쪽 점을 고려하여 부드러운 곡선
      const prev = points[i - 1];
      const after = points[i + 1];

      // 현재 점에서 다음 점으로의 방향
      const dx1 = (next.x - prev.x) * 0.3;
      const dy1 = (next.y - prev.y) * 0.3;
      cp1x = current.x + dx1;
      cp1y = current.y + dy1;

      // 다음 점으로의 방향
      const dx2 = (after.x - current.x) * 0.3;
      const dy2 = (after.y - current.y) * 0.3;
      cp2x = next.x - dx2;
      cp2y = next.y - dy2;
    }

    // Cubic Bezier 곡선: C x1 y1, x2 y2, x y
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  return path;
}

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<
    Array<{
      date: string;
      x: number;
      y: number | null;
      value: number | null;
      emotion: string | null;
    }>
  >([]);
  const [tempRange, setTempRange] = useState<{ min: number; max: number }>({
    min: 36,
    max: 38,
  });

  useEffect(() => {
    let mounted = true;

    const processData = (diaries: DiaryDtoResponse[]) => {
      // 최근 일주일 날짜 생성 (오늘부터 6일 전까지, 총 7일)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekDates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        weekDates.push(date);
      }
      weekDates.reverse(); // 오래된 날짜부터 정렬

      // 날짜를 문자열 키로 변환 (YYYY-MM-DD 형식)
      const dateToKey = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // 일기 데이터를 날짜별로 매핑
      const diaryMap = new Map<string, { temp: number; emotion: string }>();
      diaries.forEach((d) => {
        const analysis = d.emotionAnalysis?.integratedEmotion;
        const rawScore = analysis?.score;

        // 점수(0-100)를 온도(36.0-38.0도)로 변환
        let temp: number;
        if (typeof rawScore === "number" && !isNaN(rawScore)) {
          temp = 36.0 + (rawScore / 100) * 2.0;
        } else {
          temp = 36.5;
        }

        // 감정 영문 -> 한글 변환
        const rawEmotion = analysis?.emotion || "CALM";
        const emotion = EMOTION_TRANSLATION[rawEmotion] || "평온";

        // 일기 작성 날짜를 키로 사용
        try {
          const diaryDate = new Date(d.createdAt);
          diaryDate.setHours(0, 0, 0, 0);
          const key = dateToKey(diaryDate);
          diaryMap.set(key, { temp, emotion });
        } catch (error) {
          console.error("날짜 파싱 오류:", error);
        }
      });

      // 최근 일주일 데이터 생성 (데이터가 없는 날은 null)
      const weekData = weekDates.map((date) => {
        const key = dateToKey(date);
        const diaryData = diaryMap.get(key);

        const month = date.getMonth() + 1;
        const day = date.getDate();
        const mmdd = `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;

        return {
          date: mmdd,
          dateObj: date,
          temp: diaryData?.temp ?? null,
          emotion: diaryData?.emotion ?? null,
        };
      });

      // 온도 범위 계산 (데이터가 있는 날만 고려)
      const tempsOnly = weekData
        .filter((d) => d.temp !== null)
        .map((d) => d.temp!);

      if (tempsOnly.length === 0) {
        if (mounted) {
          setTrendData([]);
          setTempRange({ min: 36, max: 38 });
        }
        return;
      }

      let minT = Math.min(...tempsOnly);
      let maxT = Math.max(...tempsOnly);

      // 범위가 너무 좁으면 강제로 넓혀서 그래프가 일직선이 되는 것 방지
      if (maxT - minT < 0.5) {
        const mid = (maxT + minT) / 2;
        minT = mid - 0.5;
        maxT = mid + 0.5;
      }

      setTempRange({ min: minT, max: maxT });

      const mapTempToY = (t: number) => {
        const top = 20;
        const bottom = 180;
        if (maxT === minT) return (top + bottom) / 2;
        const ratio = (t - minT) / (maxT - minT);
        if (isNaN(ratio)) return (top + bottom) / 2;
        return Math.round(bottom - ratio * (bottom - top));
      };

      const widthLeft = 50;
      const widthRight = 950;
      const n = 7; // 일주일 고정

      const generatedTrend = weekData.map((data, i) => {
        const x = Math.round(
          widthLeft + (i / (n - 1)) * (widthRight - widthLeft),
        );
        const y = data.temp !== null ? mapTempToY(data.temp) : null;

        return {
          date: data.date,
          x: isNaN(x) ? 500 : x,
          y: y !== null && !isNaN(y) ? y : null,
          value: data.temp,
          emotion: data.emotion,
        };
      });
      setTrendData(generatedTrend);
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = getUserId();
        const diaries = await getUserDiaries(userId);

        if (mounted) {
          if (diaries && diaries.length > 0) {
            processData(diaries);
          } else {
            console.log("데이터가 없습니다.");
            setTrendData([]);
          }
        }
      } catch (e: any) {
        console.error("Results load error:", e);
        if (mounted) setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // y축 온도 눈금 생성 (5개 정도)
  const generateYAxisTicks = () => {
    const { min, max } = tempRange;
    const range = max - min;
    const tickCount = 5;
    const ticks = [];

    for (let i = 0; i <= tickCount; i++) {
      const temp = min + (range * i) / tickCount;
      const top = 20;
      const bottom = 180;
      const ratio = i / tickCount;
      const y = Math.round(bottom - ratio * (bottom - top));
      ticks.push({ temp: Number(temp.toFixed(1)), y });
    }

    return ticks;
  };

  const yAxisTicks = generateYAxisTicks();

  // 곡선 경로 생성 (데이터가 있는 점들만 사용)
  const smoothPath =
    trendData.length > 0
      ? createSmoothPath(
          trendData
            .filter((p) => p.y !== null)
            .map((p) => ({ x: p.x, y: p.y! })),
        )
      : "";

  return (
    <div className="flex justify-center w-full font-sans bg-white">
      <div
        className="w-[1217px] min-h-screen flex flex-col"
        style={{
          background: "linear-gradient(90deg, #FFEAB1 7.55%, #FFDED3 121.31%)",
        }}
      >
        <div className="mt-12">
          <Header />
        </div>

        <main className="flex flex-col px-16 py-12 gap-12">
          <section className="flex flex-col gap-2">
            <h1 className="text-[#8E573E] text-4xl font-bold font-['Inter']">
              감정 분석 📊
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[#8E573E]/50 text-xl font-normal font-['Inter']">
                당신의 감정 패턴과 변화를 분석해보세요.
              </p>
            </div>
          </section>

          {/* 기분 변화 추이 - 곡선 그래프 */}
          <section className="bg-[#FFFBF2]/50 rounded-xl p-8 border-2 border-[#FFD900]">
            <h2 className="text-[#8E573E] text-2xl font-semibold mb-6 flex items-center gap-2">
              <SmileIcon small /> 기분 변화 추이
            </h2>
            <div className="w-full h-64 relative flex items-end p-4 pl-12">
              {trendData.length > 0 ? (
                <svg
                  className="absolute inset-0 w-full h-full p-10 pl-16 overflow-visible"
                  viewBox="0 0 1000 200"
                  preserveAspectRatio="none"
                >
                  {/* Y축 (세로선) */}
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="200"
                    stroke="#8E573E"
                    strokeWidth="2"
                  />
                  {/* X축 (가로선) */}
                  <line
                    x1="0"
                    y1="200"
                    x2="1000"
                    y2="200"
                    stroke="#8E573E"
                    strokeWidth="2"
                  />

                  {/* Y축 온도 눈금 및 라벨 */}
                  {yAxisTicks.map((tick, index) => (
                    <g key={index}>
                      {/* 눈금선 */}
                      <line
                        x1="-5"
                        y1={tick.y}
                        x2="0"
                        y2={tick.y}
                        stroke="#8E573E"
                        strokeWidth="2"
                      />
                      {/* 온도 라벨 */}
                      <text
                        x="-10"
                        y={tick.y + 5}
                        textAnchor="end"
                        fill="#8E573E"
                        className="text-xs font-bold"
                        style={{ fontSize: "14px" }}
                      >
                        {tick.temp}°C
                      </text>
                    </g>
                  ))}

                  {/* 곡선 그래프 (데이터가 있는 점들만 연결) */}
                  {smoothPath && (
                    <path
                      d={smoothPath}
                      fill="none"
                      stroke="#8E573E"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* 데이터 점들 및 날짜 라벨 */}
                  {trendData.map((point, index) => (
                    <g key={index}>
                      {/* 데이터가 있는 경우에만 점 표시 */}
                      {point.y !== null && (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="6"
                          fill="#8E573E"
                        />
                      )}
                      {/* 날짜 라벨 (항상 표시) */}
                      <text
                        x={point.x}
                        y="230"
                        textAnchor="middle"
                        fill="#8E573E"
                        className="text-xs font-bold"
                        style={{ fontSize: "18px" }}
                      >
                        {point.date}
                      </text>
                    </g>
                  ))}
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  데이터가 충분하지 않습니다.
                </div>
              )}
            </div>
          </section>

          {/* 하단 CTA */}
          <section className="mt-8 bg-gradient-to-b from-orange-200 to-orange-100 rounded-xl p-8 border-2 border-[#FFD900] flex flex-col items-center gap-8">
            <h3 className="text-[#8E573E] text-3xl font-medium">
              더 많은 추억을 만들어보세요.
            </h3>
            <div className="flex gap-8">
              <ActionButton
                label="새 일기 작성하기"
                onClick={() => navigate("/write")}
                primary
              />
              <ActionButton
                label="지난 분석 보기"
                onClick={() => navigate("/records")}
                icon="search"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, primary, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-64 h-14 rounded-xl flex items-center justify-center gap-3 text-xl font-medium transition-all ${
        primary
          ? "bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white hover:brightness-110 shadow-md"
          : "bg-white border-2 border-orange-300 text-[#8E573E] hover:bg-orange-50"
      }`}
    >
      {icon && <span className="text-lg">📄</span>} {label}
    </button>
  );
}

function SmileIcon({ small }: { small?: boolean }) {
  const size = small ? 30 : 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.0002 36.6668C29.2049 36.6668 36.6668 29.2049 36.6668 20.0002C36.6668 10.7954 29.2049 3.3335 20.0002 3.3335C10.7954 3.3335 3.3335 10.7954 3.3335 20.0002C3.3335 29.2049 10.7954 36.6668 20.0002 36.6668Z"
        stroke="#8E573E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3335 23.333C13.3335 23.333 15.8335 26.6663 20.0002 26.6663C24.1668 26.6663 26.6668 23.333 26.6668 23.333"
        stroke="#8E573E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15.001H15.0167"
        stroke="#8E573E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 15.001H25.0167"
        stroke="#8E573E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
