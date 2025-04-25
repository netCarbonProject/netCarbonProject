import React, { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import "../components/common/css/Simulation_CSS.css";
import solarpanel1 from "../assets/SimulationPage/solarpanel1.png";
import solarpanel2 from "../assets/SimulationPage/solarpanel2.png";
import simulation_button from "../assets/SimulationPage/simulation_button.png";
import simulation_btn_mobile from "../assets/SimulationPage/simulation_btn_mobile.png";
import sunlight_btn from "../assets/SimulationPage/sunlight_btn.png";
import shadow_btn from "../assets/SimulationPage/shadow_btn.png";

import { useNavigate } from "react-router-dom";
import NaverMap from "../components/map/NaverMap";
import VMap from "../components/map/VMap";

//추
import LoadingAnimation from "./LodingAnimation";

const SimulationPage = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [aiDetections, setAiDetections] = useState([]);
  const navigate = useNavigate();
  // 모바일 화면
  const [isMobile, setIsMobile] = useState(false);

  // 지도 전환
  const [useVMap, setUseVMap] = useState(false);

  // 지도 좌표 동기화
  const [centerLat, setCenterLat] = useState("");
  const [centerLon, setCenterLon] = useState("");

  const [showSolarOverlay, setShowSolarOverlay] = useState(false);
  const [placingPanel, setPlacingPanel] = useState(null);
  const [placingSize, setPlacingSize] = useState({ width: 0, height: 0 });
  const [placedPanels, setPlacedPanels] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [resizeIndex, setResizeIndex] = useState(null); // ✅ 리사이즈 대상 인덱스
  const [isShiftPressed, setIsShiftPressed] = useState(false); // ✅ Shift 고정 여부
  const [placingRotation, setPlacingRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const placingPanelRef = useRef(placingPanel);
  const [aiPlacementMode, setAiPlacementMode] = useState(false);
  const polygonRefs = useRef([]); // 🔵 모든 생성된 Polygon 저장
  //추
  const [isLoading, setIsLoading] = useState(false);
  const [energyOutput, setEnergyOutput] = useState({
    daily: "0.0",
    weekly: "0.0",
    monthly: "0.0",
    yearly: "0.0",
  });

  const cmToPx = (cm) => cm * 0.5;
  const MIN_WIDTH = 100;
  const MIN_HEIGHT = 40;
  const MAX_WIDTH = 500;
  const MAX_HEIGHT = 250;

  const [totalArea, setTotalArea] = useState(0);

  // 수정
  const computeDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);


  const getPixelToMeterRatio = useCallback(() => {
    const map = window.naverMap;
    const proj = map.getProjection();
    const center = map.getCenter();
    const offsetLat = center.lat() + 0.0001;
    const pixel1 = proj.fromCoordToPoint(center);
    const pixel2 = proj.fromCoordToPoint(new window.naver.maps.LatLng(offsetLat, center.lng()));
    const pixelDistance = Math.abs(pixel2.y - pixel1.y);
    const meterDistance = computeDistance(center.lat(), center.lng(), offsetLat, center.lng());
    const ratio = window.devicePixelRatio || 1;
    return (meterDistance / pixelDistance) / ratio;
  }, [computeDistance]);

  const loadStationCSV = useCallback(async () => {
    const res = await fetch("/data/station.csv");
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.map((r) => {
      const [code, lat, lon, radiation] = r.split(",");
      return {
        code,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        radiation: parseFloat(radiation),
      };
    });
  }, []);

  const findClosestStation = useCallback((lat, lon, stations) => {
    let closest = null;
    let minDist = Infinity;
    for (const s of stations) {
      const d = computeDistance(lat, lon, s.lat, s.lon);
      if (d < minDist) {
        minDist = d;
        closest = s;
      }
    }
    return closest;
  }, [computeDistance]);

  const calculateEnergyProduction = useCallback((totalArea, radiationMJ) => {
    // 🔐 방어 코드: 면적 또는 일사량이 없으면 0으로 처리
    if (!totalArea || !radiationMJ) {
      return {
        daily: "0.0",
        weekly: "0.0",
        monthly: "0.0",
        yearly: "0.0",
      };
    }

    const radiationKWh = radiationMJ * 0.278;
    const panelCount = Math.floor(totalArea / 2);
    const panelEfficiency = 0.18;

    const daily = panelCount * radiationKWh * panelEfficiency;
    const weekly = daily * 7;
    const monthly = daily * 30;
    const yearly = [...Array(12)].reduce((sum, _, i) => {
      const degradation = 1 - i * 0.005;
      return sum + daily * 30 * degradation;
    }, 0);

    return {
      daily: daily.toFixed(1),
      weekly: weekly.toFixed(1),
      monthly: monthly.toFixed(1),
      yearly: yearly.toFixed(1),
    };
  }, []);


  const handleCalculateProduction = useCallback(async () => {
    const map = window.naverMap; // ✅ 선언이 필요함
    if (!map || !map.getCenter) return;

    const center = map.getCenter();
    const lat = center.lat();
    const lon = center.lng();

    const stations = await loadStationCSV();
    const closest = findClosestStation(lat, lon, stations);
    const result = calculateEnergyProduction(totalArea, closest.radiation);

    setEnergyOutput(result);
  }, [totalArea, loadStationCSV, findClosestStation, calculateEnergyProduction]);

  useEffect(() => {
    handleCalculateProduction();
  }, [totalArea, handleCalculateProduction]);

  // ✅ 패널 면적 계산: 픽셀 면적 * (1px당 m)^2 * 보정계수 → 실제 m^2
  useEffect(() => {
    const map = window.naverMap;
    if (!map || !map.getProjection) return;
    const pxToMeter = getPixelToMeterRatio();

    const correctionFactor = 425.7 / 283.27; // 🔧 실측 면적 / getAreaSize 기준값

    const total = placedPanels.reduce((sum, panel) => {
      const pixelArea = panel.width * panel.height;
      const realArea = pixelArea * (pxToMeter ** 2) * correctionFactor; // 💡 보정 적용
      return sum + realArea;
    }, 0);

    setTotalArea(total);
  }, [placedPanels, getPixelToMeterRatio]);

  // ✅ placingPanel 상태를 ref에 동기화
  useEffect(() => {
    placingPanelRef.current = placingPanel;
  }, [placingPanel]);

  // ✅ AI 배치 모드에 따라 지도 드래그/휠 설정
  useEffect(() => {
    const map = window.naverMap;
    if (!map) return;
    if (aiPlacementMode) {
      map.setOptions({ scrollWheel: false, draggable: false });
    } else {
      map.setOptions({ scrollWheel: true, draggable: true });
    }
  }, [aiPlacementMode]);

  // ✅ AI 배치 종료 시 설치 대기 패널 초기화
  useEffect(() => {
    if (!aiPlacementMode && placingPanel) {
      setPlacingPanel(null);
    }
  }, [aiPlacementMode, placingPanel]);

  // 모바일 화면 체크
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 420);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 스크롤바 제거
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  // AI 면적 확인
  useEffect(() => {
    window.onMapChanged = () => {
      setAiDetections([]);
    };
  }, []);
  /*
  useEffect(() => {
    const map = window.naverMap;
    if (!map || !map.getProjection) return;

    polygonRefs.current.forEach((p) => p.setMap(null)); // 🧹 기존 polygon 제거
    polygonRefs.current = []; // 🔄 초기화

    const proj = map.getProjection();

    const total = placedPanels.reduce((sum, panel) => {
      const { x, y, width, height, rotation } = panel;
      const center = { x, y };
      const rad = (rotation * Math.PI) / 180;

      const corners = [
        { dx: -width / 2, dy: -height / 2 },
        { dx: width / 2, dy: -height / 2 },
        { dx: width / 2, dy: height / 2 },
        { dx: -width / 2, dy: height / 2 },
      ].map(({ dx, dy }) => {
        const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);
        return new window.naver.maps.Point(
          center.x + rotatedX,
          center.y + rotatedY
        );
      });

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const geoCoords = corners.map((pt) => {
        const pageX = pt.x + canvasRect.left;
        const pageY = pt.y + canvasRect.top;
        return proj.fromPageXYToCoord(
          new window.naver.maps.Point(pageX, pageY)
        );
      });

      const polygon = new window.naver.maps.Polygon({
        paths: geoCoords,
        map: map,
        strokeColor: "#00f",
        strokeWeight: 3,
        fillOpacity: 0.1,
      });

      polygonRefs.current.push(polygon); // ✅ 이 줄이 필요함!!
      const area = polygon.getAreaSize();
      polygon.setMap(null); // 👈 실제 지우기

      return sum + area;
    }, 0);

    setTotalArea(total);
  }, [placedPanels]);
  */

  useEffect(() => {
    const map = window.naverMap;
    if (!map || !map.getProjection || !canvasRef.current) return;

    const proj = map.getProjection();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    let total = 0;

    placedPanels.forEach((panel) => {
      const { x, y, width, height, rotation } = panel;
      const rad = (rotation * Math.PI) / 180;

      const corners = [
        { dx: -width / 2, dy: -height / 2 },
        { dx: width / 2, dy: -height / 2 },
        { dx: width / 2, dy: height / 2 },
        { dx: -width / 2, dy: height / 2 },
      ].map(({ dx, dy }) => {
        const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);
        return new window.naver.maps.Point(
          x + rotatedX + canvasRect.left,
          y + rotatedY + canvasRect.top
        );
      });

      const geoCoords = corners.map((pt) =>
        proj.fromPageXYToCoord(
          new window.naver.maps.Point(pt.x, pt.y)
        )
      );

      const polygon = new window.naver.maps.Polygon({ paths: geoCoords, map });
      const area = polygon.getAreaSize();
      polygon.setMap(null);

      total += area;
    });

    const finalArea = total / 1.37; // 약 35% 과대 보정
    setTotalArea(finalArea);
  }, [placedPanels]);


  useEffect(() => {
    placingPanelRef.current = placingPanel;
  }, [placingPanel]);

  useEffect(() => {
    const map = window.naverMap;
    if (!map) return;

    if (aiPlacementMode) {
      map.setOptions({ scrollWheel: false, draggable: false });
    } else {
      map.setOptions({ scrollWheel: true, draggable: true });
    }
  }, [aiPlacementMode]);

  useEffect(() => {
    if (!aiPlacementMode && placingPanel) {
      setPlacingPanel(null);
    }
  }, [aiPlacementMode, placingPanel]);

  // 패널 도구 창 설정
  // const handleOpenPanel = () => setShowPanel(true);
  // const handleClosePanel = () => setShowPanel(false);
  // 검색창 버튼 토글기능 설정
  // const handleSlideToggle = () => setShowAddressSlide(!showAddressSlide);

  // ✅ 지도 변경 시 AI 윤곽선 초기화
  useEffect(() => {
    window.onMapChanged = () => {
      setAiDetections([]);
    };
  }, []);

  // ✅ 마우스 이동 추적 + 크기 조절
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (resizeIndex !== null && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const panel = placedPanels[resizeIndex];
        const dx = e.clientX - rect.left - panel.x;
        const dy = e.clientY - rect.top - panel.y;
        let newWidth = Math.min(
          Math.max(Math.abs(dx) * 2, MIN_WIDTH),
          MAX_WIDTH
        );
        let newHeight = Math.min(
          Math.max(Math.abs(dy) * 2, MIN_HEIGHT),
          MAX_HEIGHT
        );

        // ✅ Shift 누르면 비율 고정
        if (isShiftPressed) {
          const ratio = panel.width / panel.height;
          if (newWidth / newHeight > ratio) newWidth = newHeight * ratio;
          else newHeight = newWidth / ratio;
        }

        setPlacedPanels((prev) =>
          prev.map((p, i) =>
            i === resizeIndex ? { ...p, width: newWidth, height: newHeight } : p
          )
        );
      }
    };

    // ✅ 키 입력 처리 (Shift, 회전)
    const handleKeyDown = (e) => {
      // 여기 로그 찍어보자
      console.log("KEY DOWN:", e.key);

      if (e.key === "Shift") setIsShiftPressed(true);

      // 1️⃣ placingPanel 상태일 때 우선 회전 처리
      if (placingPanelRef.current) {
        if (e.key === "r" || e.key === "R") {
          console.log("placing R");
          setPlacingRotation((prev) => (prev + 45) % 360);
          return;
        }
        if (e.key === "q" || e.key === "Q") {
          console.log("placing Q");
          setPlacingRotation((prev) => (prev - 45 + 360) % 360);
          return;
        }
      }

      // 2️⃣ 드래그 중 회전
      if (dragIndex !== null) {
        if (e.key === "r" || e.key === "R") {
          console.log("dragIndex R");
          setPlacedPanels((prev) =>
            prev.map((panel, idx) =>
              idx === dragIndex
                ? { ...panel, rotation: (panel.rotation + 45) % 360 }
                : panel
            )
          );
        } else if (e.key === "q" || e.key === "Q") {
          console.log("dragIndex Q");
          setPlacedPanels((prev) =>
            prev.map((panel, idx) =>
              idx === dragIndex
                ? { ...panel, rotation: (panel.rotation - 45 + 360) % 360 }
                : panel
            )
          );
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    // ✅ 휠 회전
    const handleWheel = (e) => {
      const delta = e.deltaY > 0 ? 3 : -3;

      if (placingPanelRef.current) {
        setPlacingRotation((prev) => (prev + delta + 360) % 360);
        return;
      }

      if (dragIndex !== null) {
        e.preventDefault();
        setPlacedPanels((prev) =>
          prev.map((panel, idx) =>
            idx === dragIndex
              ? { ...panel, rotation: (panel.rotation + delta + 360) % 360 }
              : panel
          )
        );
      }
    };

    // ✅ 이벤트 리스너 등록
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [dragIndex, resizeIndex, isShiftPressed, placedPanels]);

  /*
  const tooltipRef = useRef(null);

  const showTooltip = (panel) => {
    const map = window.naverMap;
    if (!map) return;

    const { x, y, width, height, rotation } = panel;
    const center = { x, y };
    const rad = (rotation * Math.PI) / 180;

    const corners = [
      { dx: -width / 2, dy: -height / 2 },
      { dx: width / 2, dy: -height / 2 },
      { dx: width / 2, dy: height / 2 },
      { dx: -width / 2, dy: height / 2 },
    ].map(({ dx, dy }) => {
      const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);
      return new window.naver.maps.Point(
        center.x + rotatedX,
        center.y + rotatedY
      );
    });

    const canvasRect = document
      .getElementById("naver-map")
      .getBoundingClientRect();
    const proj = map.getProjection();
    const geoCoords = corners.map((pt) =>
      proj.fromPageXYToCoord(
        new window.naver.maps.Point(
          pt.x + canvasRect.left,
          pt.y + canvasRect.top
        )
      )
    );

    // const polygon = new window.naver.maps.Polygon({ paths: geoCoords });
    // const area = polygon.getAreaSize();

    const polygon = new window.naver.maps.Polygon({
      paths: geoCoords,
      map: map, // ✅ 필수: 이게 있어야 getAreaSize가 작동함
      strokeColor: "#00f",
      fillOpacity: 0.1,
      strokeWeight: 1,
    });

    polygonRefs.current.push(polygon); // ✅ 배열에 저장
    const area = polygon.getAreaSize();
    polygon.setMap(null); // ✅ 지도에 그렸던 것 제거

    if (tooltipRef.current) tooltipRef.current.close();

    tooltipRef.current = new window.naver.maps.InfoWindow({
      content: `<div style="background:#fff;border:1px solid #333;padding:4px 8px;font-size:12px;">면적: ${area.toFixed(
        2
      )}㎡</div>`,
      pixelOffset: new window.naver.maps.Point(0, -10),
    });

    // geoCoords가 아닌 패널 중심을 LatLng로 변환해서 InfoWindow에 사용
    const centerCoord = proj.fromPageXYToCoord(
      new window.naver.maps.Point(
        center.x + canvasRect.left,
        center.y + canvasRect.top
      )
    );

    tooltipRef.current.open(map, centerCoord); // ⬅ 중심에 표시
  };

  const hideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.close();
      tooltipRef.current = null;
    }
  };
  */

  // ✅ 패널 설치
  const handleMapClick = (e) => {
    if (!placingPanel || !aiPlacementMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPlacedPanels((prev) => [
      ...prev,
      {
        x,
        y,
        src: placingPanel,
        rotation: placingRotation,
        width: placingSize.width,
        height: placingSize.height,
      },
    ]);
    setPlacingPanel(null);
    setPlacingRotation(0);
  };

  // ✅ 드래그 및 리사이즈 조작
  const handleDragStart = (index) => setDragIndex(index);
  const handleResizeStart = (index) => setResizeIndex(index);
  const handleMouseUp = () => {
    setDragIndex(null);
    setResizeIndex(null);
  };

  const handleDrag = (e) => {
    if (dragIndex === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPlacedPanels((prev) =>
      prev.map((panel, idx) => (idx === dragIndex ? { ...panel, x, y } : panel))
    );
  };

  // ✅ 우클릭 삭제
  const handleRightClick = (e, index) => {
    e.preventDefault();
    setPlacedPanels((prev) => prev.filter((_, i) => i !== index));
  };

  const isNearCorner = (pos, panel) => {
    const margin = 10;
    const corners = [
      {
        x: panel.x - panel.width / 2,
        y: panel.y - panel.height / 2,
        name: "top-left",
      },
      {
        x: panel.x + panel.width / 2,
        y: panel.y - panel.height / 2,
        name: "top-right",
      },
      {
        x: panel.x + panel.width / 2,
        y: panel.y + panel.height / 2,
        name: "bottom-right",
      },
      {
        x: panel.x - panel.width / 2,
        y: panel.y + panel.height / 2,
        name: "bottom-left",
      },
    ];
    return corners.find(
      (c) => Math.abs(pos.x - c.x) < margin && Math.abs(pos.y - c.y) < margin
    )?.name;
  };

  // ✅ AI 추론 캡처 및 전송 - 로딩 기능 수정
  const handleAIInference = async () => {
    setIsLoading(true); // 🔄 로딩 시작

    const mapElement = document.querySelector(".simulation-canvas");
    if (!mapElement) {
      alert("지도를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      width: mapElement.offsetWidth,
      height: mapElement.offsetHeight,
    });

    const fullWidth = canvas.width;
    const fullHeight = canvas.height;
    const cropX = fullWidth * 0.1;
    const cropWidth = fullWidth * 0.8;
    const cropHeight = fullHeight;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const ctx = croppedCanvas.getContext("2d");
    ctx.drawImage(canvas, cropX, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    croppedCanvas.toBlob(async (blob) => {
      if (!blob) {
        setIsLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("image", blob, "cropped_map.png");

      try {
        const response = await fetch("http://localhost:8080/api/predict", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setAiDetections(result.detections);

        const map = window.naverMap;
        if (map) {
          setTimeout(() => {
            map.setOptions({ draggable: false, scrollWheel: false });
          }, 100);
        }

        // ✅ AI 배치 모드 ON
        setAiPlacementMode(true);

        const center = window.naverMap.getCenter();
        const lat = center.lat();
        const lng = center.lng();
        console.log("현재 지도 중심 위도/경도:", lat, lng);

      } catch (error) {
        console.error("AI 요청 실패:", error);
      } finally {
        setIsLoading(false); // 🔄 로딩 종료
      }
    }, "image/png");
  };


  return (
    <div className="simulation-container">
      {isLoading && <LoadingAnimation />}
      <div className="simulation-body">
        <div className="simulation-map-area fullscreen-map">
          <div className="simulation-map-wrapper">
            <div
              className="simulation-canvas"
              id="simulation-canvas"
              ref={canvasRef}
              onClick={handleMapClick}
              onMouseMove={handleDrag}
              onMouseUp={handleMouseUp}
              style={{ position: "relative" }}
            >
              {useVMap ? (
                <VMap centerLat={centerLat} centerLon={centerLon} />
              ) : (
                <NaverMap
                  centerLat={centerLat}
                  centerLon={centerLon}
                  setCenterLat={setCenterLat}
                  setCenterLon={setCenterLon}
                  showSolarOverlay={showSolarOverlay}
                />
              )}

              {/* 중앙 영역 시각화 */}
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

              {/* AI 마스크 결과 */}
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
                  const offsetX = window.innerWidth * 0.1;
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

              {/* 🟡 배치된 패널 이미지 */}
              {placedPanels.map((panel, idx) => {
                const corner = isNearCorner(mousePosition, panel);
                const cursor = corner ? "nwse-resize" : "move";
                return (
                  <img
                    key={idx}
                    src={panel.src}
                    alt={`panel-${idx}`}
                    style={{
                      position: "absolute",
                      top: panel.y,
                      left: panel.x,
                      width: panel.width,
                      height: panel.height,
                      transform: `translate(-50%, -50%) rotate(${panel.rotation}deg)`,
                      cursor,
                      zIndex: 1000,
                    }}
                    onMouseDown={() => {
                      if (corner) handleResizeStart(idx, corner);
                      else handleDragStart(idx);
                    }}
                    onContextMenu={(e) => handleRightClick(e, idx)}
                  /*
                  onMouseEnter={() => showTooltip(panel)}
                  onMouseLeave={hideTooltip}
                  */
                  />
                );
              })}
            </div>
            {/* ✅ 마우스를 따라다니는 설치 패널 이미지 */}
            {placingPanel && (
              <img
                src={placingPanel}
                alt="placing"
                style={{
                  position: "fixed",
                  top: mousePosition.y,
                  left: mousePosition.x,
                  // width: "80px",
                  width: placingSize.width,
                  height: placingSize.height,
                  transform: `translate(-50%, -50%) rotate(${placingRotation}deg)`,
                  pointerEvents: "none",
                  zIndex: 2000,
                }}
              />
            )}

            {/* 패널 보기 버튼 */}
            <div className="panel-button-topright">
              <button
                className="open-panel-button"
                onClick={() => setShowPanel(prev => !prev)}
              >
                <img
                  src={isMobile ? simulation_btn_mobile : simulation_button}
                  alt="패널 보기 버튼"
                />
              </button>
            </div>

            {/* 패널 팝업 */}
            {showPanel && (
              <div className="popup-panel">
                <div className="popup-panel-content">
                  <div className="close-btn-layout">
                    <h2>패널 설정</h2>
                  </div>
                  {/* <h2>설치 패널 상세</h2> */}
                  <div className="panel-content-row">
                    <div className="panel-image-selection">
                      <div className="panel-image-box">
                        <img
                          src={solarpanel1}
                          alt="패널1"
                          className="panel-image panel-small"
                          onClick={() => {
                            if (!aiPlacementMode) return; // ✅ AI 모드 아닐 땐 무시
                            setPlacingPanel(solarpanel1);
                            setPlacingSize({
                              width: cmToPx(165),
                              height: cmToPx(99),
                            });
                          }}
                        />
                        <div className="panel-size">165cm x 99cm</div>
                      </div>
                      <div className="panel-image-box">
                        <img
                          src={solarpanel2}
                          alt="패널2"
                          className="panel-image panel-large"
                          onClick={() => {
                            if (!aiPlacementMode) return; // ✅ AI 모드 아닐 땐 무시
                            setPlacingPanel(solarpanel2);
                            setPlacingSize({
                              width: cmToPx(198),
                              height: cmToPx(99),
                            });
                          }}
                        />
                        <div className="panel-size">198cm x 99cm</div>
                        <div className="panel-custom">
                         <button>커스텀</button>
                       </div>
                      </div>
                    </div>
                    <div className="panel-stats-row">
                         <div className="panel-installation">
                           <div className="panel-info">
                             <label className="panel-label">설치 개수</label>
                             <input
                               type="number"
                               value={placedPanels.length}
                               className="panel-input"
                               readOnly
                             />
                           </div>
                           <div className="panel-info">
                             <label className="panel-label">설치 면적</label>
                             <input
                               type="text"
                               value={`${totalArea.toFixed(2)} ㎡`}
                               className="panel-result-input"
                               readOnly
                             />
                           </div>
                           <div className="panel-info">
                             <label className="panel-label">실제 설치 가능 수</label>
                             <input
                               type="text"
                               value={`${Math.floor(totalArea / 2)} 개`}
                               className="panel-input"
                               readOnly
                             />
                           </div>
                         </div>
                         <div className="panel-estimate-box">
                           <div className="panel-info">
                             <label className="panel-label">
                               일간 에너지 생산량
                             </label>
                             <input
                               type="text"
                               value={`${energyOutput.daily} kWh`}
                               className="panel-day-input"
                               readOnly
                             />
                           </div>
                           <div className="panel-info">
                             <label className="panel-label">
                               월간 에너지 생산량
                             </label>
                             <input type="text" value={`${energyOutput.monthly} kWh`} className="panel-week-input"></input>
                           </div>
                           <div className="panel-info">
                             <label className="panel-label">
                               연간 에너지 생산량
                             </label>
                             <input type="text" value={`${energyOutput.yearly} kWh`} className="panel-month-input"></input>
                           </div>
                         </div>
                      <div className="panel-info">
                        <label className="panel-label">설치 목록</label>
                        <ul className="panel-list">
                          {placedPanels.map((p, i) => (
                            <li key={i}>
                              {p.src.includes("solarpanel1")
                                ? "패널1"
                                : "패널2"}{" "}
                              - 회전: {p.rotation}°
                              <button
                                onClick={() =>
                                  handleRightClick(
                                    { preventDefault: () => { } },
                                    i
                                  )
                                }
                              >
                                X
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
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
                      onClick={() => {
                        setAiDetections([]);

                        setPlacedPanels([]); // 👉 설치 패널 초기화
                        setAiPlacementMode(false);
                        // 🔵 파란 Polygon 전부 제거
                        polygonRefs.current.forEach((p) => p.setMap(null));
                        polygonRefs.current = []; // 배열 비우기
                        const map = window.naverMap;
                        if (map) {
                          map.setOptions({
                            draggable: true,
                            scrollWheel: true,
                          });
                        }
                      }}
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

            {/* 그림자 분석 맵 전환 버튼 */}
            <div className="switch-btn">
              <button
                className="switch-button"
                onClick={() => setUseVMap((prev) => !prev)}
              >
                <img src={shadow_btn} alt="맵 전환 버튼" />
              </button>
            </div>

            {/* 일조량 버튼 */}
            <div className="sunlight-filter-button">
              <button
                className="filter-button"
                onClick={() => setShowSolarOverlay((prev) => !prev)}
              >
                <img src={sunlight_btn} alt="일조량 버튼" />
              </button>
            </div>

            {/* 🔳 AI 자동배치 모드일 때만 비활성화 레이어 추가 */}
            {aiPlacementMode && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "10%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    zIndex: 2000,
                    pointerEvents: "auto",
                    cursor: "not-allowed",
                  }}
                  onClick={(e) => e.stopPropagation()}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "10%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    zIndex: 2000,
                    pointerEvents: "auto",
                    cursor: "not-allowed",
                  }}
                  onClick={(e) => e.stopPropagation()}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
