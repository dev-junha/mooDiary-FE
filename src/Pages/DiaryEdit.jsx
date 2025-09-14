import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import DiaryForm from "../Components/DiaryForm.jsx";
import { getDiary, updateDiary } from "../States/diaryStore.js";

export default function DiaryEdit(){
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    try{
      const data = getDiary(id);
      setItem(data);
    }catch(e){
      toast.error("일기를 불러오지 못했어요");
    }finally{
      setLoading(false);
    }
  }, [id]);

  const onSubmit = (data) => {
    try{
      updateDiary(id, data);
      toast.success("수정되었습니다");
    }catch(e){
      toast.error("수정 실패");
    }
  };

  if (loading) return <p>로딩중…</p>;
  if (!item) return <p>데이터가 없습니다.</p>;

  return (
    <section>
      <h2>감정일기 수정</h2>
      <DiaryForm defaultValues={item} onSubmit={onSubmit} submitLabel="수정 저장" />
    </section>
  );
}