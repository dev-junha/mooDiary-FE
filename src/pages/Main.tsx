import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import Frame from "../components/ui/frame";
import Header from "../components/layout/Header";
import { useState, useEffect } from "react";
import writeBgImg from "../assets/writeBgImg.png";
import recordBg from "../assets/recordBg.png";
import { useNavigate } from "react-router-dom";


const recent = [
  { date: "2025. 08. 25", summary: "오늘의 감정 요약 : 즐거움, 행복함" },
  { date: "2025. 08. 26", summary: "오늘의 감정 요약 : 우울함, 아쉬움" },
  { date: "2025. 08. 28", summary: "오늘의 감정 요약 : 행복함, 즐거움" },
  { date: "2025. 08. 29", summary: "오늘의 감정 요약 : 상쾌함, 행복함" },
];

export default function Index() {
  const navigate = useNavigate();
  const [nickName, setNickname] = useState("사용자");
  const [emotion, setEmotion] = useState("행복함");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/userdata");
        if (response.ok) {
          const data = await response.json();
          setNickname(data.nickname || "사용자");
          setEmotion(data.recentEmotion || "행복함");
        }
      } catch (error) {
        console.error("사용자 데이터 로드 실패:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="max-w-[1217px] max-h-[1980px] container px-4 sm:px-6">
      <section className="flex">
        <Frame />
        <div className="flex flex-col flex-1">
          <Header />
          <section className="mt-24 flex flex-col justify-center items-center">
            <div>
              <span className="text-5xl font-['jsMath-cmti10'] text-[#8E573E] font-bold">mooDiary</span>
            </div>
            <div className="mt-12">
              <span className="text-4xl">안녕하세요, {nickName}님!</span>
            </div>
            <div className="mt-16">
              <span className="text-2xl">
                오늘의 감정을 표현해 보세요. <br /> 
                당신의 하루가 어떠셨나요?
              </span>
            </div>
            <div className="mt-8 flex flex-col items-center w-[360px] aspect-[1696/1284] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${writeBgImg})` }}>
              <div className="flex rounded-lg shadow-sm h-[92px] w-[92px] mt-16">
                <img src="/diaries.png" alt="다이어리 이미지" className="w-full h-full object-contain"/>
              </div>
              <div className="flex w-[240px] h-[35px] mt-8">
                <button className="w-full h-full border rounded-sm text-white bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A]">
                  + 오늘의 일기 작성하기
                </button>
              </div>
            </div>
          </section>

          {/* Recent Diary Records */}
          <section className="container max-w-[1440px] px-4 sm:px-6 py-16">
            <div className="text-center">
              <h2 className="mt-1 text-[40px] sm:text-3xl font-semibold tracking-tight text-[#8E573E] font-['Inter']">
                최근 일기 기록
              </h2>
            </div>
            <div className="w-full flex justify-center items-center gap-8 mt-16 flex-wrap">
              {recent.map((entry, index) => (
                <div 
                  key={index}
                  className="p-5 bg-white rounded-[10px] inline-flex flex-col gap-3 w-[332px] h-[203px] bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${recordBg})`, backgroundSize: 'contain' }}
                >
                  <div className="mt-2 self-stretch text-neutral-800 text-[22px] font-semibold font-['Inter'] capitalize tracking-tight">
                    <span className="text-[#9A623D] font-normal">{entry.date}</span>
                  </div>
                  <div className="self-stretch text-neutral-500 text-xl font-normal font-['Inter'] capitalize leading-normal tracking-tight">
                    {entry.summary}
                  </div>
                  <div className="flex">
                    //표 넣기
                    //감정온도 : 37.5도 이와같이 넣기
                  </div>

                </div>
              ))}
            </div>
              <div className="w-64 h-12 mt-10 mx-auto">
              <button
                className="w-full h-full rounded-md bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white font-semibold hover:brightness-110"
              >
                <span className="text-2xl font-['Inter']">&gt; 모든 일기 보기</span>
              </button>
            </div>
          </section>

          {/* Recommendations */}
          <section className="container max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 mt-12">
            <h2 className="text-center">
              <span className="text-[40px] sm:text-3xl font-semibold font-['Inter'] text-[#8E573E]">추천 콘텐츠</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
              <div className="flex flex-col items-center gap-3">
                <span className="grid w-[133px] h-[101px] place-items-center rounded-md">
                  <img src="/book.png" alt="책 아이콘" className="w-full h-full object-contain"/>
                </span>
                <span className="text-sm">도서</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="grid w-[133px] h-[101px] place-items-center rounded-md">
                  <button onClick={() => navigate("/movies")}>
                  <img src="/movie.png" alt="영화 아이콘" className="w-full h-full object-contain"/>
                  </button>
                </span>
                <span className="text-sm">영화</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => navigate("/music")}>
                <span className="grid w-[133px] h-[101px] place-items-center rounded-md">
                  <img src="/music.png" alt="헤드폰 아이콘" className="w-full h-full object-contain"/>
                </span>
                </button>
                <span className="text-sm">음악</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => navigate("/poem")}>
                <span className="grid w-[133px] h-[101px] place-items-center rounded-md">
                  <img src="/book.png" alt="책 아이콘" className="w-full h-full object-contain"/>
                </span>
                </button>
                <span className="text-sm">시</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => navigate("/phrase")}>
                <span className="grid w-[133px] h-[101px] place-items-center rounded-md">
                  <img src="/phrase.png" alt="phrase" className="w-full h-full object-contain" />
                </span>
                </button>
                <span className="text-sm">명언</span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}