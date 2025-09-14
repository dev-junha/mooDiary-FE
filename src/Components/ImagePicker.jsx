import { useRef, useState } from "react";

export default function ImagePicker({ value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      onChange?.(dataUrl);
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <div className="upload-box" onClick={()=>inputRef.current?.click()}>
        {preview
          ? <img src={preview} alt="선택한 이미지 미리보기" />
          : <div className="upload-empty"><span className="upload-icon" aria-hidden>🖼️</span></div>}
      </div>
      <p className="upload-caption">오늘의 이미지를 업로드하세요. JPG/PNG/GIF, 최대 5MB</p>
      <button type="button" className="btn ghost" onClick={()=>inputRef.current?.click()}>Upload image</button>
      {preview && <button type="button" className="btn text" onClick={()=>{ setPreview(""); onChange?.(""); }}>삭제</button>}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile}/>
    </div>
  );
}