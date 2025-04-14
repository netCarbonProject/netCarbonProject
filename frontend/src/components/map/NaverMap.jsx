import React, { useEffect, useRef, useState } from "react";

const NaverMap = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Flask에서 apiUrl 받아서 스크립트 동적 삽입
    fetch("http://localhost:5000/mapinfo")
      .then(res => res.json())
      .then(({ lat, lon, zoom, apiUrl }) => {
        const script = document.createElement("script");
        script.src = apiUrl + "&submodules=geocoder";
        script.async = true;
        script.onload = () => {
          setLoaded(true);
          mapRef.current = { lat, lon, zoom };
        };
        document.head.appendChild(script);
      });
  }, []);

  useEffect(() => {
    // 2. 네이버 지도 초기화
    if (loaded && window.naver && window.naver.maps) {
      const { lat, lon, zoom } = mapRef.current;

      const map = new window.naver.maps.Map("naver-map", {
        center: new window.naver.maps.LatLng(lat, lon),
        zoom,
        mapTypeId: window.naver.maps.MapTypeId.SATELLITE,
      });

      mapRef.current.map = map;
    }
  }, [loaded]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // 3. 지오코더 요청 (지도 JS API 기반)
    window.naver.maps.Service.geocode(
      { query: searchQuery },
      (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          alert("검색 실패: " + status);
          return;
        }

        const result = response.v2.addresses?.[0];
        if (!result) {
          alert("검색 결과가 없습니다.");
          return;
        }

        const lat = parseFloat(result.y);
        const lon = parseFloat(result.x);
        const map = mapRef.current.map;

        if (!map) return;

        const position = new window.naver.maps.LatLng(lat, lon);

        // 기존 마커 제거
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        const marker = new window.naver.maps.Marker({
          position,
          map,
          title: searchQuery,
        });

        markerRef.current = marker;
        map.setCenter(position);
        map.setZoom(16);
      }
    );
  };

  return (
    <>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="장소를 입력하세요"
          style={{ padding: "8px", width: "200px" }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 12px", marginLeft: "4px" }}>
          검색
        </button>
      </div>

      <div id="naver-map" style={{ width: "100%", height: "85%" }} />
    </>
  );
};

export default NaverMap;
