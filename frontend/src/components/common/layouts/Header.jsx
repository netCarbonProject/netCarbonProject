import React from 'react';
import '../css/Header_CSS.css';
import { useNavigate, useLocation } from 'react-router-dom';

// 이미지 import (src/assets 경로 기준)
import icon from '../../../assets/Header/Icon.png';
import intro from '../../../assets/Header/intro.png';
import vector2 from '../../../assets/Header/Vector-2.png';
import vector1 from '../../../assets/Header/Vector-1.png';
import vector from '../../../assets/Header/Vector.png';
import menu from '../../../assets/Header/menu.png';
import vector2b from '../../../assets/Header/Vector2.png';

const Header = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  // 페이지에 따라 className을 바꿔줌
  const currentPath = location.pathname;

  const pageClass =
  currentPath === '/' ? 'home-page' :
  currentPath === '/info' ? 'info-page' :
  currentPath === '/simulation' ? 'sim-page' :
  currentPath === '/result' ? 'result-page' :
  'default-page';

  return (
    <header className={`header ${pageClass}`}>
      <div className="logo">
        <img src={icon} alt="logo" />
        <img src={intro} alt="intro text" />
      </div>
      <div className="icons">
        <button id="icon1_img" onClick={() => navigate('/')}></button>
        <button id="icon2_img">
          <img src={vector2} alt="vector2" onClick={() => navigate('/info')}/>
        </button>
        <button id="icon3_img">
          <img src={vector1} alt="vector1" onClick={() => navigate('/simulation')}/>
        </button>
        <button id="icon4_img">
          <img src={vector} alt="vector" onClick={() => navigate('/result')}/>
        </button>
        <div className="menu-group">
          <div><img src={menu} alt="menu" /></div>
          <div><img src={vector2b} alt="menu vector" /></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
