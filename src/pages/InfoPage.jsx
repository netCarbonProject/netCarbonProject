import React from 'react';
import '../components/common/css/Info_CSS.css'
const InfoPage = () => {
  return (
    <div className="info-container">
      <div className="top-section">
        <div className="left-map">[ 지역별 전력 사용량 지도 ]</div>
        <div className="vertical-divider" />
        <div className="right-top">
          <div className="top-charts">
            <div className="chart">[ 업종별 전력 그래프 ]</div>
            <div className="chart">[ 전력 사용량 비교 ]</div>
          </div>
          <div className="horizontal-divider" />
          <div className="bottom-charts">
            <div className="chart">[ 에너지원별 비율 ]</div>
            <div className="chart">[ 신재생에너지 비율 ]</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;


