import React, { useEffect } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import WMTS from "ol/source/WMTS";
import VectorSource from "ol/source/Vector";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { get as getProjection, fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import SunCalc from "suncalc";

const VWorldMap = () => {
  useEffect(() => {
    const apiKey = "YOUR_API_KEY"; // 🔑 Replace with your actual VWorld API key

    const projection = getProjection("EPSG:3857");

    const tileGrid = new WMTSTileGrid({
      origin: [-20037508.342789244, 20037508.342789244],
      resolutions: Array.from({ length: 20 }, (_, z) => 156543.03392804097 / Math.pow(2, z)),
      matrixIds: Array.from({ length: 20 }, (_, z) => z.toString()),
    });

    const wmtsLayer = new TileLayer({
      source: new WMTS({
        url: `https://api.vworld.kr/req/wmts/1.0.0/PHOTO/default/GoogleMapsCompatible/{z}/{y}/{x}.png?apiKey=${apiKey}`,
        layer: "PHOTO",
        matrixSet: "GoogleMapsCompatible",
        format: "image/png",
        projection,
        tileGrid,
        style: "default",
        attributions: "© VWorld",
      }),
    });

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
    });

    const map = new Map({
      target: "vmap",
      layers: [wmtsLayer, markerLayer],
      view: new View({
        center: fromLonLat([126.9780, 37.5665]),
        zoom: 14,
      }),
    });

    map.on("click", function (evt) {
      const coord = toLonLat(evt.coordinate);
      const [lon, lat] = coord;

      // 1. 마커 생성
      markerSource.clear();
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });
      marker.setStyle(
        new Style({
          image: new Icon({
            src: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scale: 1,
          }),
        })
      );
      markerSource.addFeature(marker);

      // 2. 일조량 계산
      const today = new Date();
      let totalSunHours = 0;

      for (let hour = 5; hour <= 19; hour++) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour);
        const pos = SunCalc.getPosition(date, lat, lon);
        const altitude = (pos.altitude * 180) / Math.PI;
        if (altitude > 10) totalSunHours++;
      }

      const estimateKWh = (totalSunHours * 0.8).toFixed(2);
      console.log(
        `📍 위도: ${lat.toFixed(6)}, 경도: ${lon.toFixed(6)}\n☀️ 예상 일조 시간: ${totalSunHours}시간\n🔋 예상 발전량: ${estimateKWh} kWh`
      );
    });
  }, []);

  return <div id="vmap" style={{ width: "100%", height: "100vh" }} />;
};

export default VWorldMap;