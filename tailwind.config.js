// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 기존 클래스 이름은 유지하고, 값만 새 색상표로 업데이트합니다.
        
        // 배경 그라데이션
        'light-bg-start': '#fffbf2', // (기존 #fffbf2)
        'light-bg-end': '#fff3d7',   // (기존 #fff3d7)
        'light-bg': '#FFF4D4',   // (기존 #fff3d7)

        // 텍스트 (이름이 일치하는 경우)
        'text-dark': '#212121', // (일치)
        'text-muted': '#D48F5F', // (일치)
        'text-placeholder': '#9C9A9A', // (기존 #a8a29e)
        'text-light': '#FFFFFF', // (일치)

        // 텍스트 (디자인 기반 매핑)
        'text-secondary': '#646161', // (기존 #bb8866)
        'text-accent': '#D48F5F', // (일치)
        'brand-brown': '#965D38', // (일치)
        'nav-active-orange': '#DCA67B', // (일치)

        // 테두리
        'border-color': '#DCA67B', // (기존 #d48f5f)
        'border-muted': '#666666', // (일치)
        'border-neutral': '#9C9A9A', // (일치)

        // 버튼
        'button-primary-bg': '#FF8637', // (기존 #ff8737)
        'button-primary-hover': '#FFB652', // (기존 #f97316)
        'button-secondary-bg': '#DCA67B', // (기존 rgba(247, 247, 247, 0.8))
        'button-secondary-hover': '#BB8866', // (기존 #e5e5e5)

        // 플레이스홀더 배경
        'image-placeholder-bg': '#fff4d4', // (기존 #fff4d4)
        'preview-placeholder-bg': '#eff3fd', // (기존 #eff3fd)

        // --- 토글 스위치 (중요) ---
        'toggle-bg': '#ffb752', // 'on' 상태 (기존 #ffb752)
        'toggle-inactive-bg': '#e5e7eb', // 'off' 상태 (기존값 #e5e7eb 유지 - **변경 안 함**)
      },
      fontFamily: {
        default: ["Inter", "sans-serif"],
        alt: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        // --shadow-md
        'md-custom': '0px 8px 12px -6px rgba(0, 0, 0, 0.16), 0px 12px 16px 0px rgba(0, 0, 0, 0.12), 0px 1px 32px 0px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}