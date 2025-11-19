import { useState, useEffect } from "react";
import defaultImg from "../assets/defaultImg.png";
import { getUserProfile } from "../lib/apiClient";

interface UseProfileDataReturn {
  profileImage: string;
  nickName: string;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useProfileData = (): UseProfileDataReturn => {
  const [profileImage, setProfileImage] = useState(defaultImg);
  const [nickName, setNickname] = useState("사용자");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsAuthenticated(true);

        // 메인 페이지와 동일한 API 사용
        const data = await getUserProfile();
        
        setProfileImage(data.profileImage || defaultImg);
        setNickname(data.nickname || "사용자");
      } catch (err) {
        console.error("프로필 데이터 로드 실패:", err);
        setError("프로필 데이터를 불러올 수 없습니다.");
        setIsAuthenticated(false);
        // 기본값 유지
        setProfileImage(defaultImg);
        setNickname("사용자");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return { profileImage, nickName, loading, error, isAuthenticated };
};

