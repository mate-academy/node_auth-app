import { Routes, Route, Navigate } from "react-router-dom"
import { Earth } from "./components/Earth"
import { Starfield } from "./components/Starfield"
import { RegisterPage } from "./pages/RegisterPage"
import { NotFoundPage } from "./pages/NotFoundPage"

export const App = () => {
 

  return (
   <div>
    <Starfield />
    <Earth />
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />}/>
      <Route path="/register" element={<RegisterPage />}/>
      <Route path="*" element={<NotFoundPage />}/>
    </Routes>
   </div>
  )
}
