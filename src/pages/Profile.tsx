import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";  // ⭐ 추가

export default function App() {
  const navigate = useNavigate();
  const { user } = useUserData();  // ⭐ fetchUserData 제거하고 이것만 사용

  const handleLogout = () => {
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA]">

      {/* ----------------- NavBar ----------------- */}
      <div className="w-full bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA] shadow-lg">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-8 py-4">

          {/* Left - Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/main')}>
            <img src="/diaryImg.png" className="h-12 w-12" />
            <span className="text-[#7A4E32] font-serif text-2xl">mooDiary</span>
          </div>

          {/* Center - Menu */}
          <div className="flex items-center justify-center">
            <div className="bg-[#F7E59E] shadow-md rounded-xl px-6 py-3 flex gap-6 text-[#CAAA74] font-medium text-[15px]">
              
              <button onClick={() => navigate('/main')} className="text-[#C18E00] hover:text-[#8B6E4E] transition-colors">
                홈
              </button>

              <button onClick={() => navigate('/write')} className="hover:text-[#C18E00] transition-colors">
                일기 작성
              </button>

              <button onClick={() => navigate('/results')} className="hover:text-[#C18E00] transition-colors">
                감정 분석
              </button>

              <button onClick={() => navigate('/records')} className="hover:text-[#C18E00] transition-colors">
                지난 일기
              </button>

              <button onClick={() => navigate('/bookmark')} className="hover:text-[#C18E00] transition-colors">
                북마크
              </button>

              <button onClick={() => navigate('/profile')} className="hover:text-[#C18E00] transition-colors">
                프로필
              </button>

              <button onClick={() => navigate('/recommendation')} className="hover:text-[#C18E00] transition-colors">
                추천 콘텐츠
              </button>

            </div>
          </div>

          {/* Right - Profile */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-5 py-2 rounded-lg bg-[#FF8F34] text-white font-medium shadow hover:bg-[#e6802e] transition-colors"
            >
              Logout
            </button>

            <img
              src={user?.profileImage || "/profile.png"}
              className="w-10 h-10 rounded-full border bg-white object-cover cursor-pointer"
              alt="profile"
              onClick={() => navigate('/profile')}
            />

            <span className="text-sm text-gray-700">
              안녕하세요, <b>{user?.nickname || "게스트"}님!</b>
            </span>
          </div>
        </div>

        <div className="w-full flex justify-between px-14 pb-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#FFF59D] border-2 border-[#F4D96B] rounded-full"
            ></div>
          ))}
        </div>
      </div>
      {/* ----------------- END NavBar ----------------- */}

      {/* ----------------- Profile Page ----------------- */}
      <div className="w-full min-h-screen bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA] px-10 py-14">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-3xl font-semibold text-[#7A4E32] mb-2">내 프로필</h1>
          <p className="text-[#B08A62] mb-10">개인정보와 설정을 관리하세요.</p>

          <div className="flex gap-10">

            {/* Left - Info */}
            <div className="flex-1 bg-white/60 rounded-xl shadow-md p-10 border border-[#F0D9A5]">

              {/* Header */}
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-medium text-[#7A4E32]">개인정보</h2>
                <button className="px-5 py-1 rounded-lg bg-[#FFE7A3] shadow text-[#C18E00] font-medium">
                  편집
                </button>
              </div>

              {/* Profile Image */}
              <div className="flex items-center gap-6 mb-8">
                <img
                  src={user?.profileImage || "/profile.png"}
                  className="w-28 h-28 rounded-full object-cover border-2 border-[#F3D9A1] bg-white"
                  alt="profile"
                />
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">

                <div className="flex flex-col">
                  <label className="text-[#7A4E32] mb-1">이름</label>
                  <input
                    type="text"
                    value={user?.username || ""}
                    readOnly
                    className="border border-[#F0C98C] rounded-md p-2 bg-white/70"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[#7A4E32] mb-1">이메일</label>
                  <input
                    type="text"
                    value={user?.email || ""}
                    readOnly
                    className="border border-[#F0C98C] rounded-md p-2 bg-white/50 text-gray-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[#7A4E32] mb-1">전화번호</label>
                  <input
                    type="text"
                    value={user?.phone || ""}
                    readOnly
                    className="border border-[#F0C98C] rounded-md p-2 bg-white/70"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[#7A4E32] mb-1">위치</label>
                  <input
                    type="text"
                    value={user?.location || ""}
                    readOnly
                    className="border border-[#F0C98C] rounded-md p-2 bg-white/70"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col mt-4">
                <label className="text-[#7A4E32] mb-2">자기소개</label>
                <textarea
                  rows={6}
                  value={user?.bio || ""}
                  readOnly
                  className="border border-[#F0C98C] rounded-md p-3 bg-white/70 resize-none"
                />
              </div>
            </div>

            {/* Right - Stats */}
            <div className="w-80 bg-white/60 rounded-xl shadow-md p-8 border border-[#F0D9A5] flex flex-col gap-6">

              <h2 className="text-xl font-medium text-[#7A4E32] text-center mb-2">활동 통계</h2>

              <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-6 text-center text-[#7A4E32]">
                <div className="text-4xl font-bold">47</div>
                <div className="mt-1">총 일기 수</div>
              </div>

               <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-6 text-center text-[#7A4E32]">
                 <div className="text-4xl font-bold">12</div>
                 <div className="mt-1">연속 일기 기록</div>
               </div>

               <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-6 text-center text-[#7A4E32]">
                 <div className="text-3xl font-bold">36.8°C</div>
                 <div className="mt-1">평균 감정 온도</div>
               </div>

               <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-6 text-center text-[#7A4E32]">
                 <div className="text-3xl font-bold">행복함</div>
                 <div className="mt-1">가장 많은 감정</div>
               </div>

              <p className="text-xs text-[#8A745A] mt-2 text-center">
                * 가장 많은 감정은 최근 일기 기록 10개를 기준으로 작성
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ----------------- END Profile Page ----------------- */}

      {/* ----------------- Setting Page ----------------- */}
      <div className="w-full min-h-screen bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA] px-12 py-12">
        <div className="max-w-screen-xl mx-auto">
          <div className="w-[70%] h-[600px] bg-white/60 rounded-xl border border-[#F5B46A] shadow-md p-8">
            <h2 className="text-lg font-medium text-[#7A4E32] mb-4">설정</h2>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-[#FAD7A1] to-[#F7A54A] text-center text-[#b86b3b] text-sm py-4 shadow-inner">
        2025년, mooDiary 와 함께 매일매일을 특별한 일상으로 꾸며보세요.
      </footer>
    </div>
  );
}
