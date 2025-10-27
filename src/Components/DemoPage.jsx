import React from 'react';

// 이 컴포넌트는 tailwind.config.js에 정의된
// 커스텀 클래스들 (예: bg-light-bg-start, font-alt, text-primary 등)을
// 사용합니다.

export default function DemoPage() {
  return (
    // 배경: light-bg-start에서 light-bg-end로 그라데이션
    // 폰트: 기본 폰트로 font-default (Inter) 적용
    <div className="min-h-screen bg-gradient-to-br from-light-bg-start to-light-bg-end p-8 font-default text-text-secondary">
      
      {/* 네비게이션 바 예시 */}
      {/* 배경: brand-brown, 텍스트: text-light */}
      <nav className="bg-brand-brown text-text-light p-4 rounded-lg shadow-lg mb-8">
        <div className="container mx-auto flex justify-between items-center">
          {/* 로고: 폰트 font-alt (Poppins) 적용 */}
          <div className="text-2xl font-alt font-semibold">MyWebApp</div>
          <div className="space-x-6 font-medium">
            <a href="#" className="hover:text-nav-active-orange transition-colors">
              Home
            </a>
            {/* 활성 링크: nav-active-orange */}
            <a href="#" className="text-nav-active-orange font-bold">
              Features
            </a>
            <a href="#" className="hover:text-nav-active-orange transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-nav-active-orange transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 카드 */}
      {/* 그림자: shadow-md-custom 적용 */}
      <main className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md-custom">
        
        {/* 제목: font-alt, text-primary */}
        <h1 className="text-4xl font-alt font-semibold text-text-primary mb-4">
          커스텀 테마 데모 페이지
        </h1>

        {/* 본문: text-secondary */}
        <p className="text-lg text-text-secondary mb-6">
          이 페이지는 <code>tailwind.config.js</code>에 정의된 커스텀 스타일을
          시연합니다. 기본 폰트는 'Inter'로, 제목에는 'Poppins' 폰트가
          적용되었습니다.
        </p>

        {/* 부제목: font-alt, text-accent */}
        <h2 className="text-2xl font-alt font-semibold text-text-accent mt-8 mb-4">
          주요 컴포넌트 스타일
        </h2>

        {/* 버튼 */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* 기본 버튼: button-primary-bg, hover:button-primary-hover */}
          <button className="px-6 py-2 rounded-lg font-semibold text-text-light bg-button-primary-bg hover:bg-button-primary-hover transition-colors">
            Primary Button
          </button>
          
          {/* 보조 버튼: button-secondary-bg, hover:button-secondary-hover */}
          <button className="px-6 py-2 rounded-lg font-semibold text-text-dark bg-button-secondary-bg hover:bg-button-secondary-hover border border-border-neutral transition-colors">
            Secondary Button
          </button>
        </div>

        {/* 입력창 폼 */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
              이메일
            </label>
            {/* 입력창: border-color, placeholder-text-placeholder */}
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border-2 border-border-color rounded-lg placeholder-text-placeholder focus:outline-none focus:ring-2 focus:ring-border-color"
            />
          </div>
          
          {/* 보조 텍스트: text-muted */}
          <p className="text-sm text-text-muted">
            이것은 보조 설명을 위한 'muted' 텍스트 스타일입니다.
          </p>
        </div>
      </main>
    </div>
  );
}