import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Menu, X, PenSquare } from "lucide-react";
import defaultImg from "../../assets/defaultImg.png"; // 2. 기본 이미지 임포트
import { useNavigate } from "react-router-dom";



const navItems = [
  { to: "/", label: "홈" },
  { to: "/write", label: "일기 작성" },
  { to: "/results", label: "감정 분석" },
  { to: "/records", label: "지난 일기" } /*지난일기 링크 수정*/,
  { to: "/bookmark", label: "북마크" },
  { to: "/myprofile", label: "프로필" } /*프로필 링크 수정*/,
  { to: "/recommendation", label: "추천 컨텐츠" },
];

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultImg);  // 상태 추가: 초기 기본 이미지
  const [nickName, setNickname] = useState("사용자"); // 사용자 닉네임 상태

  useEffect(() => {
    const fetchProfileData = async () =>{
      try{
        const response = await fetch("/api/user/nickname"); // 가정: 사용자 닉네임 API
        if(response.ok){
          const data = await response.json();
          setProfileImage(data.avatarUrl || defaultImg); // 프로필 이미지 설정
          setNickname(data.nickname || "사용자"); // 닉네임 설정
        }
      } catch (error){
        console.error("프로필 데이터 로드 실패:", error);
        //에러시 기본값 유지
      }
  };
  fetchProfileData();
  }, []);  // 컴포넌트 마운트 시 한 번 실행


  return (
    <header className="sticky mt-24 z-40 w-[1024px] border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container w-full flex h-[153px] items-center px-4 sm:px-6 border items-center justify-around">
        <a 
          href="/"
          className="flex items-center gap-2 font-semibold text-gray-900"
        >
          <img src="/diaryImg.png" className="h-12 w-12" />
          <span className="text-[32px] font-['jsMath-cmti10'] text-[#8E573E]">mooDiary</span>
        </a>

        {/* Desktop nav */}
        <div className="w-[543px] h-[70px] items-center flex border ml-8">
          <nav className="md:flex w-530 items-center gap-5 text-base justify-around ml-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap transition-colors hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 pb-2",
                    isActive ? "text-gray-900" : "text-gray-500",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <button className="w-14 h-14 rounded ml-4 mt-4">
            <img src={defaultImg} alt="프로필 이미지" className="h-full w-full object-contain" />
            <span className="text-[12px] whitespace-nowrap">안녕하세요, {nickName}님</span>
          </button>
        </div>

        <div>
          <button className="w-[104px] h-[35px] border rounded-sm ml-4" onClick={() => navigate("/login")}>
            Logout
          </button>
        </div>

        {/* Mobile */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md border px-2.5 py-2 text-gray-700"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-2 py-2 text-sm transition-colors hover:bg-gray-50",
                    isActive ? "text-gray-900" : "text-gray-600",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
