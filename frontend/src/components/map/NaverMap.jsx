import React, { useEffect, useRef } from "react";

const NaverMap = ({ center = { lat: 37.5665, lng: 126.9780 }, zoom = 18 }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.naver || !mapRef.current) return;

    const map = new window.naver.maps.Map(mapRef.current);
    map.setMapTypeId(window.naver.maps.MapTypeId.SATELLITE); // 위성지도 설정

    map.setOptions("mapTypeControl",false);
  }, [center, zoom]);

  return <div ref={mapRef} style={{ width: "99%", height: "80%" }} />;
};

export default NaverMap;
