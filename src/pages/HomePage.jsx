// src/pages/HomePage.jsx
import React, { useState, useRef } from 'react';

// --- 아이콘 컴포넌트 (변경 없음) ---
const EditIcon = () => ( <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 8H8C6.93913 8 5.92172 8.42143 5.17157 9.17157C4.42143 9.92172 4 10.9391 4 12V40C4 41.0609 4.42143 42.0783 5.17157 42.8284C5.92172 43.5786 6.93913 44 8 44H36C37.0609 44 38.0783 43.5786 38.8284 42.8284C39.5786 42.0783 40 41.0609 40 40V26" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M37 5.00045C37.7956 4.2048 38.8748 3.75781 40 3.75781C41.1252 3.75781 42.2044 4.2048 43 5.00045C43.7956 5.7961 44.2426 6.87523 44.2426 8.00045C44.2426 9.12567 43.7956 10.2048 43 11.0005L24 30.0005L16 32.0005L18 24.0005L37 5.00045Z" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ImagePlaceholderIcon = () => ( <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M83.3333 11.5H12.6667C7.30658 11.5 3 15.8066 3 21.1667V74.8333C3 80.1934 7.30658 84.5 12.6667 84.5H83.3333C88.6934 84.5 93 80.1934 93 74.8333V21.1667C93 15.8066 88.6934 11.5 83.3333 11.5Z" stroke="#212121" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M34.5 42.333C38.9183 42.333 42.5 38.7513 42.5 34.333C42.5 29.9147 38.9183 26.333 34.5 26.333C30.0817 26.333 26.5 29.9147 26.5 34.333C26.5 38.7513 30.0817 42.333 34.5 42.333Z" stroke="#212121" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M88.166 62.833L65.5 40.166L17.833 84.499" stroke="#212121" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const SaveIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 21V13H7V21" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 3V8H15" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const AnalyzeIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.0004 21.0004L16.6504 16.6504" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const CompleteIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );

// --- ToggleSwitch (변경 없음) ---
const ToggleSwitch = ({ name, title, description, checked, onChange }) => (
  <div className="flex justify-between items-center border border-border-muted rounded-lg p-4 min-h-[107px] bg-white/50">
    <div className="flex flex-col gap-1">
      <span className="text-lg font-medium text-brand-brown tracking-tight">{title}</span>
      <span className="text-sm font-medium text-text-muted tracking-tight">{description}</span>
    </div>
    <label className="relative inline-block w-20 h-12 flex-shrink-0 cursor-pointer">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="opacity-0 w-0 h-0 peer" />
      <span className="absolute top-0 left-0 right-0 bottom-0 bg-toggle-inactive-bg rounded-3xl transition-colors peer-checked:bg-toggle-bg"></span>
      <span className="absolute content-[''] h-10 w-10 left-1 bottom-1 bg-white rounded-full shadow-md transition-all peer-checked:left-9"></span>
    </label>
  </div>
);

// --- ActionButton (변경 없음) ---
const ActionButton = ({ type = "button", text, icon, variant = "save", onClick, disabled = false }) => {
  const baseStyle = "w-full md:w-auto flex-1 max-w-full md:max-w-[337px] h-[54px] rounded-lg border border-text-dark flex items-center justify-center gap-2.5 text-2xl font-medium tracking-tight cursor-pointer transition-colors";
  const variants = {
    save: "bg-button-secondary-bg text-text-dark hover:bg-button-secondary-hover",
    analyze: "bg-button-primary-bg text-text-dark hover:bg-button-primary-hover",
    complete: "bg-gray-300 text-text-dark hover:bg-gray-400",
  };
  const disabledStyle = "disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed";

  return (
    <button type={type} className={`${baseStyle} ${variants[variant]} ${disabledStyle}`} onClick={onClick} disabled={disabled}>
      {icon}
      <span>{text}</span>
    </button>
  );
};


// --- 더미 API 호출 함수 (변경 없음) ---
const apiSaveDraft = (formData) => {
  console.log("--- API CALL: apiSaveDraft ---");
  for (let [key, value] of formData.entries()) { console.log(`${key}:`, value); }
  return new Promise(resolve => setTimeout(() => resolve({ status: 'success', message: '임시저장 완료', draftId: 'draft-123' }), 1000));
};

const apiAnalyzeEmotion = (formData) => {
  console.log("--- API CALL: apiAnalyzeEmotion ---");
  for (let [key, value] of formData.entries()) { console.log(`${key}:`, value); }
  return new Promise(resolve => setTimeout(() => {
    const dummyResult = { textEmotion: { "기쁨": 0.7, "슬픔": 0.1, "중립": 0.2 }, faceEmotion: { "행복": 0.8, "놀람": 0.2 }, combinedEmotion: "기쁨 (85%)" };
    resolve({ status: 'success', data: dummyResult });
  }, 1500));
};

const apiSubmitDiary = (formData) => {
  console.log("--- API CALL: apiSubmitDiary ---");
  for (let [key, value] of formData.entries()) { console.log(`${key}:`, value); }
  return new Promise(resolve => setTimeout(() => resolve({ status: 'success', message: '일기 저장 완료', diaryId: 'diary-abc' }), 1000));
};


// --- 메인 페이지 컴포넌트 ---
function HomePage() {
  const [diaryContent, setDiaryContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [analysisOptions, setAnalysisOptions] = useState({
    text: true,
    face: true,
    combined: true,
  });
  
  // (수정) isLoading state를 객체로 변경
  const [loadingState, setLoadingState] = useState({
    save: false,
    analyze: false,
    complete: false,
  });
  
  const [emotionPreview, setEmotionPreview] = useState(null);

  const currentLength = diaryContent.length;
  const minLength = 10;
  const maxLength = 1000;

  // (추가) 셋 중 하나라도 로딩 중인지 확인
  const isAnyLoading = loadingState.save || loadingState.analyze || loadingState.complete;

  const handleImageChange = (e) => {
    const [file] = e.target.files;
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    } else {
      setImagePreview(null);
      setImageFile(null);
    }
  };

  const handleTriggerFileUpload = () => {
    fileInputRef.current.click();
  };
  
  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setAnalysisOptions(prevOptions => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  const createDiaryFormData = () => {
    const formData = new FormData();
    formData.append('diaryContent', diaryContent);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('options', JSON.stringify(analysisOptions));
    return formData;
  };

  // (수정) 임시저장 버튼 핸들러
  const handleSave = async () => {
    console.log("임시저장 클릭");
    setLoadingState(prev => ({ ...prev, save: true })); // 'save'만 true
    setEmotionPreview(null);

    try {
      const formData = createDiaryFormData();
      const response = await apiSaveDraft(formData);
      console.log("임시저장 응답:", response);
      alert(response.message);
    } catch (error) {
      console.error("임시저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setLoadingState(prev => ({ ...prev, save: false })); // 'save'만 false
    }
  };

  // (수정) 분석 시작 버튼 핸들러
  const handleAnalyze = async () => {
    console.log("분석 시작 클릭");
    setLoadingState(prev => ({ ...prev, analyze: true })); // 'analyze'만 true
    setEmotionPreview("분석 중...");

    try {
      const formData = createDiaryFormData();
      const response = await apiAnalyzeEmotion(formData);
      console.log("분석 응답:", response);
      
      const resultText = `
        텍스트 감정: ${JSON.stringify(response.data.textEmotion)}
        표정 감정: ${JSON.stringify(response.data.faceEmotion)}
        통합 감정: ${response.data.combinedEmotion}
      `;
      setEmotionPreview(resultText);

    } catch (error) {
      console.error("분석 실패:", error);
      setEmotionPreview("분석에 실패했습니다.");
      alert("분석에 실패했습니다.");
    } finally {
      setLoadingState(prev => ({ ...prev, analyze: false })); // 'analyze'만 false
    }
  };

  // (수정) 완료 버튼 핸들러
  const handleComplete = async () => {
    console.log("완료 클릭");
    if (currentLength < minLength) {
      alert(`일기는 최소 ${minLength}자 이상 작성해야 합니다.`);
      return;
    }
    
    setLoadingState(prev => ({ ...prev, complete: true })); // 'complete'만 true
    setEmotionPreview(null);

    try {
      const formData = createDiaryFormData();
      const response = await apiSubmitDiary(formData);
      console.log("최종 제출 응답:", response);
      alert(response.message);
      // navigate(`/results/${response.diaryId}`);
    } catch (error) {
      console.error("제출 실패:", error);
      alert("제출에 실패했습니다.");
    } finally {
      setLoadingState(prev => ({ ...prev, complete: false })); // 'complete'만 false
    }
  };


  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-light-bg-start to-light-bg-end font-default">
      <div className="max-w-6xl mx-auto px-11 md:px-22 py-16 flex flex-col gap-24">
        
        {/* === 히어로 섹션 === */}
        <section className="text-center flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold text-brand-brown uppercase tracking-wide">
            감정을 기록하는 특별한 방법
          </h1>
          <p className="text-xl font-medium text-text-muted tracking-tight">
            AI가 분석하는 당신의 감정일기, MooDiary 와 함께 시작해보세요.
          </p>
        </section>

        {/* === 일기 작성 폼 === */}
        <form onSubmit={(e) => e.preventDefault()}>
          <section className="w-full max-w-5xl mx-auto flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <EditIcon />
              <h2 className="text-4xl font-medium text-text-muted tracking-wide">오늘의 일기</h2>
            </div>
            
            <textarea 
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
              placeholder="오늘 하루를 자유롭게 입력해주세요. ( 최소 10자 / 최대 1000자 )"
              className="w-full h-96 p-6 border border-border-color rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-border-color"
              minLength={minLength}
              maxLength={maxLength}
            />
            <div className="flex justify-between w-full text-xl font-medium tracking-wide">
              <span className="text-red-500">
                {currentLength > 0 && currentLength < minLength ? `* 최소 ${minLength}자 이상 작성해주세요` : ''}
              </span>
              <span className="text-text-muted ml-auto">
                글자 수 : {currentLength} / {maxLength}
              </span>
            </div>
          </section>

          {/* === 이미지 업로더 === */}
          <section className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 mt-16">
            <div className="w-full h-96 rounded-2xl shadow-md-custom bg-image-placeholder-bg flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Diary preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-text-dark">
                  <ImagePlaceholderIcon />
                  <p className="text-xl font-medium">이미지 미리보기</p>
                </div>
              )}
            </div>
            <p className="w-full max-w-3xl text-center text-text-muted text-xl font-medium leading-relaxed tracking-wide">
              오늘 하루를 표현할 수 있는 이미지 파일을 업로드해주세요.<br/>
              ( JPG , PNG, GIF 형식 , 최대 5MB )
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/png, image/jpeg, image/gif"
            />
            <button 
              type="button" 
              onClick={handleTriggerFileUpload}
              className="px-28 py-3.5 bg-button-primary-bg text-white text-xl font-medium rounded-lg hover:bg-button-primary-hover transition-colors leading-4 tracking-wide"
            >
              Upload Image
            </button>
          </section>

          {/* === 분석 옵션 === */}
          <section className="w-full max-w-6xl mx-auto mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 왼쪽: 실시간 미리보기 */}
              <div className="flex flex-col gap-6 border border-border-muted rounded-lg p-6 bg-white/30">
                <h3 className="text-2xl font-medium text-brand-brown capitalize tracking-tight">
                  실시간 감정 미리보기
                </h3>
                <div className="self-stretch h-72 bg-preview-placeholder-bg rounded-lg flex items-center justify-center text-text-muted">
                  (감정 분석 미리보기 영역)
                </div>
                <div className="self-stretch h-32 p-4 border border-border-muted rounded-lg bg-white overflow-auto">
                  <span className="text-text-dark text-base font-medium font-alt capitalize tracking-tight">
                    실시간 감정 분석 결과 : 
                  </span>
                  <pre className="text-sm text-text-dark whitespace-pre-wrap">
                    {emotionPreview || "(분석 시작 버튼을 눌러주세요)"}
                  </pre>
                </div>
              </div>

              {/* 오른쪽: 감정 분석 옵션 */}
              <div className="flex flex-col gap-6 border border-border-muted rounded-lg p-6 bg-white/30">
                <h3 className="text-2xl font-medium text-brand-brown capitalize tracking-tight">
                  감정 분석 옵션
                </h3>
                <ToggleSwitch 
                  name="text"
                  title="텍스트 감정 분석 ( KoBERT )"
                  description="AI가 일기 내용의 감정을 분석합니다."
                  checked={analysisOptions.text}
                  onChange={handleOptionChange}
                />
                <ToggleSwitch 
                  name="face"
                  title="얼굴 표정 분석 ( DeepFace )"
                  description="업로드한 사진의 표정을 분석합니다."
                  checked={analysisOptions.face}
                  onChange={handleOptionChange}
                />
                <ToggleSwitch 
                  name="combined"
                  title="통합 감정 분석 ( 가중 평균 )"
                  description="텍스트의 표정 분석을 종합하여 결과를 산출합니다."
                  checked={analysisOptions.combined}
                  onChange={handleOptionChange}
                />
              </div>
            </div>
          </section>

          {/* === 액션 버튼 (수정: text와 disabled prop을 개별 loadingState에 연결) === */}
          <section className="w-full max-w-6xl mx-auto mt-8 border border-border-muted rounded-lg p-6 bg-white/30">
            <h3 className="text-2xl font-medium text-text-dark capitalize tracking-tight mb-6">
              액션 버튼
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <ActionButton 
                variant="save" 
                text={loadingState.save ? "저장 중..." : "임시저장"} 
                icon={<SaveIcon />} 
                onClick={handleSave}
                disabled={isAnyLoading}
              />
              <ActionButton 
                variant="analyze" 
                text={loadingState.analyze ? "분석 중..." : "분석 시작"} 
                icon={<AnalyzeIcon />} 
                onClick={handleAnalyze}
                disabled={isAnyLoading}
              />
              <ActionButton 
                variant="complete" 
                text={loadingState.complete ? "전송 중..." : "완료"} 
                icon={<CompleteIcon />}
                onClick={handleComplete}
                disabled={isAnyLoading}
              />
            </div>
            <div className="mt-8 text-text-muted text-lg capitalize tracking-tight space-y-2">
              <p><b>임시저장</b> : 임시저장 이후 나중에 이어서 작성할 수 있습니다.</p>
              <p><b>분석 시작</b> : 현재 내용을 바탕으로 감정 분석을 실행합니다.</p>
              <p><b>완료</b> : 일기 작성 및 분석을 완료하고, 저장합니다. ( 결과 페이지로 이동 )</p>
            </div>
          </section>
        </form>

      </div>
    </main>
  );
}

export default HomePage;