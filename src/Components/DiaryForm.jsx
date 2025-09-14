import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import MoodSelector from "../Components/MoodSelector.jsx";
import ImagePicker from "../Components/ImagePicker.jsx";
import ToggleSwitch from "../Components/ToggleSwitch.jsx";
import { Card, SectionTitle } from "../Components/Card.jsx";

const MIN = 10, MAX = 1000;

export default function DiaryForm({ defaultValues, onSubmit, submitLabel="저장", showTitle=true, contentPlaceholder="" }) {
  const { register, handleSubmit, setValue, watch, reset, formState:{errors} } = useForm({
    defaultValues: {
      date: dayjs().format("YYYY-MM-DD"),
      title: "", content: "", mood: "calm", photo: "",
      option_text: true, option_face: true, option_aggregate: true,
      ...defaultValues,
    }
  });

  const content = watch("content") || "";
  const photo   = watch("photo");
  const [count, setCount] = useState(content.length);
  useEffect(()=>setCount(content.length), [content]);
  useEffect(()=>{ if (defaultValues) reset({...defaultValues}); }, [defaultValues, reset]);
  const toggle = (name, v) => setValue(name, v);

  return (
    <form className="diary-form" onSubmit={handleSubmit(onSubmit)}>
      {/* 오늘의 일기 카드 */}
      <Card>
        <SectionTitle icon="✍️">오늘의 일기</SectionTitle>
        <div className="hint-box">
          최소 10자 이상 작성해주세요
          <span className="counter">현재 {count} / {MAX}</span>
        </div>
        <textarea
          rows={8}
          className="content-area"
          placeholder={contentPlaceholder}
          {...register("content",{required:true,minLength:MIN,maxLength:MAX})}
        />
        {errors.content?.type==="required"  && <em className="err">내용을 입력하세요</em>}
        {errors.content?.type==="minLength" && <em className="err">최소 {MIN}자 이상 작성해주세요</em>}
        {errors.content?.type==="maxLength" && <em className="err">최대 {MAX}자까지 가능합니다</em>}
      </Card>

      <div className="sp-24" />

      {/* 대형 업로드 박스 */}
      <ImagePicker value={photo} onChange={(v)=>setValue("photo", v)} />

      <div className="sp-24" />

      {/* 2열: 실시간 미리보기 / 옵션 토글 */}
      <div className="grid two">
        <Card>
          <SectionTitle icon="📈">실시간 감정 미리보기</SectionTitle>
          <div className="realtime-preview">
            {photo ? <img src={photo} alt="실시간 분석 이미지" /> : <div className="preview-empty">실시간 감정 분석 준비…</div>}
          </div>
          <div className="muted">실시간 감정 분석 결과 표시</div>
        </Card>

        <Card>
          <SectionTitle icon="⚙️">문장 감정 분석 옵션</SectionTitle>
          <div className="option-row">
            <div><div className="opt-title">텍스트 감정 분석 ( KoBERT )</div><div className="opt-desc">AI가 텍스트 기반으로 감정을 분류합니다.</div></div>
            <ToggleSwitch checked={watch("option_text")} onChange={(v)=>toggle("option_text", v)} />
          </div>
          <div className="option-row">
            <div><div className="opt-title">얼굴 표정 분석 ( DeepFace )</div><div className="opt-desc">이미지에서 감정을 파악합니다.</div></div>
            <ToggleSwitch checked={watch("option_face")} onChange={(v)=>toggle("option_face", v)} />
          </div>
          <div className="option-row">
            <div><div className="opt-title">통합 감정 분석 ( 가중 평균 )</div><div className="opt-desc">여러 신호를 종합해 점수를 계산합니다.</div></div>
            <ToggleSwitch checked={watch("option_aggregate")} onChange={(v)=>toggle("option_aggregate", v)} />
          </div>
        </Card>
      </div>

      <div className="sp-16" />

      {/* 안내 & 하단 버튼 */}
      <div className="card notes">
        <details open>
          <summary>안내 버튼</summary>
          <ul>
            <li><strong>임시저장</strong>: 임시저장 시 서버에 데이터는 보내지 않습니다.</li>
            <li><strong>분석 시작</strong>: 선택된 옵션을 기준으로 감정 분석을 진행합니다.</li>
            <li><strong>완료</strong>: 작성된 일기를 저장하고 다음 단계로 이동합니다.</li>
          </ul>
        </details>
      </div>

      <div className="actions">
        <button type="button" className="btn ghost">임시저장</button>
        <button type="button" className="btn primary">분석 시작</button>
        <button type="submit" className="btn dark">{submitLabel}</button>
      </div>
    </form>
  );
}