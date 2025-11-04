import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Main from "@/pages/Main";
import NotFound from "@/pages/NotFound";
import WriteEdit from "@/pages/WriteEdit";
import Results from "@/pages/Results";
import Bookmark from "@/pages/Bookmark";
import Profile from "@/pages/Profile";
import RecBook from "@/pages/RecBook";
import MyPage from "@/pages/MyPage";
import RecMovie from "@/pages/RecMovie";
import RecMusic from "@/pages/RecMusic";
import RecPoem from "@/pages/RecPoem";
import RecPhrase from "@/pages/RecPhrase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/write" element={<WriteEdit />} />
            <Route path="/results" element={<Results />} />
            <Route path="/bookmark" element={<Bookmark />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/recommendation" element={<RecBook />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/records" element={<NotFound />} />
            <Route path="/movies" element={<RecMovie />} />
            <Route path="/music" element={<RecMusic />} />
            <Route path="/poem" element={<RecPoem />} />
            <Route path="/phrase" element={<RecPhrase />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App; 