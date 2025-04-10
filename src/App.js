// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
import SimulationPage from './pages/SimulationPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 주소 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/simulate" element={<SimulationPage />} /> 
        <Route path='/result' element={<ResultPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;