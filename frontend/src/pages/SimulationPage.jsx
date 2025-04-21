import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import "../components/common/css/Simulation_CSS.css";
import solarpanel1 from "../assets/SimulationPage/solarpanel1.png";
import solarpanel2 from "../assets/SimulationPage/solarpanel2.png";
import simulation_button from "../assets/SimulationPage/simulation_button.png";
import sunlight_btn from "../assets/SimulationPage/sunlight_btn.png";
import slide_btn from "../assets/SimulationPage/slide_btn.png";
import close_btn from "../assets/SimulationPage/close_btn.png";
// import simulation_close from "../assets/SimulationPage/simulation_btn2.png";
import { useNavigate } from "react-router-dom";
import NaverMap from "../components/map/NaverMap";

const SimulationPage = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [showAddressSlide, setShowAddressSlide] = useState(false);
  const [aiDetections, setAiDetections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    window.onMapChanged = () => {
      setAiDetections([]);
    };
  });

  const handleOpenPanel = () => setShowPanel(true);
  const handleClosePanel = () => setShowPanel(false);
  const handleSlideToggle = () => setShowAddressSlide(!showAddressSlide);

  const handleAIInference = async () => {
    const mapElement = document.querySelector(".simulation-canvas");
    const mapHeight = mapElement.offsetHeight;
    if (!mapElement) return alert("지도를 찾을 수 없습니다.");

    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      width: mapElement.offsetWidth,
      height: mapElement.offsetHeight,
    });

    // 캡처된 canvas 크기
    const fullWidth = canvas.width;
    const fullHeight = canvas.height;

    // 중앙 80% 영역 좌표 계산
    const cropX = fullWidth * 0.1;
    const cropWidth = fullWidth * 0.8;
    const cropHeight = fullHeight;

    // 자른 canvas 생성
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const ctx = croppedCanvas.getContext("2d");
    ctx.drawImage(
      canvas,
      cropX,
      0,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Blob 변환 후 전송
    croppedCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "cropped_map.png");

      try {
        const response = await fetch("http://localhost:8080/api/predict", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setAiDetections(result.detections);
      } catch (error) {
        console.error("AI 요청 실패:", error);
      }
    }, "image/png");
  };

  return (
    <div className="simulation-container">
      <div className="simulation-body">
        <div className="simulation-map-area fullscreen-map">
          <div className="simulation-map-wrapper">
            <div
              className="simulation-canvas"
              id="simulation-canvas"
              style={{ position: "relative" }}
            >
              <NaverMap />
              {/* 중앙 캡처 영역 시각화 박스 */}
              <div
                id="capture-area-box"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  width: "80%",
                  height: "100%",
                  border: "2px dashed red",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  pointerEvents: "none",
                  zIndex: 998,
                }}
              ></div>

              <svg
                id="ai-mask-svg"
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                  zIndex: 999,
                }}
              >
                {aiDetections.map((det, idx) => {
                  const offsetX = window.innerWidth * 0.1; // 왼쪽 잘린 10% 만큼 보정

                  return (
                    <g key={idx}>
                      <rect
                        x={det.box[0] + offsetX}
                        y={det.box[1]}
                        width={det.box[2] - det.box[0]}
                        height={det.box[3] - det.box[1]}
                        stroke="red"
                        strokeWidth="2"
                        fill="none"
                      />
                      {det.mask && det.mask.length > 2 && (
                        <polygon
                          points={det.mask
                            .map(([y, x]) => `${x + offsetX},${y}`)
                            .join(" ")}
                          fill="rgba(198, 245, 180, 0.03)"
                          stroke="rgba(100,200,100,0.4)"
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="panel-button-topright">
              <button className="open-panel-button" onClick={handleOpenPanel}>
                <img src={simulation_button} alt="패널 보기 버튼" />
              </button>
            </div>

            {showPanel && (
              <div className="popup-panel">
                <div className="popup-panel-content">
                  <div className="close-btn-layout">
                    <h2>패널 설정</h2>
                    <div className="close-button-area" onClick={handleClosePanel}>
                      <img src={simulation_button} alt="설치 패널 닫기" />
                    </div>  
                  </div>
                  {/* <h2>설치 패널 상세</h2> */}
                  <div className="panel-content-row">
                    <div className="panel-image-selection">
                      <div className="panel-image-box">
                        <img
                          src={solarpanel1}
                          alt="패널1"
                          className="panel-image panel-small"
                        />
                        <div className="panel-size">165cm x 99cm</div>
                      </div>
                      <div className="panel-image-box">
                        <img
                          src={solarpanel2}
                          alt="패널2"
                          className="panel-image panel-large"
                        />
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
                        <label className="panel-label">
                          예상 에너지 생산량
                        </label>
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
                      <span className="chart-placeholder-text">
                        AI 추천 vs 사용자 발전량 차트 공간
                      </span>
                    </div>
                    <div className="chart-box">
                      <span className="chart-placeholder-text">
                        설치 일치율 차트 공간
                      </span>
                    </div>
                  </div>

                  <div className="complete-button-wrapper">
                    <button
                      className="ai-input-button"
                      onClick={handleAIInference}
                    >
                      AI 자동 배치
                    </button>
                    <button
                      className="clear-ai-button"
                      onClick={() => setAiDetections([])}
                    >
                      AI 배치 취소
                    </button>
                    <button
                      className="complete-button"
                      onClick={() => navigate("/result")}
                    >
                      배치 완료
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="sunlight-filter-button">
              <button className="filter-button">
                <img src={sunlight_btn} alt="일조량 버튼" />
              </button>
            </div>

            <div className="address-slide-button">
              <button className="slide-button" onClick={handleSlideToggle}>
                <img src={slide_btn} alt="상세주소 버튼" />
              </button>
            </div>

            {showAddressSlide && (
              <div
                className={`address-slide ${showAddressSlide ? "open" : ""}`}
              >
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
                    <div className="coordinates-title">
                      위도, 경도로 검색하기
                    </div>
                    <div className="coordinate-input">
                      <label htmlFor="latitude">위도</label>
                      <input
                        type="text"
                        id="latitude"
                        placeholder="위도 입력"
                      />
                    </div>
                    <div className="coordinate-input">
                      <label htmlFor="longitude">경도</label>
                      <input
                        type="text"
                        id="longitude"
                        placeholder="경도 입력"
                      />
                    </div>
                  </div>
                  <div className="location-section">
                    <div className="location-box">
                      <div className="location-title">장소</div>
                    </div>
                  </div>
                </div>
                <button className="close-slide" onClick={handleSlideToggle}>
                  <img src={close_btn} alt="닫기 버튼" />
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
