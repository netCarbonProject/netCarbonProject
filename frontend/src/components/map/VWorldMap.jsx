import React, { useEffect, useState } from "react";

const VWorldMap = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapController, setMapController] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const vw = window.vw;
      if (vw?.MapController && vw?.ol3 && document.getElementById("vmap")) {
        clearInterval(interval);
        try {
          const mapOptions = {
            container: "vmap",
            mapMode: "2d-map",
            basemapType: vw.ol3.BasemapType.PHOTO,
            controlDensity: vw.ol3.DensityType.FULL,
            interactionDensity: vw.ol3.DensityType.FULL,
            controlsAutoArrange: true,
            initPosition: [126.9780, 37.5665, 14],
            homePosition: [126.9780, 37.5665, 14],
          };
          const controller = new vw.MapController(mapOptions);
          setMapController(controller);
        } catch (e) {
          console.error("지도 초기화 실패:", e);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    console.log(searchQuery);
    const response = await fetch(`http://localhost:5000/search?query=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();
  
    const item = data?.response?.result?.items?.[0];
    if (item) {
      const lon = parseFloat(item.point.x);
      const lat = parseFloat(item.point.y);
      mapController?.moveTo([lon, lat, 14]);
    } else {
      alert("검색 결과 없음");
    }
  };

  return (
    <>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 999 }}>
        <input
          type="text"
          placeholder="장소를 검색하세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "6px", width: "200px" }}
        />
        <button onClick={handleSearch} style={{ padding: "6px 10px", marginLeft: "4px" }}>
          검색
        </button>
      </div>
      <div id="vmap" style={{ width: "100%", height: "80%" }} />
    </>
  );
};

export default VWorldMap;
