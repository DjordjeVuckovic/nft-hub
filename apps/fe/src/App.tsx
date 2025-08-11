import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme/theme-provider.tsx"
import Navigation from '@/components/navigation/navigation.tsx'
import Home from '@/pages/home.tsx'
import Register from '@/pages/register.tsx'
import Mint from '@/pages/mint.tsx'
import Gallery from '@/pages/gallery.tsx'

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
