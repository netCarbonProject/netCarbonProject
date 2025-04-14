import React, { useRef } from 'react'; // React 선언 , useRef로 타겟지정
import { useNavigate } from 'react-router-dom'; // 페이지 이동 함수

import '../components/common/css/HomePage_CSS.css'; // css

// 이미지
import green_intro from '../assets/HomePage/intro_green.png';
import carbon_intro from '../assets/HomePage/carbon_intro.png';
import new_energy from '../assets/HomePage/new_energy.png';
import solar_power from '../assets/HomePage/solar_power.png';

const HomePage = () => {
  // 스크롤 이동
  const section2Ref = useRef(null); 
  const section3Ref = useRef(null); 

  const navigate = useNavigate(); 

  // 부드러운 스크롤 이동
  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 페이지 이동 전에 스크롤 맨 위로 올리는 함수
  const navigateWithScrollTop = (path) => {
    window.scrollTo(0, 0);      // 스크롤 맨 위로
    navigate(path);             // 페이지 이동
  };

  return (
    <div className="Home-container">

      {/* Section 1 탄소 중립 */}
      <section className="section" id="section1"> 
        <img
          src={green_intro}
          alt="배경 상단 이미지"
          className="top-overlay"
        />

        <img
          src={carbon_intro}
          alt="탄소중립 소개"
          className="intro-image clickable"
          onClick={() => scrollTo(section2Ref)}
        />
      </section>

      {/* Section 2 신재생 에너지 소개 */}
      <section className="section" ref={section2Ref}>
        <img
          src={new_energy}
          alt="신재생 에너지"
          className="fullscreen-img clickable"
          onClick={() => scrollTo(section3Ref)}
        />
      </section>

      {/* Section 3 태양광 에너지 */}
      <section className="section" ref={section3Ref}>
        <img
          src={solar_power}
          alt="태양광 관련"
          className="fullscreen-img solar-img"
        />
        <div className="button-group">
          <button className="custom-btn" onClick={() => navigateWithScrollTop('/info')}>
            더 알아보기 →
          </button>
          <button className="custom-btn" onClick={() => navigateWithScrollTop('/simulation')}>
            시뮬레이션 체험하기 →
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
