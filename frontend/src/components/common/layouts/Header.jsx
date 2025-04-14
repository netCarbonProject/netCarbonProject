import React from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동 함수

import '../css/Header_CSS.css';

// 이미지 import (src/assets 경로 기준)
import icon1 from '../../../assets/icon1.png';
import intro from '../../../assets/intro.png';
import vector2 from '../../../assets/Vector-2.png';
import vector1 from '../../../assets/Vector-1.png';
import vector from '../../../assets/Vector.png';
import menu from '../../../assets/menu.png';
import vector2b from '../../../assets/Vector2.png';

const Header = () => {
  const navigate = useNavigate(); 
  
  return (
    <header className={`header ${pageClass}`}>
      <div className="logo">
        <div className="logo-icon" />
        <div className="logo-title" />
        <div className="logo-icon" />
        <div className="logo-title" />
      </div>
      <div className="icons">
        <button id="Icon1_white">
          <img src={icon1} alt="icon1" onClick={() => navigate('/')}/>
        </button>
        <button>
          <img src={vector2} alt="vector2" onClick={() => navigate('/info')}/>
        </button>
        <button>
          <img src={vector1} alt="vector1" onClick={() => navigate('/simulation')}/>
        </button>
        <button>
          <img src={vector} alt="vector" />
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