import React, { useState, useEffect } from "react";
import "../css/Header_CSS.css";
import { useNavigate, useLocation } from "react-router-dom";

import menu from "../../../assets/Header/menu.png";
import vector2b from "../../../assets/Header/Vector2.png";

const Header = () => {
  const navigate = useNavigate(); 
  const location = useLocation();

  // 메뉴 열기/닫기 상태 관리
  const [menuOpen, setMenuOpen] = useState(false);

  // 화면 크기를 체크하여 메뉴를 모바일에서만 사용할 수 있게 함
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 550);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 550);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 페이지에 따라 className을 바꿔줌
  const currentPath = location.pathname;

  const pageClass =
  currentPath === '/' ? 'home-page' :
  currentPath === '/info' ? 'info-page' :
  currentPath === '/simulation' ? 'sim-page' :
  currentPath === '/result' ? 'result-page' :
  'default-page';

  // 버튼 클릭 시 페이지로 이동
  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className={`header ${pageClass} ${menuOpen ? 'menu-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
      <div  className={`logo`}>
        <div className="logo-icon" />
        <div className="logo-title" />
      </div>
      <div className="icons">
        {!isMobile && (
          <>
            <button id="icon1_img" onClick={() => navigate('/')}></button>
            <button id="icon2_img" onClick={() => navigate('/info')}></button>
            <button id="icon3_img" onClick={() => navigate('/simulation')}></button>
            <button id="icon4_img" onClick={() => navigate('/result')}></button>
          </>
        )}
        <div className="menu-group">
          {/* {!isMobile && (
            <>
              <img className='menu_title' src={menu} alt="menu" />
              <img className='menu_icon' src={vector2b} alt="menu vector" />
              </>
          )} */}
        </div>
        {menuOpen && isMobile && (
          <div className={`dropdown-menu ${pageClass}`}>
            <button
              className={currentPath === '/' ? 'active' : ''}
              onClick={() => handleNav('/')}
            >
              홈
            </button>
            <button
              className={currentPath === '/info' ? 'active' : ''}
              onClick={() => handleNav('/info')}
            >
              대시보드
            </button>
            <button
              className={currentPath === '/simulation' ? 'active' : ''}
              onClick={() => handleNav('/simulation')}
            >
              시뮬레이션
            </button>
            <button
              className={currentPath === '/result' ? 'active' : ''}
              onClick={() => handleNav('/result')}
            >
              결과
            </button>
          </div>
        )}
        
      </div>

    </header>
  );
};

export default Header;