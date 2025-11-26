import { useEffect, useState } from "react";
// Frame 컴포넌트 삭제
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";
import { getEmotionData, getRecentDiaries } from "../lib/apiClient";
import type { EmotionData, DiaryResponse } from "@shared/types";

export default function EmoResult() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgTemp: 36.8,
    mostEmotion: "행복",
    totalDiaries: 0,
    totalTemp: 37.5,
  });

  const [trendData, setTrendData] = useState<Array<{ date: string; x: number; y: number; value: number }>>([]);
  const [weeklyBars, setWeeklyBars] = useState<number[]>([]); // average temp per week
  const [weeklyRange, setWeeklyRange] = useState<{ min: number; max: number }>({ min: 36, max: 38 });
  const [weeklyTemps, setWeeklyTemps] = useState<number[]>([]); // actual temps per bucket (NaN if missing)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [testMode, setTestMode] = useState(false);

  // 더미 데이터 (API가 없거나 오류 시 사용)
  const DUMMY_EMOTION: EmotionData = {
    emotion: "행복",
    description: "기분이 좋아요",
    emoji: "😊",
    temperature: "37.2",
  };

  const DUMMY_DIARIES: DiaryResponse[] = [
    { id: 1, userId: 1, content: "오늘은 좋은 하루였어", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "기쁨" } }, createdAt: '2025-08-01T10:00:00Z', updatedAt: '2025-08-01T10:00:00Z', temperature: '37.2' } as any,
    { id: 2, userId: 1, content: "조금 피곤했어", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "기쁨" } }, createdAt: '2025-08-06T08:00:00Z', updatedAt: '2025-08-06T08:00:00Z', temperature: '36.5' } as any,
    { id: 3, userId: 1, content: "멋진 만남", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "평온" } }, createdAt: '2025-08-12T18:00:00Z', updatedAt: '2025-08-12T18:00:00Z', temperature: '38.2' } as any,
    { id: 4, userId: 1, content: "집에서 쉬었어", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "평온" } }, createdAt: '2025-08-18T12:00:00Z', updatedAt: '2025-08-18T12:00:00Z', temperature: '36.9' } as any,
    { id: 5, userId: 1, content: "새로운 취미 시작", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "흥미" } }, createdAt: '2025-08-23T09:30:00Z', updatedAt: '2025-08-23T09:30:00Z', temperature: '37.6' } as any,
    { id: 6, userId: 1, content: "작은 성공", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "만족" } }, createdAt: '2025-08-28T20:00:00Z', updatedAt: '2025-08-28T20:00:00Z', temperature: '37.1' } as any,
    { id: 7, userId: 1, content: "기억에 남는 하루", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "놀람" } }, createdAt: '2025-08-31T07:00:00Z', updatedAt: '2025-08-31T07:00:00Z', temperature: '38.5' } as any,
    { id: 8, userId: 1, content: "우울한 기분", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "슬픔" } }, createdAt: '2025-09-05T11:00:00Z', updatedAt: '2025-09-05T11:00:00Z', temperature: '36.0' } as any,
    { id: 9, userId: 1, content: "보통의 하루", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "평온" } }, createdAt: '2025-09-12T16:00:00Z', updatedAt: '2025-09-12T16:00:00Z', temperature: '37.0' } as any,
    { id: 10, userId: 1, content: "힘들었어", imageUrl: null, emotionAnalysis: { integratedEmotion: { emotion: "슬픔" } }, createdAt: '2025-09-20T14:00:00Z', updatedAt: '2025-09-20T14:00:00Z', temperature: '37.8' } as any,
  ];

  useEffect(() => {
    let mounted = true;
    const processData = (
      emotionData: EmotionData,
      recentDiaries: DiaryResponse[],
      mountedFlag: boolean
    ) => {
      // --- Derived datasets for charts ---
      // 1) Resolve a numeric temperature for each diary (fallback from emotion if missing)
      const EMOTION_TO_TEMP: Record<string, number> = {
        행복: 37.5,
        기쁨: 37.4,
        평온: 36.8,
        흥미: 37.0,
        만족: 37.2,
        놀람: 38.0,
        슬픔: 36.2,
        피곤: 36.0,
        중립: 37.0,
        불안: 37.6,
        화남: 38.3,
        우울: 36.0,
      };

      const points = recentDiaries
        .map((d) => {
          const tempField = (d as any).temperature ?? undefined;
          let temp: number | undefined;
          if (typeof tempField === "string") {
            const parsed = parseFloat(tempField);
            if (Number.isFinite(parsed)) temp = parsed;
          } else if (typeof tempField === "number") {
            temp = tempField;
          }

          if (temp == null) {
            const emo = d.emotionAnalysis?.integratedEmotion?.emotion;
            if (emo && typeof emo === "string") {
              temp = EMOTION_TO_TEMP[emo] ?? EMOTION_TO_TEMP[emo.replace(/\s/g, '')] ?? undefined;
            }
          }

          // final fallback
          if (temp == null) temp = parseFloat(emotionData.temperature ?? String(stats.totalTemp ?? 37.0));

          return {
            date: d.createdAt ?? new Date().toISOString(),
            temp,
            // keep emotion on the point so counts/mode reflect the sorted order
            emotion: d.emotionAnalysis?.integratedEmotion?.emotion ?? "알수없음",
          } as const;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const tempsOnly = points.map((p) => p.temp);
      const minT = Math.min(...tempsOnly, 35);
      const maxT = Math.max(...tempsOnly, 40);

      // map temp -> svg y (20..180) where higher temp -> smaller y
      const mapTempToY = (t: number) => {
        const top = 20;
        const bottom = 180;
        if (maxT === minT) return (top + bottom) / 2;
        const ratio = (t - minT) / (maxT - minT);
        return Math.round(bottom - ratio * (bottom - top));
      };

      // build trend points with x spacing similar to original example (50..950)
      const widthLeft = 50;
      const widthRight = 950;
      const n = points.length;
      const generatedTrend = points.map((p, i) => {
        const x = n === 1 ? (widthLeft + widthRight) / 2 : Math.round(widthLeft + (i / Math.max(1, n - 1)) * (widthRight - widthLeft));
        const y = mapTempToY(p.temp);
        const d = new Date(p.date);
        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
        return { date: mmdd, x, y, value: p.temp };
      });

      // Weekly grouping: split the sorted points into 4 buckets (earliest -> latest)
      const buckets = Array.from({ length: 4 }, (_, i) => {
        const startIdx = Math.floor((i * n) / 4);
        const endIdx = Math.floor(((i + 1) * n) / 4);
        return points.slice(startIdx, endIdx);
      });
      const weeks: number[] = buckets.map((bucket) => {
        if (!bucket || bucket.length === 0) return NaN;
        const avg = bucket.reduce((s, p) => s + p.temp, 0) / bucket.length;
        return avg;
      });

      // For rendering bars we need heights between 30..170 pixels (baseline y=220)
      const barMin = 30;
      const barMax = 170;
      const barTemps = weeks.map((t) => Number.isFinite(t) ? t : NaN);
      const presentTemps = barTemps.filter(Number.isFinite);
      const minBarT = presentTemps.length ? Math.min(...presentTemps) : minT;
      const maxBarT = presentTemps.length ? Math.max(...presentTemps) : maxT;
      const barHeights = barTemps.map((t) => {
        if (!Number.isFinite(t)) return (barMin + barMax) / 2;
        if (maxBarT === minBarT) return (barMin + barMax) / 2;
        const ratio = (t - minBarT) / (maxBarT - minBarT);
        return Math.round(barMin + ratio * (barMax - barMin));
      });

      // expose the computed min/max temperatures for the weekly bar scale so the renderer
      // can place axis labels (최저값/최고값) and intermediate markers (예: 36.5°C)
      const rangeMin = minBarT;
      const rangeMax = maxBarT;

      // Distribution: count emotions (use the sorted points' emotion field)
      const counts: Record<string, number> = {};
      points.forEach((p) => {
        const emo = (p as any).emotion ?? "알수없음";
        counts[emo] = (counts[emo] || 0) + 1;
      });

      // Determine modal emotion (most frequent)
      let modeEmotion = emotionData.emotion ?? "알수없음";
      let maxCount = -1;
      for (const [k, v] of Object.entries(counts)) {
        if (v > maxCount) {
          maxCount = v;
          modeEmotion = k;
        }
      }

      // commit derived state
      if (mountedFlag) {
        setTrendData(generatedTrend);
        setWeeklyBars(barHeights);
        setWeeklyTemps(barTemps); // store the actual temperature values for tooltips
        setDistribution(counts);
        setWeeklyRange({ min: rangeMin, max: rangeMax });
      }

      // 통계 계산: 최근 다이어리의 온도 필드를 탐색하여 평균 온도 산출 (없으면 더미값 사용)
      const temps: number[] = recentDiaries
        .map((d) => {
          const t = (d as any).temperature ?? undefined;
          if (typeof t === "string") {
            const parsed = parseFloat(t);
            return Number.isFinite(parsed) ? parsed : undefined;
          }
          return undefined;
        })
        .filter((v): v is number => typeof v === "number");

      const avgTemp = temps.length > 0 ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)) : parseFloat(emotionData.temperature ?? String(DUMMY_EMOTION.temperature ?? 37.0));

      if (!mountedFlag) return;

      setStats((prev) => ({
        ...prev,
        avgTemp,
        // prefer the computed modal emotion from the recent diaries; fallback to emotionData
        mostEmotion: modeEmotion ?? emotionData.emotion ?? prev.mostEmotion,
        totalDiaries: recentDiaries.length,
        totalTemp: parseFloat(emotionData.temperature ?? String(prev.totalTemp)),
      }));
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (testMode) {
          processData(DUMMY_EMOTION, DUMMY_DIARIES, mounted);
        } else {
          // 시도: 실제 API 호출 (프로덕션/개발 환경에서 작동하면 사용)
          const [emotionRes, recentDiariesRes] = await Promise.allSettled([
            getEmotionData(),
            getRecentDiaries(),
          ]);

          const emotionData: EmotionData =
            emotionRes.status === "fulfilled" && emotionRes.value ? emotionRes.value : DUMMY_EMOTION;

          const recentDiaries: DiaryResponse[] =
            recentDiariesRes.status === "fulfilled" && Array.isArray(recentDiariesRes.value) && recentDiariesRes.value.length > 0
              ? (recentDiariesRes.value as DiaryResponse[])
              : DUMMY_DIARIES;

          processData(emotionData, recentDiaries, mounted);
        }
      } catch (e: any) {
        console.error("EmoResult load error:", e);
        if (mounted) setError(String(e?.message ?? e));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [testMode]);

  // derived totals for distribution display
  const distributionTotal = Object.values(distribution).reduce((a, b) => a + b, 0) || stats.totalDiaries || 1;

  // Prepare distribution segments for the donut chart
  const DISTRIBUTION_ORDER = ["기쁨", "흥미", "만족", "평온", "놀람", "슬픔"];
  const DISTRIBUTION_COLORS = ["#FACC15", "#38BDF8", "#FB7185", "#A3E635", "#C084FC", "#A87963"];
  const CIRCUMFERENCE = 2 * Math.PI * 120; // radius 120 from SVG
  const segments = (() => {
    const total = distributionTotal || 1;
    // if no data, distribute evenly
    const hasData = Object.values(distribution).some((v) => v > 0);
    let acc = 0;
    return DISTRIBUTION_ORDER.map((key, i) => {
      const count = hasData ? (distribution[key] || 0) : 1;
      const frac = hasData ? count / total : 1 / DISTRIBUTION_ORDER.length;
      const dash = Math.max(0.001, frac * CIRCUMFERENCE);
      const offset = -acc;
      acc += dash;
      return {
        key,
        color: DISTRIBUTION_COLORS[i] || "#ddd",
        dash,
        offset,
        frac,
      };
    });
  })();

  // percentage for the currently shown top emotion (rounded integer)
  const mostEmotionPercent = Math.round(((distribution[stats.mostEmotion] || 0) / distributionTotal) * 100);

  return (
    <div className="flex justify-center w-full font-sans bg-white" style={{
      background: "linear-gradient(90deg, #FFEAB1 7.55%, #FFDED3 121.31%)",
    }}>
      {/* [수정 사항]
        1. w-[1217px] 컨테이너에 직접 배경 그라데이션 적용 (흰색 여백 제거)
        2. Frame 컴포넌트 및 관련 레이아웃(Flex row) 제거
        3. 상단 여백(mt) 등을 조정하여 전체적으로 꽉 차게 변경
      */}
      <div 
        className="w-[1217px] min-h-screen flex flex-col"
        style={{
          background: "linear-gradient(90deg, #FFEAB1 7.55%, #FFDED3 121.31%)",
        }}
      >
        {/* 헤더 영역: 상단에 약간의 여백이 필요하다면 mt-12 등을 추가, 아니면 제거 */}
        <div className="mt-12">
            <Header />
        </div>

        <main className="flex flex-col px-16 py-12 gap-12">
          
          {/* 1. 타이틀 섹션 */}
          <section className="flex flex-col gap-2">
            <h1 className="text-[#8E573E] text-4xl font-bold font-['Inter']">
              감정 분석 📊
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[#8E573E]/50 text-xl font-normal font-['Inter']">
                당신의 감정 패턴과 변화를 분석해보세요.
              </p>
              {/* <button
                onClick={() => setTestMode((s) => !s)}
                className={`ml-4 px-3 py-1 rounded-md text-sm ${testMode ? 'bg-green-200 text-green-800' : 'bg-white text-orange-600 border border-orange-200'}`}
              >
                테스트 데이터: {testMode ? 'ON' : 'OFF'}
              </button> */}
            </div>
          </section>

          {/* 2. 상단 통계 카드 */}
          <section className="grid grid-cols-3 gap-8">
            <StatCard 
              title="최근 평균 온도" 
              value={stats.avgTemp} 
              unit="°C" 
              desc="최근 7건의 평균 온도"
              icon={<SmileIcon />}
            />
            <StatCard 
              title="가장 많은 감정" 
              value={stats.mostEmotion} 
              desc={`최근 7건 기준 ${mostEmotionPercent}% 비율 차지`}
              icon={<SmileIcon />}
            />
            <StatCard 
              title="전체 일기" 
              value={stats.totalDiaries} 
              desc="그동안 작성한 전체 일기 개수"
              icon={<SmileIcon />}
            />
          </section>

          {/* 3. 감정 온도 분포 */}
          <section className="bg-[#FFFBF2]/50 rounded-xl p-8 border-2 border-[#FFD900] shadow-sm">
            <h2 className="text-[#8E573E] text-2xl font-semibold mb-8 flex items-center gap-2">
              <SmileIcon small /> 감정 온도 분포
            </h2>
            
            <div className="flex flex-col justify-center items-center gap-10">
                <div className="relative w-72 h-72">
                  <svg viewBox="0 0 288 288" className="w-full h-full transform -rotate-90">
                    {segments.map((s, idx) => (
                      <circle
                        key={s.key}
                        cx={144}
                        cy={144}
                        r={120}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={24}
                        strokeLinecap="round"
                        strokeDasharray={`${s.dash} ${Math.max(0.001, CIRCUMFERENCE - s.dash)}`}
                        strokeDashoffset={s.offset}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-800 mb-1 font-['Inter']">Total</span>
                    <span className="text-5xl font-black text-black tracking-tight font-['Inter']">{stats.avgTemp}°C</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-x-16 gap-y-4">
                  <LegendItem color="bg-yellow-400" label="기쁨" value={(distribution['기쁨'] || 0) / distributionTotal * 100} />
                  <LegendItem color="bg-sky-400" label="흥미" value={(distribution['흥미'] || 0) / distributionTotal * 100} />
                  <LegendItem color="bg-rose-400" label="만족" value={(distribution['만족'] || 0) / distributionTotal * 100} />
                  <LegendItem color="bg-lime-400" label="평온" value={(distribution['평온'] || 0) / distributionTotal * 100} />
                  <LegendItem color="bg-purple-400" label="놀람" value={(distribution['놀람'] || 0) / distributionTotal * 100} />
                  <LegendItem color="bg-[#A87963]" label="슬픔" value={(distribution['슬픔'] || 0) / distributionTotal * 100} />
                </div>
            </div>
          </section>

          {/* 4. 기분 변화 추이 */}
          <section className="bg-[#FFFBF2]/50 rounded-xl p-8 border-2 border-[#FFD900]">
            <h2 className="text-[#8E573E] text-2xl font-semibold mb-6 flex items-center gap-2">
                <SmileIcon small /> 기분 변화 추이
            </h2>
            <div className="w-full h-64 relative flex items-end p-4 pl-12">
                
                <div className="absolute left-0 top-4 bottom-10 flex flex-col justify-between text-[#8E573E] text-xs font-bold h-auto z-10">
                  <span>39.5°C</span>
                  <span className="translate-y-2">37.5°C</span>
                  <span>36.3°C</span>
                </div>

                <svg className="absolute inset-0 w-full h-full p-10 pl-16 overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="0" y2="200" stroke="#8E573E" strokeWidth="2" />
                  <line x1="0" y1="200" x2="1000" y2="200" stroke="#8E573E" strokeWidth="2" />

                  {(() => {
                    const data = trendData.length ? trendData : [
                      { date: "8/1",  x: 50,  y: 100, value: 37.0 },
                      { date: "8/6",  x: 200, y: 20,  value: 38.5 },
                      { date: "8/12", x: 350, y: 180, value: 36.3 },
                      { date: "8/18", x: 500, y: 140, value: 37.5 },
                      { date: "8/23", x: 650, y: 60,  value: 38.2 },
                      { date: "8/28", x: 800, y: 100, value: 37.0 },
                      { date: "8/31", x: 950, y: 50,  value: 38.0 },
                    ];

                    const generateSmoothPath = (points: typeof data) => {
                      if (points.length === 0) return "";
                      let d = `M ${points[0].x} ${points[0].y}`;
                      for (let i = 0; i < points.length - 1; i++) {
                        const curr = points[i];
                        const next = points[i + 1];
                        const cp1x = (curr.x + next.x) / 2;
                        const cp1y = curr.y;
                        const cp2x = (curr.x + next.x) / 2;
                        const cp2y = next.y;
                        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                      }
                      return d;
                    };

                    return (
                      <>
                        <path d={generateSmoothPath(data)} fill="none" stroke="#8E573E" strokeWidth="3" />
                        {data.map((point, index) => (
                          <g key={index}>
                            <circle cx={point.x} cy={point.y} r="6" fill="#8E573E" />
                            <text 
                              x={point.x} 
                              y="230" 
                              textAnchor="middle" 
                              fill="#8E573E" 
                              className="text-xs font-bold"
                              style={{ fontSize: '18px' }}
                            >
                              {point.date}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
            </div>
                <p className="mt-2 text-sm text-[#8E573E]">
                  왼쪽 눈금은 해당 주간 비교에 사용된 실제 최저값과 최고값을 표시합니다. 두 값 사이의 간격을 기준으로 36.5°C의 위치를 비례하여 계산해 해당 높이에 표시합니다.
                </p>
          </section>

          {/* 5. 주간 기분 비교 & 피드백 */}
          <div className="grid grid-cols-2 gap-8">
            <section className="bg-[#FFFBF2]/50 rounded-xl p-6 border-2 border-[#FFD900]">
              <h2 className="text-[#8E573E] text-2xl font-semibold mb-6 flex items-center gap-2">
                <SmileIcon small /> 주간 기분 비교
              </h2>
              
              <div className="w-full h-64 relative flex items-end p-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 250">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>

                  {(() => {
                    const barMinPx = 30;
                    const barMaxPx = 170;
                    const baselineY = 220;
                    const minT = weeklyRange?.min ?? 36;
                    const maxT = weeklyRange?.max ?? 38;
                    const mapTempToY = (t: number) => {
                      if (maxT === minT) return Math.round(baselineY - (barMinPx + barMaxPx) / 2);
                      const ratio = (t - minT) / (maxT - minT);
                      const h = Math.round(barMinPx + ratio * (barMaxPx - barMinPx));
                      return Math.round(baselineY - h);
                    };
                    const topY = mapTempToY(maxT);
                    const bottomY = mapTempToY(minT);
                    const midValue = 36.5;
                    const midY = mapTempToY(midValue);
                    return (
                      <>
                        <text x={40} y={topY} textAnchor="end" fill="#8E573E" className="text-xs font-bold" style={{fontSize: '14px'}}>{`${maxT.toFixed(1)}°C`}</text>
                        <text x={40} y={bottomY} textAnchor="end" fill="#8E573E" className="text-xs font-bold" style={{fontSize: '14px'}}>{`${minT.toFixed(1)}°C`}</text>
                        <g>
                          <line x1={50} y1={midY} x2={380} y2={midY} stroke="#F3F3F3" strokeWidth="1" strokeDasharray="4 3" />
                          <text x={40} y={midY + 4} textAnchor="end" fill="#8E573E" className="text-xs font-medium" style={{fontSize: '12px'}}>{`${midValue.toFixed(1)}°C`}</text>
                        </g>
                      </>
                    );
                  })()}

                  <line x1="50" y1="50" x2="50" y2="220" stroke="#8E573E" strokeWidth="2" /> 
                  <line x1="50" y1="220" x2="380" y2="220" stroke="#8E573E" strokeWidth="2" />

                  {(() => {
                    const xs = [75, 155, 235, 315];
                    const heights = weeklyBars.length === 4 ? weeklyBars : [90, 150, 120, 70];
                    const temps = weeklyTemps.length === 4 ? weeklyTemps : [NaN, NaN, NaN, NaN];
                    return xs.map((xPos, idx) => {
                      const h = heights[idx];
                      const y = 220 - h; // baseline at y=220
                      const temp = temps[idx];
                      const centerX = xPos + 20;
                      // tooltip box geometry
                      const tipWidth = 64;
                      const tipHeight = 28;
                      const tipX = centerX - tipWidth / 2;
                      const tipY = y - tipHeight - 8;

                      return (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <rect x={xPos} y={y} width="40" height={h} rx="5" fill="url(#barGradient)" />
                          <text x={centerX} y="245" textAnchor="middle" fill="#8E573E" className="text-sm font-bold" style={{fontSize: '16px'}}>{`${idx + 1}주차`}</text>

                          {hoveredBar === idx && (
                            <g>
                              <rect x={tipX} y={tipY} width={tipWidth} height={tipHeight} rx={8} fill="#111827" opacity={0.95} />
                              <text x={centerX} y={tipY + 18} textAnchor="middle" fill="#FFFFFF" className="text-sm font-medium">
                                {Number.isFinite(temp) ? `${temp.toFixed(1)}°C` : "-"}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    });
                  })()}
                </svg>
              </div>
            </section>

            <section className="bg-[#FFFBF2]/50 rounded-xl p-6 border-2 border-[#FFD900]">
              <h2 className="text-[#8E573E] text-2xl font-semibold mb-6 flex items-center gap-2">
                <SmileIcon small /> 주간 / 월간 피드백
              </h2>
              <div className="flex flex-col gap-4">
                <FeedbackCard text="하루에 적어도 6시간 잠을 취해보세요." />
                <FeedbackCard text="일찍 자고, 일찍 일어나는 습관이 필요해요." />
                <FeedbackCard text="하루를 과일로 시작해보세요." />
                <FeedbackCard text="매일 일기를 쓰면서 하루를 마무리하세요." />
              </div>
            </section>
          </div>

          {/* 6. 하단 CTA */}
          <section className="mt-8 bg-gradient-to-b from-orange-200 to-orange-100 rounded-xl p-8 border-2 border-[#FFD900] flex flex-col items-center gap-8">
            <h3 className="text-[#8E573E] text-3xl font-medium">더 많은 추억을 만들어보세요.</h3>
            <div className="flex gap-8">
              <ActionButton 
                label="새 일기 작성하기" 
                onClick={() => navigate('/write')}
                primary 
              />
              <ActionButton 
                label="임시저장 페이지" 
                onClick={() => navigate('/drafts')}
                icon="save"
              />
              <ActionButton 
                label="지난 분석 보기" 
                onClick={() => navigate('/records')}
                icon="search"
              />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

/* --- 서브 컴포넌트 --- */

function StatCard({ title, value, unit, desc, icon }: any) {
  return (
    <div className="bg-[#FFFBF2] rounded-xl p-6 border-2 border-[#FFD900] flex flex-col items-center text-center shadow-md-custom">
       <div className="mb-4">{icon}</div>
       <div className="text-[#8E573E] text-4xl font-semibold mb-2">
         {value}<span className="font-normal">{unit}</span>
       </div>
       <div className="text-[#8E573E]/70 text-xl mb-4">{title}</div>
       <div className="text-orange-400 text-sm">{desc}</div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string, label: string, value?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded-full ${color} ring-2 ring-white shadow-sm`}></div>
      <span className="text-xl font-bold text-gray-700">{label}</span>
      {typeof value === 'number' && (
        <span className="text-sm text-[#8E573E] ml-2">{Math.round(value)}%</span>
      )}
    </div>
  );
}

function FeedbackCard({ text }: { text: string }) {
  return (
    <div className="bg-yellow-50/95 rounded-lg border border-orange-200 p-4 flex items-center shadow-sm">
      <div className="w-2 h-2 rounded-full bg-[#8E573E] mr-4"></div>
      <span className="text-[#8E573E] text-lg font-semibold">{text}</span>
    </div>
  );
}

function ActionButton({ label, onClick, primary, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-64 h-14 rounded-xl flex items-center justify-center gap-3 text-xl font-medium transition-all
        ${primary 
          ? 'bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white hover:brightness-110 shadow-md' 
          : 'bg-white border-2 border-orange-300 text-[#8E573E] hover:bg-orange-50'}
      `}
    > 
      {icon && <span className="text-lg">📄</span>} 
      {label}
    </button>
  );
}

function SmileIcon({ small }: { small?: boolean }) {
  const size = small ? 30 : 40;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.0002 36.6668C29.2049 36.6668 36.6668 29.2049 36.6668 20.0002C36.6668 10.7954 29.2049 3.3335 20.0002 3.3335C10.7954 3.3335 3.3335 10.7954 3.3335 20.0002C3.3335 29.2049 10.7954 36.6668 20.0002 36.6668Z" stroke="#8E573E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3335 23.333C13.3335 23.333 15.8335 26.6663 20.0002 26.6663C24.1668 26.6663 26.6668 23.333 26.6668 23.333" stroke="#8E573E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 15.001H15.0167" stroke="#8E573E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25 15.001H25.0167" stroke="#8E573E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}