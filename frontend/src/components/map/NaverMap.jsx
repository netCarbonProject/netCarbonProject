import React, { useEffect, useRef, useState } from "react";
import slide_btn from "../../assets/SimulationPage/slide_btn.png";
import close_btn from "../../assets/SimulationPage/close_btn.png";
import slide_btn_mobile from "../../assets/SimulationPage/slide_btn_mobile.png";
import open_btn_mobile from "../../assets/SimulationPage/slide_btn_mobile_open.png";

import korea from "../location/TL_SCCO_CTPRVN.json";
import "../common/css/Legend.css";

import "../common/css/NaverMap_CSS.css";

const sunlightMap = {
  서울특별시: 2.47,
  강원도: 2.86,
  경기도: 2.47,
  충청북도: 2.81,
  충청남도: 2.47,
  대전광역시: 3.09,
  세종특별자치시: 2.81,
  전라북도: 2.61,
  전라남도: 2.05,
  광주광역시: 2.86,
  대구광역시: 2.35,
  경상북도: 3.19,
  경상남도: 2.99,
  부산광역시: 3.14,
  울산광역시: 3.19,
  제주특별자치도: 2.31,
  인천광역시: 2.47,
};

const getColorByValue = (val) => {
  if (val >= 3.2) return "rgb(95, 0, 0)";
  if (val >= 3.0) return "rgb(154, 0, 0)";
  if (val >= 2.8) return "rgb(197, 0, 0)";
  if (val >= 2.6) return "rgb(255, 25, 0)";
  if (val >= 2.4) return "rgb(255, 68, 0)";
  return "rgba(255, 100, 0, 1)";
};

const NaverMap = ({ centerLat, centerLon, setCenterLat, setCenterLon, showSolarOverlay }) => {
  // 지도 생성
  const mapRef = useRef(null);

  // 마커 생성
  const markerRef = useRef(null);
  const markersRef = useRef([]);

  // 지도 로드
  const [loaded, setLoaded] = useState(false);

  // 검색 기능
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  // 왼쪽 검색 패널
  const [showAddressSlide, setShowAddressSlide] = useState(false);
  const handleSlideToggle = () => setShowAddressSlide(!showAddressSlide);

  // 모바일 버전
  const [isMobile, setIsMobile] = useState(false); // 상태 정의

  // 모바일 추가
  const [isMapReady, setIsMapReady] = useState(false);

  // 일사량 필터 설정
  const geoJsonLayerRef = useRef([]);
  const geoJsonRef = useRef(korea);
  const prevViewRef = useRef(null);
  // const labelOverlaysRef = useRef([]); // ✅ 라벨 오버레이 저장용

  // 모바일 버전 확인
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 420);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 📌 지도 API 스크립트 + 초기 위치 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/mapinfo")
      .then((res) => res.json())
      .then(({ lat, lon, zoom, apiUrl }) => {
        const script = document.createElement("script");
        script.src = apiUrl;
        script.async = true;
        script.onload = () => {
          setLoaded(true);
          mapRef.current = { lat, lon, zoom };
        };
        document.head.appendChild(script);
        setCenterLat(lat.toFixed(6));
        setCenterLon(lon.toFixed(6));
      });
  }, [setCenterLat, setCenterLon]);

  // 📌 지도 생성 + 마커 설정
  useEffect(() => {
    if (loaded && window.naver && window.naver.maps) {
      const { lat, lon, zoom } = mapRef.current;
      const map = new window.naver.maps.Map("naver-map", {
        center: new window.naver.maps.LatLng(lat, lon),
        zoom,
        mapTypeId: window.naver.maps.MapTypeId.SATELLITE,
      });

      mapRef.current.map = map;
      // 모바일 추가
      setIsMapReady(true); 

      // 추
      window.naverMap = map;

      const center = map.getCenter();
      setCenterLat(center.lat().toFixed(6));
      setCenterLon(center.lng().toFixed(6));

      const centerMarker = new window.naver.maps.Marker({
        position: center,
        map,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          size: new window.naver.maps.Size(24, 32),
          origin: new window.naver.maps.Point(0, 0),
          anchor: new window.naver.maps.Point(12, 32),
        },
      });
      markerRef.current = centerMarker;

      window.naver.maps.Event.addListener(map, "center_changed", () => {
        const newCenter = map.getCenter();
        setCenterLat(newCenter.lat().toFixed(6));
        setCenterLon(newCenter.lng().toFixed(6));
        markerRef.current.setPosition(newCenter);
      });

      // 추
      map.data.setStyle((feature) => {
        const region = feature.getProperty("CTP_KOR_NM");
        console.log(feature);
        const value = sunlightMap[region];
        const baseStyle = {
          fillColor: getColorByValue(value),
          fillOpacity: 0.35, // ✔ 더 투명하게
          strokeColor: "rgba(0,0,0,0)", // ✔ 경계 없애기
          strokeOpacity: 0,
          strokeWeight: 0,
        };

        if (feature.getProperty("focus")) {
          return {
            ...baseStyle,
            fillOpacity: 0.8,
            strokeColor: "#0f0",
            strokeWeight: 4,
            strokeOpacity: 1,
          };
        }
        return baseStyle;
      });
      map.data.addListener("click", (e) => {
        const feature = e.feature;
        console.log(feature);
        feature.setProperty("focus", !feature.getProperty("focus"));
      });
      map.data.addListener("mouseover", (e) => {
        map.data.overrideStyle(e.feature, {
          fillOpacity: 0.3,
          strokeWeight: 1,
          strokeOpacity: 1,
        });
      });
      map.data.addListener("mouseout", () => {
        map.data.revertStyle();
      });
    }
  }, [loaded, setCenterLat, setCenterLon]);

  // ✅ 필터 on/off 토글
  useEffect(() => {
    if (!window.naverMap || !geoJsonRef.current) return;
    const map = window.naverMap;
    const dataLayer = map.data;

    if (showSolarOverlay) {
      prevViewRef.current = {
        center: map.getCenter(),
        zoom: map.getZoom(),
      };

      const newFeatures = dataLayer.addGeoJson(geoJsonRef.current);
      geoJsonLayerRef.current = newFeatures;

      setTimeout(() => {
        map.setCenter(prevViewRef.current.center);
        map.setZoom(prevViewRef.current.zoom);
      }, 0);
    } else {
      if (geoJsonLayerRef.current.length > 0) {
        geoJsonLayerRef.current.forEach((feature) =>
          dataLayer.removeFeature(feature)
        );
        geoJsonLayerRef.current = [];
      }
      if (prevViewRef.current) {
        map.setCenter(prevViewRef.current.center);
        map.setZoom(prevViewRef.current.zoom);
      }
    }
  }, [showSolarOverlay]);

  const updateRecentSearches = (query) => {
    setRecentSearches((prev) => {
      const next = [query, ...prev.filter((q) => q !== query)];
      return next.slice(0, 5);
    });
  };

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  // 📌 장소 검색 (Kakao)
  const handleSearch = () => {
    fetch(
      `http://localhost:8080/api/kakao/search-location?query=${encodeURIComponent(
        searchQuery
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        const map = mapRef.current.map;
        if (data.documents?.length > 0) {
          setSearchResults(data.documents);
          clearMarkers();

          data.documents.forEach((place) => {
            const position = new window.naver.maps.LatLng(place.y, place.x);
            const marker = new window.naver.maps.Marker({
              position,
              map,
              title: place.place_name,
            });

            // ✅ InfoWindow 추가
            const infoWindow = new window.naver.maps.InfoWindow({
              content: `<div style="padding:8px;font-size:14px;">${place.place_name}</div>`,
            });

            // 📍 마커 클릭 시 지도 중심 이동 + 줌 설정
            window.naver.maps.Event.addListener(marker, "click", () => {
              // 추가
              infoWindow.open(map, marker);
              map.setCenter(position);
              map.setZoom(17);
            });

            markersRef.current.push(marker);
          });

          const first = data.documents[0];
          map.setCenter(new window.naver.maps.LatLng(first.y, first.x));
          map.setZoom(16);
        } else {
          alert("검색 결과 없음");
          setSearchResults([]);
          clearMarkers();
        }

        updateRecentSearches(searchQuery);
        setSearchQuery(""); // 검색 후 입력창 비우기
      });
  };

  // 📌 장소 or 좌표 통합 검색
  const handleCombinedSearch = () => {
    const map = mapRef.current.map;
    // 추가
    if (!map) {
      console.warn("Map is not initialized yet.");
      return;
    }

    const lat = parseFloat(centerLat);
    const lon = parseFloat(centerLon);

    if (searchQuery.trim()) {
      handleSearch();
      return;
    }

    if (!isNaN(lat) && !isNaN(lon)) {
      const pos = new window.naver.maps.LatLng(lat, lon);
      map.setCenter(pos);
      map.setZoom(16);
      markerRef.current.setPosition(pos);
    } else {
      alert("장소 또는 좌표를 입력하세요.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCombinedSearch();
  };

  const handleSelectLocation = (place) => {
    // 모바일 체크 추가
    if (!isMapReady || !mapRef.current?.map) {
      console.warn("🛑 Map is not ready yet!");
      return;
    }

    const map = mapRef.current.map;

    const pos = new window.naver.maps.LatLng(place.y, place.x);
    map.setCenter(pos);
    map.setZoom(17);
  };

  return (
    <>
      {/* 지도 출력 */}
      <div id="naver-map" style={{ width: "100%", height: "100%" }} />

      {/* 검색 슬라이드 버튼 */}
      <div className="address-slide-button">
        <button className="slide-button" onClick={handleSlideToggle}>
          <img
            src={isMobile ? open_btn_mobile : slide_btn}
            alt="상세주소 버튼"
          />
        </button>
      </div>

      {/* 모바일 버전 검색창 수정 */}
      {isMobile && (
        <div className="address_mobile">
          <input
            type="text"
            className="address-input"
            // 여기부터
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            placeholder="장소를 입력하세요"
          />
          {/* 여기도 추가 */}
          <button
            className="address-search-button-mobile"
            onClick={() => {
              handleCombinedSearch();       // 검색 실행
              setShowAddressSlide(true);   // 슬라이드 열기
            }}
          >
            검색
          </button>

          {/* 추가 */}
          {showRecent && recentSearches.length > 0 && (
            <ul className="recent-search-list">
              {recentSearches.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 검색 슬라이드 출력 */}
      {showAddressSlide && (
        <div className={`address-slide ${showAddressSlide ? "open" : ""}`}>
          <div className="address-section">
            {!isMobile && (
              <div className="address-content">
                <h3>EnerGizer</h3>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="address-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowRecent(true)}
                    onBlur={() => setTimeout(() => setShowRecent(false), 200)}
                    placeholder="장소를 입력하세요"
                  />

                  {/* 모바일 전용 추가 */}
                  {isMobile && showAddressSlide && searchResults.length > 0 && isMapReady && (
                    <ul className="search-result-list">
                      {searchResults.map((place, idx) => (
                        <li key={idx} onClick={() => handleSelectLocation(place)}>
                          {place.place_name}
                          <br />
                          <small>{place.road_address_name || place.address_name}</small>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    className="address-search-button"
                    onClick={handleCombinedSearch}
                  >
                    검색
                  </button>

                  {/* 위치 수정 */}
                  {showRecent && recentSearches.length > 0 && (
                    <ul className="recent-search-list">
                      {recentSearches.map((item, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setSearchQuery(item);
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            )}

            <div className="coordinates-section">
              <div className="coordinate-input-wrapper">
                <div className="coordinate-input">
                  <label htmlFor="latitude">위도</label>
                  <input
                    id="latitude"
                    type="text"
                    value={centerLat}
                    onChange={(e) => setCenterLat(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="coordinate-input">
                  <label htmlFor="longitude">경도</label>
                  <input
                    id="longitude"
                    type="text"
                    value={centerLon}
                    onChange={(e) => setCenterLon(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            <div className="location-section">
              <div className="location-box">
                <div className="location-title">장소</div>
              </div>
            </div>
            {searchResults.length > 0 && (
              <ul className="search-result-list">
                {searchResults.map((place, idx) => (
                  <li key={idx} onClick={() => handleSelectLocation(place)}>
                    {place.place_name}
                    <br />
                    <small>
                      {place.road_address_name || place.address_name}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="close-slide" onClick={handleSlideToggle}>
            <img
              src={isMobile ? slide_btn_mobile : close_btn}
              alt="닫기 버튼"
            />
          </button>
        </div>
      )}
      {/* ✅ 지역별 일사량 값 표시 */}
      {showSolarOverlay && (
        <div className="sunlight-values">
          {Object.entries(sunlightMap).map(([name, value]) => (
            <div key={name}>
              {name} : {value}
            </div>
          ))}
        </div>
      )}

      {/* ✅ 범례 표시 */}
      {showSolarOverlay && (
        <div className="legend-box">
          <div className="legend-title">일조량 색상 범례</div>
          <div className="legend-item">
            <span style={{ background: "rgb(95, 0, 0)" }}></span> ≥ 3.2
          </div>
          <div className="legend-item">
            <span style={{ background: "rgb(154, 0, 0)" }}></span> 3.0 - 3.19
          </div>
          <div className="legend-item">
            <span style={{ background: "rgb(197, 0, 0)" }}></span> 2.8 - 2.99
          </div>
          <div className="legend-item">
            <span style={{ background: "rgb(255, 25, 0)" }}></span> 2.6 - 2.79
          </div>
          <div className="legend-item">
            <span style={{ background: "rgb(255, 68, 0)" }}></span> 2.4 - 2.59
          </div>
          <div className="legend-item">
            <span style={{ background: "rgba(255, 100, 0, 1)" }}></span> &lt;
            2.4
          </div>
        </div>
      )}
    </>
  );
};

export default NaverMap;
