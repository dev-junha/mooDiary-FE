import writeBgImg from "@/assets/writeBgImg.png";
import recordBg from "@/assets/recordBg.png";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { RECOMMENDATION_CATEGORIES } from "@/constants/navigation";
import { PageLayout } from "@/components/common/PageLayout";
import type { DiaryEntry } from "@shared/types";

// TODO: API에서 받아오도록 수정 필요
const recent: DiaryEntry[] = [
  { date: "2025. 08. 25", summary: "오늘의 감정 요약 : 즐거움, 행복함" },
  { date: "2025. 08. 26", summary: "오늘의 감정 요약 : 우울함, 아쉬움" },
  { date: "2025. 08. 28", summary: "오늘의 감정 요약 : 행복함, 즐거움" },
  { date: "2025. 08. 29", summary: "오늘의 감정 요약 : 상쾌함, 행복함" },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useUserData();

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
                {recent.map((entry, index) => (
                  <div
                    key={index}
                    className="p-5 bg-white rounded-[10px] inline-flex flex-col gap-3 w-[332px] h-[203px] bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${recordBg})`,
                      backgroundSize: "contain",
                    }}
                  >
                    <div className="mt-2 self-stretch text-neutral-800 text-[22px] font-semibold font-['Inter'] capitalize tracking-tight">
                      <span className="text-[#9A623D] font-normal">
                        {entry.date}
                      </span>
                    </div>
                    <div className="self-stretch text-neutral-500 text-xl font-normal font-['Inter'] capitalize leading-normal tracking-tight">
                      {entry.summary}
                    </div>
                    <div className="flex">{/* TODO: 표정/감정온도 */}</div>
                  </div>
                ))}
              </div>
              <div className="w-64 h-12 mt-10 mx-auto">
                <button className="w-full h-full rounded-md bg-gradient-to-r from-[#FF9E0D] to-[#FF5B3A] text-white font-semibold hover:brightness-110">
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
