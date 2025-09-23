import { Button } from "@/components/ui/button";
import Book from "/book.png";
import Film from "/movie.png";
import Headphones from "/music.png";
import Coffee from "/poem.png";
import { Image } from "lucide-react";
import FileText from "/phrase.png";

const recent = [
  { date: "2025. 08. 25", summary: "오늘의 감정 요약 : 즐거움, 행복함" },
  { date: "2025. 08. 26", summary: "오늘의 감정 요약 : 우울함, 아쉬움" },
  { date: "2025. 08. 28", summary: "오늘의 감정 요약 : 행복함, 즐거움" },
  { date: "2025. 08. 29", summary: "오늘의 감정 요약 : 상쾌함, 행복함" },
];

export default function Index() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-[1440px] container mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            감정을 기록하는 특별한 방법
          </h1>
          <p className="mt-4 text-gray-600">
            AI가 분석하는 당신의 감정일기, mooDiary 와 함께 시작해보세요.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-xl border bg-gray-50 shadow-sm">
          <div className="aspect-[16/7] w-full grid place-items-center text-gray-400">
            <div className="flex items-center gap-3 rounded-lg border bg-white/60 px-4 py-2 shadow-sm">
              <Image className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button className="rounded-full px-8 py-6 text-base">
            Get Started
          </Button>
        </div>
      </section>

      {/* Recent Diary Records */}
      <section className="container max-w-[1440px] px-4 sm:px-6 py-16">
        <div className="text-center">
          <p className="text-sm text-gray-500">Recent Diary Records</p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            최근 일기 기록
          </h2>
        </div>

        <div className="w-full inline-flex justify-center items-center gap-7 mt-16">
          <div className="p-5 bg-white rounded-[10px] inline-flex flex-col justify-center items-center gap-7">
            <div
              data-style="Image"
              className="w-96 h-60 bg-indigo-50 inline-flex justify-center items-center gap-2.5"
            ></div>
            <div className="w-96 flex flex-col justify-center items-center gap-4">
              <div className="self-stretch text-center justify-center text-neutral-800 text-2xl font-semibold font-['Inter'] capitalize tracking-tight">
                2025. 08. 27
              </div>
              <div className="self-stretch text-center justify-center text-neutral-500 text-xl font-normal font-['Inter'] capitalize leading-normal tracking-tight">
                오늘의 감정 요약 : 즐거움 , 행복함
                <br />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-[10px] inline-flex flex-col justify-start items-start gap-7">
            <div
              data-style="Image"
              className="w-96 h-60 bg-indigo-50 inline-flex justify-center items-center gap-2.5"
            ></div>
            <div className="w-96 flex flex-col justify-center items-center gap-4">
              <div className="self-stretch text-center justify-center text-neutral-800 text-2xl font-semibold font-['Inter'] capitalize tracking-tight">
                2025. 08. 28
              </div>
              <div className="self-stretch text-center justify-center text-neutral-500 text-xl font-normal font-['Inter'] capitalize leading-normal tracking-tight">
                오늘의 감정 요약 : 우울함 , 아쉬움
              </div>
            </div>
          </div>
        </div>

        <div className="w-full inline-flex justify-center items-center gap-7 mt-16">
          <div className="p-5 bg-white rounded-[10px] inline-flex flex-col justify-center items-center gap-7">
            <div
              data-style="Image"
              className="w-96 h-60 bg-indigo-50 inline-flex justify-center items-center gap-2.5"
            ></div>
            <div className="w-96 flex flex-col justify-center items-center gap-4">
              <div className="self-stretch text-center justify-center text-neutral-800 text-2xl font-semibold font-['Inter'] capitalize tracking-tight">
                2025. 08. 29
              </div>
              <div className="self-stretch text-center justify-center text-neutral-500 text-xl font-normal font-['Inter'] capitalize leading-normal tracking-tight">
                오늘의 감정 요약 : 즐거움 , 행복함
                <br />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-[10px] inline-flex flex-col justify-start items-start gap-7">
            <div
              data-style="Image"
              className="w-96 h-60 bg-indigo-50 inline-flex justify-center items-center gap-2.5"
            ></div>
            <div className="w-96 flex flex-col justify-center items-center gap-4">
              <div className="self-stretch text-center justify-center text-neutral-800 text-2xl font-semibold font-['Inter'] capitalize tracking-tight">
                2025. 08. 30
              </div>
              <div className="self-stretch text-center justify-center text-neutral-500 text-xl font-normal font-['Inter'] capitalize leading-normal tracking-tight">
                오늘의 감정 요약 : 우울함 , 아쉬움
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 mt-12">
        <h2 className="text-center text-5xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          추천 콘텐츠
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-18 w-18 place-items-center rounded-md border bg-gray-50">
              <img src={Book} alt="책 아이콘" className="h-16 w-16" />
            </span>
            <span className="text-sm">Book</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-18 w-18 place-items-center rounded-md border bg-gray-50">
              <img src={Film} alt="영화 아이콘" className="h-16 w-16" />
            </span>
            <span className="text-sm">Movie</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-18 w-18 place-items-center rounded-md border bg-gray-50">
              <img src={Headphones} alt="헤드폰 아이콘" className="h-16 w-16" />
            </span>
            <span className="text-sm">Music</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-18 w-18 place-items-center rounded-md border bg-gray-50">
              <img src={Coffee} alt="책 아이콘" className="h-16 w-16" />
            </span>
            <span className="text-sm">Poem</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-18 w-18 place-items-center rounded-md border bg-gray-50">
              <img src={FileText} alt="phrase" className="h-16 w-16" />
            </span>
            <span className="text-sm">Phrase</span>
          </div>
        </div>
      </section>
    </>
  );
}
