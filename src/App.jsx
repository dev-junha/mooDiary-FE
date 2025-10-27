// src/App.jsx
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'

function App() {
  return (
    // style.css의 body 스타일 적용
    // min-h-screen: 100vh, bg-gradient-to-b: linear-gradient(180deg)
    // from-light-bg-start/to-light-bg-end: config에 등록한 커스텀 색상
    <div className="min-h-screen bg-gradient-to-b from-light-bg-start to-light-bg-end flex flex-col font-default">
      <Header />
      
      {/* style.css의 .content 스타일 적용 */}
      {/* flex-grow: 남은 공간 차지, max-w-7xl: 1280px (1440px와 근사) */}
      {/* mx-auto: 중앙 정렬, px-[162px]: 임의 패딩값 */}
      <main className="content flex-grow w-full max-w-7xl mx-auto px-5 md:px-20 lg:px-[162px] py-5 flex flex-col gap-10">
        <HomePage />
      </main>
      
      <Footer />
    </div>
  )
}

export default App