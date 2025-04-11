// React 및 스타일, 라우터 관련 모듈 import
import React from 'react';
import '../css/Header_CSS.css';
import { useNavigate, useLocation } from 'react-router-dom';

// 이미지 import (현재 사용 안 함, 추후 필요 시 주석 해제 가능)
// import icon from '../../../assets/Header/Icon.png';
// import intro from '../../../assets/Header/intro.png';
// import vector2 from '../../../assets/Header/Vector-2.png';
// import vector1 from '../../../assets/Header/Vector-1.png';
// import vector from '../../../assets/Header/Vector.png';
import menu from '../../../assets/Header/menu.png';
import vector2b from '../../../assets/Header/Vector2.png';

// Header 컴포넌트 정의
const Header = () => {
  const navigate = useNavigate(); // 페이지 이동 함수
  const location = useLocation(); // 현재 위치 확인

  // 현재 경로에 따라 페이지 구분 클래스 지정
  const currentPath = location.pathname;
  const pageClass =
    currentPath === '/' ? 'home-page' :
    currentPath === '/info' ? 'info-page' :
    currentPath === '/simulation' ? 'sim-page' :
    currentPath === '/result' ? 'result-page' :
    'default-page';

  return (
    // 페이지에 따른 classname 
    <header className={`header ${pageClass}`}>
      {/* 로고 영역 */}
      <div className="logo">
        <div className="logo-icon" />
        <div className="logo-title" />
      </div>

      {/* 아이콘 버튼 영역 */}
      <div className="icons">
        {/* 인트로로 */}
        <button id="icon1_img" onClick={() => navigate('/')}></button>
        {/*  */}
        <button id="icon2_img" onClick={() => navigate('/info')}></button>
        {/* 시뮬레이션션 */}
        <button id="icon3_img" onClick={() => navigate('/simulation')}></button>
        {/* 결과창 */}
        <button id="icon4_img" onClick={() => navigate('/result')}></button>

        {/* 메뉴 아이콘 */}
        <div className="menu-group">
          <div><img src={menu} alt="menu" /></div>
          <div><img src={vector2b} alt="menu vector" /></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
