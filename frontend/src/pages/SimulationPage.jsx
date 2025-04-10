import React, { useState } from 'react';
import '../components/common/css/Simulation_CSS.css';
import solarpanel1 from '../assets/solarpanel1.png';
import solarpanel2 from '../assets/solarpanel2.png';
import simulation_button from '../assets/simulation_button.png';
import VWorldMap from '../components/map/VWorldMap';

const SimulationPage = () => {
  const [showPanel, setShowPanel] = useState(false);

  const handleOpenPanel = () => setShowPanel(true);
  const handleClosePanel = () => setShowPanel(false);

  return (
    <div className="simulation-container">

      <div className="simulation-body">
        <div className="simulation-map-area fullscreen-map">
          <div className="simulation-map-wrapper">
            <div className="simulation-canvas">
              {/* <NaverMap /> */}
              <VWorldMap />
            </div>

            <div className="panel-button-topright">
              <button className="open-panel-button" onClick={handleOpenPanel}>
                <img src={simulation_button} alt="패널 보기 버튼" />
              </button>
            </div>

            {showPanel && (
              <div className="popup-panel">
                <div className="popup-panel-content">
                  <span className="close-button" onClick={handleClosePanel}>×</span>
                  <h2>설치 패널 상세</h2>

                  <div className="panel-content-row">
                    <div className="panel-image-selection">
                      <div className="panel-image-box">
                        <img src={solarpanel1} alt="패널1" className="panel-image panel-small" />
                        <div className="panel-size">165cm x 99cm</div>
                      </div>
                      <div className="panel-image-box">
                        <img src={solarpanel2} alt="패널2" className="panel-image panel-large" />
                        <div className="panel-size">198cm x 99cm</div>
                      </div>
                    </div>

                    <div className="panel-form-section">
                      <div className="panel-info">
                        <label className="panel-label">설치 개수</label>
                        <input 
                          type="number" 
                          placeholder="설치 개수" 
                          className="panel-input" 
                        />
                      </div>

                      <div className="panel-info">
                        <label className="panel-label">설치 면적</label>
                        <input 
                          type="text" 
                          placeholder="자동 계산" 
                          className="panel-result-input" 
                          readOnly 
                        />
                      </div>

                      <div className="panel-info">
                        <label className="panel-label">예상 에너지 생산량</label>
                        <input 
                          type="text" 
                          placeholder="자동 계산" 
                          className="panel-result-input" 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="panel-divider" />

                  <div className="chart-wrapper">
                    <div className="chart-box">
                      <span className="chart-placeholder-text">AI 추천 vs 사용자 발전량 차트 공간</span>
                    </div>
                    <div className="chart-box">
                      <span className="chart-placeholder-text">설치 일치율 차트 공간</span>
                    </div>
                  </div>

                  <div className="complete-button-wrapper">
                    <button className="complete-button">배치 완료</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
