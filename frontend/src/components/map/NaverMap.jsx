import React, { useEffect, useRef, useState } from "react";

import slide_btn from "../../assets/SimulationPage/slide_btn.png";
import close_btn from "../../assets/SimulationPage/close_btn.png";
import slide_btn_mobile from "../../assets/SimulationPage/slide_btn_mobile.png"
import open_btn_mobile from "../../assets/SimulationPage/slide_btn_mobile_open.png"
import shadow_btn from "../../assets/SimulationPage/shadow_btn.png"
import close_shadow_btn from "../../assets/SimulationPage/close_shadow_btnw.png"

import "../common/css/NaverMap_CSS.css";

const NaverMap = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]); // 여러 개의 마커 저장
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showShadowPopup, setShowShadowPopup] = useState(false);
  const toggleShadowPopup = () => setShowShadowPopup(prev => !prev);

  const [showAddressSlide, setShowAddressSlide] = useState(false);
  const handleSlideToggle = () => setShowAddressSlide(!showAddressSlide);

  const [isMobile, setIsMobile] = useState(false);  // 상태 정의

  const [selectedHour, setSelectedHour] = useState(16); // 초기값은 16시

  const handleClosePopup = () => {
    setShowShadowPopup(false);
  };

  const handleTimeChange = (e) => {
    setSelectedHour(Number(e.target.value));
  };

  useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 420);
      };
    
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);


  // 지도 초기 설정 받아오기
  useEffect(() => {
    fetch("http://localhost:8080/api/mapinfo")
      .then(res => res.json())
      .then(({ lat, lon, zoom, apiUrl }) => {
        const script = document.createElement("script");
        script.src = apiUrl;
        script.async = true;
        script.onload = () => {
          setLoaded(true);
          mapRef.current = { lat, lon, zoom };
        };
        document.head.appendChild(script);
      });
  }, []);
  

  // 네이버 지도 생성
  useEffect(() => {
    if (loaded && window.naver && window.naver.maps) {
      const { lat, lon, zoom } = mapRef.current;

      const map = new window.naver.maps.Map("naver-map", {
        center: new window.naver.maps.LatLng(lat, lon),
        zoom,
        mapTypeId: window.naver.maps.MapTypeId.SATELLITE,
      });

      mapRef.current.map = map;
      window.naver.maps.Event.addListener(map, "zoom_changed", () => {
        if (typeof window.onMapChanged === "function") {
          window.onMapChanged();
        }
      });

    }
  }, [loaded]);

  // 마커 모두 제거
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Kakao 장소 검색 API 호출
  const handleSearch = () => {
    fetch(`http://localhost:8080/api/kakao/search-location?query=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        if (data.documents && data.documents.length > 0) {
          setResults(data.documents);
          const map = mapRef.current.map;
          clearMarkers();

          data.documents.forEach(place => {
            const position = new window.naver.maps.LatLng(place.y, place.x);
            const marker = new window.naver.maps.Marker({
              position,
              map,
              title: place.place_name,
            });
            markersRef.current.push(marker);
          });

          // 첫 번째 결과 기준으로 지도 이동
          const first = data.documents[0];
          map.setCenter(new window.naver.maps.LatLng(first.y, first.x));
          map.setZoom(16);
        } else {
          alert("검색 결과가 없습니다.");
          setResults([]);
          clearMarkers();
        }
      });
  };

  // 리스트 항목 클릭 시 해당 위치로 이동
  const handleSelectLocation = (place) => {
    const map = mapRef.current.map;
    const position = new window.naver.maps.LatLng(place.y, place.x);
    map.setCenter(position);
    map.setZoom(17);
  };

  return (
    <>
      <div id="naver-map" style={{ width: "100%", height: "100%" }} />

      {/* 주소 창 */}
      <div className="address-slide-button">
        <button className="slide-button" onClick={handleSlideToggle}>
          <img src={isMobile ? open_btn_mobile : slide_btn} alt="상세주소 버튼" />
        </button>
      </div>

      {isMobile &&
        <div className="address_mobile">
          <input
            type="text"
            className="address-input"
            placeholder="상세주소를 입력하세요"
          />
          <button className="address-search-button-mobile">검색</button>
        </div>
      }
      
      {showAddressSlide && (
        <div
          className={`address-slide ${showAddressSlide ? "open" : ""}`}
        >
          <div className="address-section">
            {!isMobile && 
              <div className="address-content">
                  <h3>EnerGizer</h3>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="address-input"
                      placeholder="상세주소를 입력하세요"
                    />
                    <button className="address-search-button">검색</button>
                  </div>
                </div>
            }
            <div className="coordinates-section">
                <div className="coordinate-input-wrapper">
                  <div className="coordinate-input">
                    <label htmlFor="latitude">위도</label>
                    <input type="text" id="latitude" placeholder="위도 입력" />
                  </div>
                  <div className="coordinate-input">
                    <label htmlFor="longitude">경도</label>
                    <input type="text" id="longitude" placeholder="경도 입력" />
                  </div>
                </div>
              </div>
              <div className="location-section">
                <div className="location-box">
                  <div className="location-title">장소</div>
                </div>
              </div>
          </div>
          <button className="close-slide" onClick={handleSlideToggle}>
              <img src={isMobile ? slide_btn_mobile : close_btn} alt="닫기 버튼" />
          </button>
        </div>
      )}
      
      <div className="shadow-chk-btn">
        <button className="shadow-button" onClick={toggleShadowPopup}>
          <img src={shadow_btn} alt="그림자 버튼" />
        </button>
      </div>

      {showShadowPopup && (
         <div className="shadow-popup" onClick={(e) => e.stopPropagation()}>
          <div className="close-area" onClick={() => setShowShadowPopup(false)}>
            X
          </div>
          <div className="popup-header">
            그림자 분석
            {/* <button className="close-button" onClick={handleClosePopup}>×</button> */}
          </div>
          <div className="sunshine_days">
            <div className="analysis_date">
              분석 기준 일자
            </div>
            <div className="sunshine_hours">
              <div className="sunrise_date">일출시간 N/A</div>
              <div className="sunset_time">일몰 시간 N/A</div>
            </div>
            <div className="sunlight">
              <div className="total_sunlight">총 일조량 N/A</div>
              <div className="continuous_sunlight">연속 일조량(최대) N/A</div>
            </div>
          </div>
          <div className="popup-content">
            <label htmlFor="interval">분석시간간격</label>
            <select id="interval">
              <option value="15">15분</option>
              <option value="30">30분</option>
              <option value="60">60분</option>
            </select>

            <label htmlFor="time-slider">시간별 그림자</label>
            <div className="time-slider">
              <span className="time-display">
                {String(selectedHour).padStart(2, "0")}:00
              </span>
              <input
                type="range"
                id="time-slider"
                min="0"
                max="23"
                step="1"
                value={selectedHour}
                onChange={handleTimeChange}
              />
            </div>
            
            <div className="Time_zone_playback">
              <button className="time_play">플레이</button>
              <button className="stop_time">중지</button>
            </div>

            <div className="popup-buttons">
              <button className="select-button">지점선택</button>
              <button className="reset-button">초기화</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NaverMap;
