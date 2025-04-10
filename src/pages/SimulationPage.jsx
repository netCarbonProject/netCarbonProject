import React, { useState } from 'react';
import '../components/common/css/Simulation_CSS.css';
import solarpanel1 from '../assets/SimulationPage/solarpanel1.png';
import solarpanel2 from '../assets/SimulationPage/solarpanel2.png';
import simulation_button from '../assets/SimulationPage/simulation_button.png';
import sunlight_btn from '../assets/SimulationPage/sunlight_btn.png';
import slide_btn from '../assets/SimulationPage/slide_btn.png';
import { useNavigate } from 'react-router-dom'; // 페이지 이동 함수

const SimulationPage = () => {
    const [showPanel, setShowPanel] = useState(false);
    const [showAddressSlide, setShowAddressSlide] = useState(false); // 슬라이드 상태
    const handleOpenPanel = () => setShowPanel(true);
    const handleClosePanel = () => setShowPanel(false);
    const navigate = useNavigate(); 
    const handleSlideToggle = () => setShowAddressSlide(!showAddressSlide); // 슬라이드 토글 함수

    return (
        <div className="simulation-container">
            <div className="simulation-body">
                <div className="simulation-map-area fullscreen-map">
                    <div className="simulation-map-wrapper">
                        <canvas id="simulation-canvas" className="simulation-canvas">
                            현재 브라우저는 캔버스를 지원하지 않습니다.
                        </canvas>
                        <div className="panel-button-topright">
                            <button className="open-panel-button" onClick={handleOpenPanel}>
                                <img src={simulation_button} alt="패널 보기 버튼" />
                            </button>
                        </div>

                        {showPanel && (
                            <div className="popup-panel">
                                <div className="popup-panel-content">
                                    <div 
                                        className="close-button-area" 
                                        onClick={handleClosePanel} 
                                        style={{cursor: 'pointer'}}
                                    >
                                    </div>
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
                                        <button className="complete-button" onClick={() => navigate('/result')}>배치 완료</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 일조량 필터 버튼 (오른쪽 아래) */}
                        <div className="sunlight-filter-button">
                            <button className="filter-button">
                                <img src={sunlight_btn} alt='일조량 버튼'/>
                            </button>
                        </div>

                        {/* 상세 주소 확인 버튼 (왼쪽 중앙, 슬라이드 형식) */}
                        <div className="address-slide-button">
                            <button className="slide-button" onClick={handleSlideToggle}>
                                <img src={slide_btn} alt="상세주소 버튼" />
                            </button>
                        </div>

                        {/* 슬라이드 창 */}
                        {showAddressSlide && (
                            <div className="address-slide open">
                                <div className="address-section">
                                    <div className="address-content">
                                        <h3>EnerGizer</h3>
                                        <input 
                                            type="text" 
                                            className="address-input" 
                                            placeholder="상세주소를 입력하세요" 
                                        />
                                    </div>
                                    <div className="coordinates-section">
                                        <div className='coordinates-title'>위도, 경도로 검색하기</div>
                                        <div className="coordinate-input">
                                            <label htmlFor="latitude">위도</label>
                                            <input type="text" id="latitude" placeholder="위도 입력" />
                                        </div>
                                        <div className="coordinate-input">
                                            <label htmlFor="longitude">경도</label>
                                            <input type="text" id="longitude" placeholder="경도 입력" />
                                        </div>
                                    </div>
                                    <div className="location-section">
                                        <div className="location-box">
                                            <div className='location-title'>장소</div>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                                <button className="close-slide" onClick={handleSlideToggle}>
                                    <img src={slide_btn} alt='닫기 버튼'/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationPage;
