import React, { useEffect } from 'react'; // useEffect 추가
import '../components/common/css/Info_CSS.css';
import IndustryUsageChart from '../components/charts/IndustryUsageChart';
import UsageCompareChart from '../components/charts/UsageCompareChart';
import EnergySourceChart from '../components/charts/EnergySourceChart';
import RenewableChart from '../components/charts/RenewableChart';

const InfoPage = () => {
  useEffect(() => {
    // 페이지에 진입하면 body 스크롤 비활성화
    document.body.style.overflow = 'hidden';

    // 페이지에서 나가면 다시 스크롤 활성화
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="info-container">
      <div className="top-section">
        <div className="left-map">[ 지역별 전력 사용량 지도 ]</div>
        <div className="vertical-divider" />
        <div className="right-top">
          <div className="top-charts">
            <div className="chart"><IndustryUsageChart /></div>
            <div className="chart"><UsageCompareChart /></div>
          </div>
          
          
          <div className="horizontal-divider" />


          <div className="bottom-charts">
            <div className="chart"><EnergySourceChart /></div>
            <div className="chart"><RenewableChart /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
