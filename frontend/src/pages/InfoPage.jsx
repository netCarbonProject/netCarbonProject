import React from 'react'; // React 선언
import '../components/common/css/Info_CSS.css' // css
import IndustryUsageChart from '../components/charts/IndustryUsageChart';
import UsageCompareChart from '../components/charts/UsageCompareChart';
import EnergySourceChart from '../components/charts/EnergySourceChart';
import RenewableChart from '../components/charts/RenewableChart';

const InfoPage = () => {
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


