import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DiaryForm from "../Components/DiaryForm.jsx";
import { createDiary } from "../States/diaryStore.js";

export default function DiaryNew(){
  const nav = useNavigate();

  const onSubmit = (data) => {
    try{
      const { id } = createDiary(data);
      toast.success("일기가 저장됐어요");
      nav(`/diary/${id}/edit`); // 저장 후 수정화면으로 이동 (원하면 다른 경로)
    }catch(e){
      toast.error("저장 실패");
    }
  };

  return (
    <section className="diary-screen">
      <div className="diary-hero">
        <div className="logo">mooDiary</div>
        <h1 className="headline">감정을 기록하는 특별한 방법</h1>
        <p className="subcopy">AI가 분석하는 당신의 감정일기. mooDiary와 함께 시작해보세요.</p>
      </div>
      <div className="divider" />
      <h3 className="section-title">오늘의 일기</h3>

      <DiaryForm
        onSubmit={onSubmit}
        submitLabel="작성 완료"
        showTitle={false}
        contentPlaceholder={
          "오늘 하루를 자유롭게 입력해주세요. • 어떤 일이 있었나요?\n어떤 기분이셨나요? • 소소한 일상과 특별한 순간까지 모두\n적어주세요. ( 최소 10자 / 최대 1000자 )"
        }
      />
    </section>
  );
}