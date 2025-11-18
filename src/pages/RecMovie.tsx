import Header from "../components/layout/Header";

export default function RecMovie() {
  return (
    <>
      <Header />
      <section>
        <div>
          <div>
            <span>mooDiary</span>
          </div>
          <div>
            <span>당신의 감정에 맞는 특별한 추천</span>
          </div>
          <div>
            <span>
              AI가 분석한 감정을 바탕으로 책, 영화, 음악 등을 추천해드려요!
            </span>
          </div>
        </div>

        <div></div>
        <div className="flex"></div>
      </section>
    </>
  );
}
