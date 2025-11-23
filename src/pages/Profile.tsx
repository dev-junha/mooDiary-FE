import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/context/AuthContext";
import { clearTokens } from "@/lib/auth";
import MyPageHeader from "../components/layout/MyPageHeader";

export default function App() {
  const { user } = useUserData();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    clearTokens();
    logout();
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA]">
      <MyPageHeader />

      {/* ----------------- Profile Page ----------------- */}
      <div className="w-full min-h-screen bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA] px-10 py-6">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-3xl font-semibold text-[#7A4E32] mb-2">내 프로필</h1>
          <p className="text-[#B08A62] mb-8">개인정보와 설정을 관리하세요.</p>

          <div className="flex gap-8">

            {/* Left - Info */}
            <div className="flex-1 bg-white/60 rounded-xl shadow-md p-8 border border-[#F0D9A5]">

              {/* Header */}
              <div className="flex justify-between mb-5">
                <h2 className="text-xl font-medium text-[#7A4E32]">개인정보</h2>
                <button className="px-5 py-1 rounded-lg bg-[#FFE7A3] shadow text-[#C18E00] font-medium">
                  편집
                </button>
              </div>

              {/* Profile Image */}
              <div className="flex items-center gap-6 mb-6">
                <img
                  src={user?.profileImage || "/profile.png"}
                  className="w-28 h-28 rounded-full object-cover border-2 border-[#F3D9A1] bg-white"
                  alt="profile"
                />
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-2 gap-5 mb-5">

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
              <div className="flex flex-col mt-2">
                <label className="text-[#7A4E32] mb-2">자기소개</label>
                <textarea
                  rows={5}
                  value={user?.bio || ""}
                  readOnly
                  className="border border-[#F0C98C] rounded-md p-3 bg-white/70 resize-none"
                />
              </div>
            </div>

            {/* Right - Stats */}
            <div className="w-[340px] bg-white/60 rounded-xl shadow-md p-7 border border-[#F0D9A5] flex flex-col gap-4">

              <h2 className="text-xl font-medium text-[#7A4E32] text-center mb-1">활동 통계</h2>

              <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-5 text-center text-[#7A4E32]">
                <div className="text-4xl font-bold">47</div>
                <div className="mt-1">총 일기 수</div>
              </div>

               <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-5 text-center text-[#7A4E32]">
                 <div className="text-4xl font-bold">12</div>
                 <div className="mt-1">연속 일기 기록</div>
               </div>

               <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-5 text-center text-[#7A4E32]">
                 <div className="text-3xl font-bold">36.8°C</div>
                 <div className="mt-1">평균 감정 온도</div>
               </div>

               <div className="bg-[#FFE7A3] rounded-xl shadow-inner p-5 text-center text-[#7A4E32]">
                 <div className="text-3xl font-bold">행복함</div>
                 <div className="mt-1">가장 많은 감정</div>
               </div>

              <p className="text-xs text-[#8A745A] text-center">
                * 가장 많은 감정은 최근 일기 기록 10개를 기준으로 작성
              </p>

              <button 
                className="w-full py-3 rounded-lg bg-[#FFE7A3] shadow text-[#C18E00] font-medium hover:bg-[#FFD97A] transition-colors mt-2" 
                onClick={handleLogout}
              > 
                로그아웃
              </button>
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
