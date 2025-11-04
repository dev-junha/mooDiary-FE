// src/components/Header.jsx
import React from 'react';

function Header() {
  return (
    // style.css의 .header 스타일
    <header className="flex items-center justify-between h-[105px] pt-[55px] px-11 md:px-22 box-border">
      <div className="flex items-center gap-[11px]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.667 5.33398H5.33366C4.62641 5.33398 3.94814 5.61494 3.44804 6.11503C2.94794 6.61513 2.66699 7.29341 2.66699 8.00065V26.6673C2.66699 27.3746 2.94794 28.0528 3.44804 28.5529C3.94814 29.053 4.62641 29.334 5.33366 29.334H24.0003C24.7076 29.334 25.3858 29.053 25.8859 28.5529C26.386 28.0528 26.667 27.3746 26.667 26.6673V17.334" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M24.667 3.33429C25.1974 2.80385 25.9168 2.50586 26.667 2.50586C27.4171 2.50586 28.1366 2.80385 28.667 3.33429C29.1974 3.86472 29.4954 4.58414 29.4954 5.33429C29.4954 6.08443 29.1974 6.80385 28.667 7.33429L16.0003 20.001L10.667 21.3343L12.0003 16.001L24.667 3.33429Z" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[32px] font-medium text-brand-brown tracking-[0.2px]">mooDiary</span>
      </div>

      <nav className="hidden lg:flex gap-[28px] items-center">
        <a href="#" className="text-base font-bold text-text-secondary text-center tracking-[0.2px] px-2.5 py-1.5 whitespace-nowrap border-b-2 border-text-secondary">Home</a>
        <a href="#" className="text-base font-medium text-nav-active-orange text-center tracking-[0.2px] px-2.5 py-1.5 whitespace-nowrap border-b-2 border-transparent hover:font-bold hover:text-text-secondary hover:border-text-secondary">Write / Edit</a>
        <a href="#" className="text-base font-medium text-nav-active-orange text-center tracking-[0.2px] px-2.5 py-1.5 whitespace-nowrap border-b-2 border-transparent hover:font-bold hover:text-text-secondary hover:border-text-secondary">Results</a>
        <a href="#" className="text-base font-medium text-nav-active-orange text-center tracking-[0.2px] px-2.5 py-1.5 whitespace-nowrap border-b-2 border-transparent hover:font-bold hover:text-text-secondary hover:border-text-secondary">Bookmark</a>
        <a href="#" className="text-base font-medium text-nav-active-orange text-center tracking-[0.2px] px-2.5 py-1.5 whitespace-nowrap border-b-2 border-transparent hover:font-bold hover:text-text-secondary hover:border-text-secondary">MyProfile</a>
        <a href="#" className="text-base font-medium text-nav-active-orange text-center tracking-[0.2px] px-2.5 py-1.5 whitespace-nowrap border-b-2 border-transparent hover:font-bold hover:text-text-secondary hover:border-text-secondary">Recommendation</a>
      </nav>

      <div className="flex items-center gap-[33px]">
        <img className="w-14 h-14 rounded-full object-cover" src="https://via.placeholder.com/56" alt="User Profile Picture" />
        <button className="bg-none border-none p-0 cursor-pointer" aria-label="Open menu">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 24H42" stroke="#965D38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 12H42" stroke="#965D38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 36H42" stroke="#965D38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;