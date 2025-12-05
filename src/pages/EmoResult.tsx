import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";
import { getUserDiaries, getUserId, type DiaryDtoResponse } from "../lib/apiClient";

// [추가] 백엔드 영문 감정 -> 프론트엔드 한글 매핑
// 백엔드는 Enum(영어)으로 저장해야 오류가 안 나므로, 표시할 때만 변환합니다.
const EMOTION_TRANSLATION: Record<string, string> = {
  HAPPY: "기쁨",
  EXCITED: "흥분",
  CALM: "평온",
  ANXIOUS: "불안",
  ANGRY: "화남",
  SAD: "우울",
  // 예외 처리 (매핑되지 않은 감정이 올 경우 '평온'으로 처리)
  NEUTRAL: "평온",
  SURPRISED: "흥분",
};

// [수정] 요청하신 6가지 감정 순서 및 색상 정의
const DISTRIBUTION_ORDER = ["기쁨", "흥분", "평온", "불안", "화남", "우울"];
// 색상 매칭 (순서대로): 노랑(기쁨), 주황(흥분), 초록(평온), 보라(불안), 빨강(화남), 파랑(우울)
const DISTRIBUTION_COLORS = ["#FACC15", "#FB923C", "#A3E635", "#C084FC", "#F87171", "#60A5FA"];

export default function EmoResult() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgTemp: 36.5,
    mostEmotion: "분석 중...",
    totalDiaries: 0,
    totalTemp: 36.5,
  });

  const [trendData, setTrendData] = useState<Array<{ date: string; x: number; y: number; value: number }>>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [weeklyBars, setWeeklyBars] = useState<number[]>([]); 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [weeklyRange, setWeeklyRange] = useState<{ min: number; max: number }>({ min: 36, max: 38 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [weeklyTemps, setWeeklyTemps] = useState<number[]>([]); 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [distribution, setDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;

    const processData = (diaries: DiaryDtoResponse[]) => {
      // 1. 데이터 매핑 및 한글 변환
      const points = diaries
        .map((d) => {
          const analysis = d.emotionAnalysis?.integratedEmotion;
          // 점수가 없으면 기본값 36.5, 숫자가 아닌 경우도 방어
          const rawScore = analysis?.score;
          const temp = (typeof rawScore === 'number' && !isNaN(rawScore)) ? rawScore : 36.5;
          
          // 감정 영문 -> 한글 변환
          const rawEmotion = analysis?.emotion || "CALM";
          const emotion = EMOTION_TRANSLATION[rawEmotion] || "평온";
          
          return {
            date: d.createdAt,
            temp,
            emotion,
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (points.length === 0) {
        // 데이터 없을 시 초기화
        if (mounted) {
            setStats({ avgTemp: 36.5, mostEmotion: "기록 없음", totalDiaries: 0, totalTemp: 0 });
            setTrendData([]);
        }
        return;
      }

      // 2. 통계 계산
      const totalTemp = points.reduce((acc, curr) => acc + curr.temp, 0);
      const avgTemp = Number((totalTemp / points.length).toFixed(1));
      
      const counts: Record<string, number> = {};
      // 요청하신 6가지 키로 초기화 (0건이어도 그래프에 표시되도록)
      DISTRIBUTION_ORDER.forEach(key => counts[key] = 0);

      points.forEach(p => { 
          // 매핑된 한글 감정이 우리가 원하는 6가지 안에 있으면 카운트
          if (counts[p.emotion] !== undefined) {
              counts[p.emotion]++;
          } else {
              // 혹시 다른 감정이면 '평온' 등에 합치거나 무시
              counts["평온"]++;
          }
      });
      
      let modeEmotion = "-";
      let maxCount = -1;
      for (const [k, v] of Object.entries(counts)) {
        if (v > maxCount) { maxCount = v; modeEmotion = k; }
      }

      setStats({
        avgTemp,
        mostEmotion: modeEmotion,
        totalDiaries: points.length,
        totalTemp,
      });
      setDistribution(counts);

      // 3. Trend Line Chart 데이터 생성 (NaN 방지 로직 적용)
      const tempsOnly = points.map(p => p.temp);
      // 최소/최대값이 같거나 데이터가 1개일 때 방어
      let minT = Math.min(...tempsOnly);
      let maxT = Math.max(...tempsOnly);
      
      // 범위가 너무 좁으면 강제로 넓혀서 그래프가 일직선이 되는 것 방지
      if (maxT - minT < 5) {
          const mid = (maxT + minT) / 2;
          minT = mid - 5;
          maxT = mid + 5;
      }

      const mapTempToY = (t: number) => {
        const top = 20;
        const bottom = 180;
        if (maxT === minT) return (top + bottom) / 2;
        const ratio = (t - minT) / (maxT - minT);
        // NaN 체크
        if (isNaN(ratio)) return (top + bottom) / 2;
        return Math.round(bottom - ratio * (bottom - top));
      };

      const widthLeft = 50;
      const widthRight = 950;
      const n = points.length;
      
      const generatedTrend = points.map((p, i) => {
        // x좌표 계산 시 n=1일 때 0으로 나누기 방지
        const x = n <= 1 ? (widthLeft + widthRight) / 2 : Math.round(widthLeft + (i / (n - 1)) * (widthRight - widthLeft));
        const y = mapTempToY(p.temp);
        
        // 날짜 파싱 - 안전하게 처리
        let d: Date;
        try {
          d = new Date(p.date);
          if (isNaN(d.getTime())) {
            // 유효하지 않은 날짜면 다른 형식 시도
            const normalized = p.date.replace(' ', 'T');
            d = new Date(normalized);
            if (isNaN(d.getTime())) {
              // 여전히 유효하지 않으면 오늘 날짜 사용
              d = new Date();
            }
          }
        } catch (error) {
          // 오류 발생 시 오늘 날짜 사용
          d = new Date();
        }
        
        const month = d.getMonth() + 1;
        const day = d.getDate();
        
        // NaN 체크 - 유효하지 않으면 오늘 날짜 사용
        let mmdd: string;
        if (isNaN(month) || isNaN(day)) {
          const today = new Date();
          mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        } else {
          mmdd = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        }
        
        return { 
            date: mmdd, 
            x: isNaN(x) ? 500 : x, 
            y: isNaN(y) ? 100 : y, 
            value: p.temp 
        };
      });
      setTrendData(generatedTrend);

      // 4. 주간 바 데이터 (Weekly Bars) - NaN 방지
      const buckets = Array.from({ length: 4 }, (_, i) => {
        const startIdx = Math.floor((i * n) / 4);
        const endIdx = Math.floor(((i + 1) * n) / 4);
        return points.slice(startIdx, endIdx);
      });
      
      const weeks = buckets.map(bucket => {
        if (!bucket.length) return 0; // 데이터 없으면 0 처리
        const sum = bucket.reduce((s, p) => s + p.temp, 0);
        return sum / bucket.length;
      });

      // 바 높이 계산
      const barMin = 30;
      const barMax = 170;
      
      // 유효한 데이터만 필터링해서 min/max 계산
      const validWeeks = weeks.filter(t => t > 0);
      const minBarT = validWeeks.length ? Math.min(...validWeeks) : 0;
      const maxBarT = validWeeks.length ? Math.max(...validWeeks) : 100;
      
      const barHeights = weeks.map(t => {
        if (t === 0) return barMin; // 데이터 없으면 최소 높이
        if (maxBarT === minBarT) return (barMin + barMax) / 2;
        const ratio = (t - minBarT) / (maxBarT - minBarT);
        if (isNaN(ratio)) return barMin;
        return Math.round(barMin + ratio * (barMax - barMin));
      });

      setWeeklyBars(barHeights);
      setWeeklyTemps(weeks);
      setWeeklyRange({ min: minBarT, max: maxBarT });
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
            setTrendData([]); // 데이터 없음 처리
          }
        }
      } catch (e: any) {
        console.error("EmoResult load error:", e);
        if (mounted) setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, []);

  // 도넛 차트 계산 로직
  const distributionTotal = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const mostEmotionPercent = Math.round(((distribution[stats.mostEmotion] || 0) / distributionTotal) * 100);
  const CIRCUMFERENCE = 2 * Math.PI * 120;
  
  const segments = (() => {
    const total = distributionTotal || 1;
    // 데이터가 하나라도 있는지 확인
    const hasData = Object.values(distribution).some((v) => v > 0);
    let acc = 0;
    
    return DISTRIBUTION_ORDER.map((key, i) => {
      const count = hasData ? (distribution[key] || 0) : 0; // 데이터 없으면 0 처리
      
      // 데이터가 아예 없으면 회색 링 등을 보여주기 위해 균등 분배할 수도 있지만,
      // 여기서는 0으로 처리하되 strokeWidth를 유지
      const frac = total > 0 ? count / total : 0;
      const dash = Math.max(0.001, frac * CIRCUMFERENCE);
      const offset = -acc;
      acc += dash;
      return { key, color: DISTRIBUTION_COLORS[i], dash, offset, hasData };
    });
  })();

  return (
    <div className="flex justify-center w-full font-sans bg-white">
      <div 
        className="w-[1217px] min-h-screen flex flex-col"
        style={{ background: "linear-gradient(90deg, #FFEAB1 7.55%, #FFDED3 121.31%)" }}
      >
        <div className="mt-12"><Header /></div>

        <main className="flex flex-col px-16 py-12 gap-12">
          
          <section className="flex flex-col gap-2">
            <h1 className="text-[#8E573E] text-4xl font-bold font-['Inter']">감정 분석 📊</h1>
            <div className="flex items-center gap-4">
              <p className="text-[#8E573E]/50 text-xl font-normal font-['Inter']">당신의 감정 패턴과 변화를 분석해보세요.</p>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-8">
            <StatCard title="최근 평균 온도" value={stats.avgTemp} unit="°C" desc="최근 작성한 일기 기준" icon={<SmileIcon />} />
            <StatCard title="가장 많은 감정" value={stats.mostEmotion} desc={`전체 비율 중 ${mostEmotionPercent}%`} icon={<SmileIcon />} />
            <StatCard title="전체 일기" value={stats.totalDiaries} desc="누적 작성 일기 수" icon={<SmileIcon />} />
          </section>

          {/* 감정 온도 분포 */}
          <section className="bg-[#FFFBF2]/50 rounded-xl p-8 border-2 border-[#FFD900] shadow-sm">
            <h2 className="text-[#8E573E] text-2xl font-semibold mb-8 flex items-center gap-2"><SmileIcon small /> 감정 온도 분포</h2>
            <div className="flex flex-col justify-center items-center gap-10">
                <div className="relative w-72 h-72">
                  <svg viewBox="0 0 288 288" className="w-full h-full transform -rotate-90">
                    {/* 배경 원 (데이터 없을 때 보임) */}
                    <circle cx={144} cy={144} r={120} fill="none" stroke="#E5E7EB" strokeWidth={24} />
                    
                    {segments.map((s) => (
                      <circle key={s.key} cx={144} cy={144} r={120} fill="none" stroke={s.color} strokeWidth={24} strokeLinecap="round" strokeDasharray={`${s.dash} ${Math.max(0.001, CIRCUMFERENCE - s.dash)}`} strokeDashoffset={s.offset} />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-800 mb-1 font-['Inter']">Avg</span>
                    <span className="text-5xl font-black text-black tracking-tight font-['Inter']">{stats.avgTemp}°C</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-x-16 gap-y-4">
                  {DISTRIBUTION_ORDER.map((key, i) => (
                    <LegendItem key={key} color={`bg-[${DISTRIBUTION_COLORS[i]}]`} label={key} value={distributionTotal > 0 ? ((distribution[key] || 0) / distributionTotal * 100) : 0} />
                  ))}
                </div>
            </div>
          </section>

          {/* 기분 변화 추이 */}
          <section className="bg-[#FFFBF2]/50 rounded-xl p-8 border-2 border-[#FFD900]">
            <h2 className="text-[#8E573E] text-2xl font-semibold mb-6 flex items-center gap-2"><SmileIcon small /> 기분 변화 추이</h2>
            <div className="w-full h-64 relative flex items-end p-4 pl-12">
                {trendData.length > 0 ? (
                  <svg className="absolute inset-0 w-full h-full p-10 pl-16 overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="0" y2="200" stroke="#8E573E" strokeWidth="2" />
                    <line x1="0" y1="200" x2="1000" y2="200" stroke="#8E573E" strokeWidth="2" />
                    {/* Trend Path: 데이터가 1개일 경우 점만 찍히도록 처리 */}
                    <path 
                      d={trendData.length > 1 
                          ? `M ${trendData[0].x} ${trendData[0].y} ` + trendData.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') 
                          : ""} 
                      fill="none" 
                      stroke="#8E573E" 
                      strokeWidth="3" 
                    />
                    {trendData.map((point, index) => (
                      <g key={index}>
                        <circle cx={point.x} cy={point.y} r="6" fill="#8E573E" />
                        <text x={point.x} y="230" textAnchor="middle" fill="#8E573E" className="text-xs font-bold" style={{ fontSize: '18px' }}>{point.date}</text>
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
            <h3 className="text-[#8E573E] text-3xl font-medium">더 많은 추억을 만들어보세요.</h3>
            <div className="flex gap-8">
              <ActionButton label="새 일기 작성하기" onClick={() => navigate('/write')} primary />
              <ActionButton label="임시저장 페이지" onClick={() => navigate('/drafts')} icon="save" />
              <ActionButton label="지난 분석 보기" onClick={() => navigate('/records')} icon="search" />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

// ... 서브 컴포넌트 (디자인 유지) ...
function StatCard({ title, value, unit, desc, icon }: any) {
  return (
    <div className="bg-[#FFFBF2] rounded-xl p-6 border-2 border-[#FFD900] flex flex-col items-center text-center shadow-md-custom">
       <div className="mb-4">{icon}</div>
       <div className="text-[#8E573E] text-4xl font-semibold mb-2">{value}<span className="font-normal">{unit}</span></div>
       <div className="text-[#8E573E]/70 text-xl mb-4">{title}</div>
       <div className="text-orange-400 text-sm">{desc}</div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string, label: string, value?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: color.replace('bg-[', '').replace(']', '') }}></div>
      <span className="text-xl font-bold text-gray-700">{label}</span>
      {typeof value === 'number' && <span className="text-sm text-[#8E573E] ml-2">{Math.round(value)}%</span>}
    </div>
  );
}

function ActionButton({ label, onClick, primary, icon }: any) {
  return (
    <button onClick={onClick} className={`w-64 h-14 rounded-xl flex items-center justify-center gap-3 text-xl font-medium transition-all ${primary ? 'bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white hover:brightness-110 shadow-md' : 'bg-white border-2 border-orange-300 text-[#8E573E] hover:bg-orange-50'}`}> 
      {icon && <span className="text-lg">📄</span>} {label}
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