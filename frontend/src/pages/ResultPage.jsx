import React from 'react';
import '../components/common/css/ResultPage_CSS.css';

const ResultPage = () => {
  return (
    <div className="result-page-wrapper">

      <div className="top-section">
        <div className="result-map-placeholder">지도 시뮬레이션 결과</div>

        <div className="simulation-info">
          <div className="result-stats">
            <h3>시뮬레이션 결과</h3>
            <p>설치 개수: n개</p>
            <p>설치 면적: n m²</p>
            <p>예상 발전량: nnn MWh</p>
          </div>
          <div className="donut-chart-placeholder">도넛 차트</div>
        </div>
      </div>

      {/* 탄소 저감 카드 & 차트 */}
      <section className="carbon-section">
        <div className="carbon-title">탄소를 N만큼 저감했어요!</div>
        <div className="carbon-layout">
          <div className="carbon-cards">
            <div className="carbon-card oil">
              <div className="card-text">석유 사용 시 발생 탄소량</div>
              <span className="carbon-amount oil-amount">+150000(gCO₂/kWh)</span>
            </div>
            <div className="carbon-card coal">
              <div className="card-text">석탄 사용 시 발생 탄소량</div>
              <span className="carbon-amount coal-amount">+120000(gCO₂/kWh)</span>
            </div>
            <div className="carbon-card natural-gas">
              <div className="card-text">천연가스 사용 시 발생 탄소량</div>
              <span className="carbon-amount natural-gas-amount">+80000(gCO₂/kWh)</span>
            </div>
            <div className="carbon-card biomass">
              <div className="card-text">바이오매스 사용 시 발생 탄소량</div>
              <span className="carbon-amount biomass-amount">+150000(gCO₂/kWh)</span>
            </div>
          </div>
          <div className="carbon-right">
            <div className="carbon-card solar">
              <div className="card-text">태양광 발전 시 탄소 배출량</div>
              <span className="carbon-amount solar-amount">+500(gCO₂/kWh)</span>
            </div>
            <div className="carbon-chart-placeholder">에너지원 별 탄소배출량 비교 그래프</div>
          </div>
        </div>
      </section>

      {/* 미래 예측 절감량 */}
      <section className="future-section">
        <h2>앞으로 n만큼 더 절약할 수 있어요!</h2>
        <div className="line-chart-placeholder">기간별 예측 누적 탄소 저감량 그래프 공간</div>
      </section>

      {/* 나무 효과 - 텍스트 + 이미지 */}
      <section className="tree-section">
        <div className="tree-content">
          <div className="tree-text">
            <h2>나무를 N개 심은 것과 비슷한 효과에요!</h2>
            <div className="tree-effect">
              <div className="tree-effect-item">
                <p>🌱 실제 나무 N그루를 심는다면?</p>
                <p>1그루 심는 데 평균 비용: 3천~5천원</p>
                <p>심고 20년 이상 키워야 저 효과</p>
                <p>도심지에선 땅 확보 자체가 어려움</p>
                <p>유지관리도 필요함 (물, 병충해 등)</p>
              </div>

              <div className="tree-effect-item">
                <p>⚡ 근데 태양광은?</p>
                <p>설치 즉시 CO₂ 저감 시작</p>
                <p>25년 이상 유지 가능</p>
                <p>유지비 거의 없음</p>
                <p>옥상, 공장 지붕, 버려진 땅 다 활용 가능</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultPage;
