import React, { useEffect, useRef, useMemo, useState } from 'react';
import '../components/common/css/ResultPage_CSS.css';
import { useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
  Cell, PieChart, Pie
} from 'recharts';
import FutureCarbonChart from './FutureCarbonChart'; // 추가

const ResultPage = () => {
  // const navigate = useNavigate();
  const location = useLocation();
  const sectionRefs = useRef([]);
  const [croppedImage, setCroppedImage] = useState(null); // 잘라낸 이미지를 저장할 상태


  const { panelCount, area, energy, image, aiMaskArea } = location.state || {
    panelCount: 0,
    area: "0.00",
    energy: {
      daily: "0.0",
      weekly: "0.0",
      monthly: "0.0",
      yearly: "0.0",
    },
    aiMaskArea: "0.00",
    image: "",
  };

  // 이미지 로드 후 자르는 작업
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;

      img.onload = () => {
        // 이미지가 로드된 후 canvas로 자르기
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // 이미지의 새로운 크기 계산
        const newWidth = img.width * 0.6; // 60%의 너비 (양옆 20%씩 잘라내기)
        const newHeight = img.height; // 높이는 그대로 유지

        // canvas 크기 설정
        canvas.width = newWidth;
        canvas.height = newHeight;

        // 이미지를 자르기
        ctx.drawImage(img, img.width * 0.2, 0, newWidth, newHeight, 0, 0, newWidth, newHeight);

        // 자른 이미지를 base64 URL로 저장
        const croppedImageUrl = canvas.toDataURL();
        setCroppedImage(croppedImageUrl); // 자른 이미지를 상태로 저장
      };
    }
  }, [image]);

  const placementRatio = useMemo(() => {
    const placed = parseFloat(area);
    const recommended = parseFloat(aiMaskArea);
    if (isNaN(placed) || isNaN(recommended) || recommended === 0) return 0;
    return (placed / recommended) * 100;
  }, [area, aiMaskArea]);

  const actualPanelCount = Math.floor(parseFloat(area) / 2);

  const treeEquivalent = useMemo(() => {
    const annualProduction = parseFloat(energy.yearly);
    if (isNaN(annualProduction) || annualProduction <= 0) return 0;

    const carbonEmissionFromCoal = 820 / 1000;
    const totalCarbonSaved = annualProduction * carbonEmissionFromCoal;

    const carbonAbsorptionPerTreePerYear = 20;
    return Math.floor(totalCarbonSaved / carbonAbsorptionPerTreePerYear);
  }, [energy.yearly]);

  // ✨ 추가: totalCarbonSaved 계산
  const totalCarbonSaved = useMemo(() => {
    const annualProduction = parseFloat(energy.yearly);
    if (isNaN(annualProduction) || annualProduction <= 0) return 0;

    const carbonEmissionFromCoal = 820 / 1000;
    return Math.floor(annualProduction * carbonEmissionFromCoal);
  }, [energy.yearly]);

  // ✨ 추가: 25년 누적 절감 데이터
  const carbonData = useMemo(() => {
    if (totalCarbonSaved <= 0) return [];

    const result = [];
    let accumulated = 0;
    for (let year = 1; year <= 25; year++) {
      accumulated += totalCarbonSaved;
      result.push({ year: `${year}년`, carbonSaved: accumulated });
    }
    return result;
  }, [totalCarbonSaved]);

  const carbonEmissions = useMemo(() => {
    const monthlyProduction = parseFloat(energy.monthly);
    if (isNaN(monthlyProduction) || monthlyProduction <= 0) {
      return null;
    }

    const factors = {
      oil: 650,
      coal: 820,
      gas: 490,
      biomass: 350,
    };

    return {
      oil: (monthlyProduction * factors.oil / 1000).toFixed(1),
      coal: (monthlyProduction * factors.coal / 1000).toFixed(1),
      gas: (monthlyProduction * factors.gas / 1000).toFixed(1),
      biomass: (monthlyProduction * factors.biomass / 1000).toFixed(1),
      solar: 0,
    };
  }, [energy.monthly]);

  useEffect(() => {
    const currentSections = sectionRefs.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animate')) {
            entry.target.classList.add('animate');
          } else if (!entry.isIntersecting && entry.target.classList.contains('animate')) {
            entry.target.classList.remove('animate');
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // useEffect(() => {
  //   // 새로고침 시 결과 페이지 접근 방지
  //   if (!localStorage.getItem("visitedSimulation")) { 
  //     navigate("/simulation"); // 시뮬레이션을 먼저 해야만 결과 페이지로 접근 가능
  //   } else if (!localStorage.getItem("visitedResult")) {
  //     // 결과 페이지 방문 기록이 없으면 시뮬레이션에서만 접근 가능
  //     localStorage.setItem("visitedResult", "true");
  //   }
  // }, [navigate]);

  const chartData = carbonEmissions ? [
    { name: '석유', emission: parseFloat(carbonEmissions.oil), color: '#ff6b6b' },
    { name: '석탄', emission: parseFloat(carbonEmissions.coal), color: '#4f4f4f' },
    { name: '천연가스', emission: parseFloat(carbonEmissions.gas), color: '#82ca9d' },
    { name: '바이오매스', emission: parseFloat(carbonEmissions.biomass), color: '#bfa46f' },
    { name: '태양광', emission: parseFloat(carbonEmissions.solar), color: '#f8e473' },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', padding: '8px', borderRadius: '6px' }}>
          <p>{label}</p>
          <p style={{ fontWeight: 'bold' }}>{`${payload[0].value} kg CO₂`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="result-page-wrapper">
      <div className="top-section" ref={el => (sectionRefs.current[0] = el)}>
        <div className="right-map">
          <div className="resullt-map-title">지도 시뮬레이션 결과</div>
          <div className="result-map-placeholder">
            {croppedImage ? (
              <img
                src={croppedImage}
                alt="시뮬레이션 결과 이미지"
                style={{
                  width: "100%",          
                  height: "100%",         
                  objectFit: "fill",     
                  objectPosition: "center", 
                  borderRadius: "1rem",
                  // clipPath: "polygon(20% 0, 80% 0, 80% 100%, 20% 100%)", 
                }}
              />
            ) : (
              <p>이미지를 불러올 수 없습니다.</p>
            )}
          </div>
        </div>
        <div className="simulation-info">
          <div className="result-stats">
            <h3>시뮬레이션 결과</h3>
            <p>설치 개수 : {panelCount}개</p>
            <p>설치 면적 : {area} m²</p>
            <p>실제 설치 가능 수 : {actualPanelCount}개</p>
            <p>일간 에너지 생산량 : {energy.daily} kWh</p>
            <p>월간 에너지 생산량 : {energy.monthly} kWh</p>
            <p>연간 에너지 생산량 : {energy.yearly} kWh</p>
          </div>
          <div className='donut-chart-group'>
            <div className="power_generation">
              <h3>태양광 발전량</h3>
            </div>
            <div className="donut-chart-placeholder">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '설치된 면적', value: placementRatio },
                      { name: '남은 면적', value: 100 - placementRatio },
                    ]}
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell key="installed" fill="#82ca9d" />
                    <Cell key="remaining" fill="#ffffff" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold', fontSize: '1rem' }}>
                설치율 {placementRatio.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탄소 저감 카드 & 차트 */}
      <section className="carbon-section" ref={el => (sectionRefs.current[1] = el)}>
        <div className="carbon-title">에너지원별 탄소배출량 비교</div>
        {carbonEmissions ? (
          <div className="carbon-layout">

            {/* 왼쪽 카드들 (태양광 제외) */}
            <div className="carbon-cards">
              {chartData.filter(item => item.name !== '태양광').map((item, index) => (
                <div key={index} className={`carbon-card ${item.name.toLowerCase()}`} style={{ backgroundColor: item.color, padding: '12px', borderRadius: '8px', color: '#fff', marginBottom: '2px' }}>
                  <div className="card-text" style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <span className="carbon-amount">{item.emission} kg CO₂</span>
                </div>
              ))}
            </div>

            {/* 오른쪽 차트와 태양광 카드 */}
            <div className="carbon-right">
              <div className="carbon-card solar" style={{ backgroundColor: '#f8e473', padding: '12px', borderRadius: '8px', color: '#fff', marginBottom: '2px' }}>
                <div className="card-text" style={{ fontWeight: 'bold' }}>태양광 발전 시 탄소 배출량</div>
                <span className="carbon-amount solar-amount">{carbonEmissions.solar} kg CO₂</span>
              </div>

              <div className="carbon-chart-placeholder">
                <ResponsiveContainer width="100%" height={300} padding={20}>
                  <BarChart data={chartData} margin={{ top: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit=" kg" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="emission">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="emission" position="top" formatter={(val) => `${val}`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <p>탄소배출량을 계산할 수 없습니다.</p>
        )}
      </section>

      {/* 미래 예측 절감량 */}
      <section className="future-section" ref={el => (sectionRefs.current[2] = el)}>
        {/* <h2>앞으로 {treeEquivalent.toLocaleString()}그루 심은 효과가 예상돼요!</h2> */}
        <FutureCarbonChart treeEquivalent={treeEquivalent} yearlyEnergy={energy.yearly} />
      </section>

      {/* 나무 효과 */}
      <section className="tree-section" ref={el => (sectionRefs.current[3] = el)}>
        <div className="tree-content">
          <div className="tree-text">
            <h2>나무를 {treeEquivalent.toLocaleString()}그루 심은 것과 비슷한 효과에요!</h2>
            <p className='tree-down'>
              (석탄 발전 대비 연간 탄소 절감량 기준, 나무 1그루는 연간 약 20kg CO₂를 흡수합니다.)
            </p>
            <div className="tree-effect">
              <div className="tree-effect-item">
                <h3>🌱 실제 나무 {treeEquivalent.toLocaleString()}그루를 심는다면?</h3>
                <p>• 1그루 심는 데 평균 비용: 3천~5천원</p>
                <p>• 심고 20년 이상 키워야 저 효과</p>
                <p>• 도심지에선 땅 확보 자체가 어려움</p>
                <p>• 유지관리도 필요함 (물, 병충해 등)</p>
              </div>
              <div className="tree-effect-item">
                <h3>⚡️ 근데 태양광은?</h3>
                <p>• 설치 즉시 CO₂ 저감 시작</p>
                <p>• 25년 이상 유지 가능</p>
                <p>• 유지비 거의 없음</p>
                <p>• 옥상, 공장 지붕, 버려진 땅 다 활용 가능</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultPage;
