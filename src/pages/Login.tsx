import React, { useState } from "react";
import kakaoIcon from "../assets/kakao.png";
import eyeIcon from "../assets/eye.png";


const Login: React.FC = () => {
  const [email, setEmail] = useState(""); // username → email 변경
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 일반 로그인 요청
  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`로그인 실패: ${errorText}`);
      }

      const data = await response.json();

      // 응답 데이터 예시:
      // {
      //   "accessToken": "...",
      //   "refreshToken": "...",
      //   "tokenType": "Bearer",
      //   "expiresIn": 86400000
      // }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("tokenType", data.tokenType);
      localStorage.setItem("expiresIn", data.expiresIn);

      alert("로그인 성공! 🎉");
      window.location.href = "/"; // 메인 페이지 등으로 이동
    } catch (error) {
      console.error(error);
      alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = "http://www.jinwook.shop/api/oauth2/authorization/kakao";
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://www.jinwook.shop/api/oauth2/authorization/google";
  };
    return (
    <>
      {/* 중앙 로그인 영역 */}
      <div className="flex flex-col justify-center items-center">
        {/* 로그인 카드 */}
        <div className="bg-[#fff7e2] w-[1200px] h-[720px] rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.1)] flex overflow-hidden border border-[#f2cfa4]">
          {/* 왼쪽 영역 */}
          <div className="flex flex-col items-center justify-center w-1/2 bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA] border-r border-orange-200 relative">
            <h1 className="text-[32px] font-serif text-[#b86b3b] mb-2 flex items-center">
              <span className="text-[34px] mr-2">📖</span> mooDiary
              <span className="ml-1 text-red-500">❤️</span>
            </h1>
            <p className="text-center text-gray-700 mt-4 leading-relaxed text-[17px]">
              감정 일기장에<br />오신 것을 환영합니다
            </p>
            <p className="text-center text-gray-600 mt-2 text-sm">
              당신의 뜻깊은 하루를 기록해보세요
            </p>

            <div className="w-28 h-28 mt-10 rounded-full flex items-center justify-center bg-[#ffd6b3]">
              <div className="w-16 h-16 bg-[#ff8c66] rounded-full flex items-center justify-center text-2xl">
                ❤️
              </div>
            </div>
          </div>

          {/* 오른쪽 영역 */}
          <div className="flex flex-col justify-center items-center w-1/2 bg-gradient-to-b from-[#fff8e5] to-[#fff0c7] px-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b border-orange-200 pb-2 w-full text-center">
              로그인
            </h2>

            <div className="w-full space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">이메일</label>
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70 placeholder:text-gray-400 text-black"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70 placeholder:text-gray-400 text-black"
                  />
                  <span
                    className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img src={eyeIcon} alt="eye" className="w-5 h-5" />
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-orange-400" />
                  <span>로그인 유지</span>
                </label>
                <button className="text-orange-500 hover:underline">
                  비밀번호 찾기
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin}
              className="mt-5 w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-2.5 rounded-md shadow-md transition"
            >
              일기장 열기
            </button>

            {/* 소셜 로그인 구분선 */}
            <div className="flex items-center my-4 w-full">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-2 text-gray-400 text-sm">
                또는 다른 방법으로 로그인
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* 카카오 로그인 */}
            <button
              onClick={handleKakaoLogin}
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-gray-800 font-semibold py-2.5 rounded-md shadow-sm transition flex items-center justify-center space-x-2"
            >
              <img src={kakaoIcon} alt="kakao" className="w-4 h-4" />
              <span>카카오 로그인</span>
            </button>

            {/* 구글 로그인 */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-md shadow-sm mt-2 flex items-center justify-center space-x-2"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5"
              />
              <span>Google 로그인</span>
            </button>

            <p className="mt-5 text-sm text-gray-600">
              처음 오셨나요?{" "}
              <span className="text-orange-500 hover:underline cursor-pointer">
                새 일기장 만들기
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 하단 Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-[#FAD7A1] to-[#F7A54A] text-center text-[#b86b3b] text-sm py-4 shadow-inner">
        2025년, mooDiary 와 함께 매일매일을 특별한 일상으로 꾸며보세요.
      </footer>
    </>
  );
};

export default Login;