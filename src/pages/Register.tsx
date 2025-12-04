import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import eyeIcon from "../assets/eye.png";
import bookIcon from "../assets/book.png";
import { register, AuthError } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";


const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 소셜 로그인 후 이메일 자동 입력
  useEffect(() => {
    const socialEmail = localStorage.getItem("socialEmail");
    if (socialEmail) setEmail(socialEmail);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !nickname || !phone || !password || !confirmPassword) {
      setErrorMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      // API 명세서에 맞춰 요청 데이터 구성
      const userId = await register({
        email,
        password,
        nickname,
        phone,
        username,
        profileImage: profileImage || undefined, // 빈 문자열이면 undefined
      });

      alert(`회원가입이 완료되었습니다! 🎉 (사용자 ID: ${userId})`);
      localStorage.removeItem("socialEmail"); // 소셜 이메일 초기화
      navigate("/login");
    } catch (error) {
      console.error(error);
      const message = error instanceof AuthError 
        ? error.message 
        : "서버 연결 중 오류가 발생했습니다.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen relative">
        <div className="bg-[#fff7e2] w-[1200px] h-[720px] rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.1)] flex overflow-hidden relative">
          {/* 왼쪽 영역 */}
          <div className="flex flex-col items-center justify-center w-1/2 bg-gradient-to-b from-[#FFFBEF] via-[#FFEAB1] to-[#F8EFAA] relative border-[4px] border-orange-200 rounded-lg shadow-sm">
            <h1 className="text-[28px] font-semibold text-[#b86b3b] mb-2 flex items-center">
              <img src={bookIcon} alt="check" className="w-8 h-8 mr-2" />
              mooDiary
              {/*
              <span className="ml-1 text-red-500">❤️</span>
              */}
            </h1>
            <p className="text-center text-gray-700 mt-4 leading-relaxed">
              감정 일기장에<br />오신 것을 환영합니다
            </p>
            <p className="text-center text-gray-600 mt-2 text-sm">
              당신의 뜻깊은 하루를 기록해보세요
            </p>

            {/*
            <div className="w-28 h-28 mt-10 rounded-full flex items-center justify-center bg-[#ffd6b3]">
              <div className="w-16 h-16 bg-[#ff8c66] rounded-full flex items-center justify-center text-2xl">
                ❤️
              </div>
            </div>
            */}
          </div>

          {/* 오른쪽 영역 */}
          <form
            onSubmit={handleRegister}
            className="flex flex-col justify-center items-center w-1/2 bg-gradient-to-b from-[#fff8e5] to-[#fff0c7] px-12 border-[4px] border-orange-200 rounded-lg shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b border-orange-200 pb-2 w-full text-center">
              Welcome !
              <br />
              <span className="text-lg font-medium text-gray-600">
                Create Your mooDiary
              </span>
            </h2>

            <div className="w-full space-y-4">
              {/* 사용자명 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">사용자명</label>
                <input
                  type="text"
                  placeholder="사용자명을 입력하세요."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70"
                />
              </div>

              {/* 닉네임 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">닉네임</label>
                <input
                  type="text"
                  placeholder="닉네임을 입력하세요."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
                <input
                  type="email"
                  placeholder="예: example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70"
                />
                <p className="text-xs text-red-500 mt-1">
                  (소셜 로그인 시 자동 입력)
                </p>
              </div>

              {/* 전화번호 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">전화번호</label>
                <input
                  type="text"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70"
                  />
                  <span
                    className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img src={eyeIcon} alt="eye" className="w-5 h-5" />
                  </span>
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 한 번 입력하세요."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-gray-800 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70"
                  />
                  <span
                    className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <img src={eyeIcon} alt="eye" className="w-5 h-5" />
                  </span>
                </div>
                {password !== confirmPassword && confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 text-center mt-3">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full bg-orange-300 text-white font-semibold py-2.5 rounded-md shadow-sm transition hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "회원가입 중..." : "mooDiary 계정 생성"}
            </button>

            <p className="mt-5 text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <span
                className="text-orange-500 hover:underline cursor-pointer"
                onClick={() => (window.location.href = "/login")}
              >
                로그인
              </span>
            </p>
          </form>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-[#FAD7A1] to-[#F7A54A] text-center text-[#b86b3b] text-sm py-4 shadow-inner">
        2025년, mooDiary 와 함께 매일매일을 특별한 일상으로 꾸며보세요.
      </footer>
    </>
  );
};

export default Register;