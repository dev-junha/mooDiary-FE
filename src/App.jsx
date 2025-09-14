import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
//-----------------------------------------------------
import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import DiaryNew from "./Pages/DiaryNew.jsx";
import DiaryEdit from "./Pages/DiaryEdit.jsx";

export default function App() {
  return (
    <div className="app-wrap">
      {/* <Header /> */}
      <header className="app-header">
        <Link to="/" className="brand">mooDiary</Link>
        <nav>
          <Link to="/diary/new" className="nav-btn">새 감정일기</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<div>홈</div>} />
          <Route path="/diary/new" element={<DiaryNew />} />
          <Route path="/diary/:id/edit" element={<DiaryEdit />} />
        </Routes>
      </main>

      {/* <Footer /> */}
      <Toaster position="top-center" />
    </div>
  );
}