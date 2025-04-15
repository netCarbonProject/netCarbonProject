import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/common/css/HomePage_CSS.css';

// 이미지
import green_intro from '../assets/HomePage/intro_green.png';
import carbon_intro from '../assets/HomePage/carbon_intro.png';
import new_energy from '../assets/HomePage/new_energy.png';
import solar_power from '../assets/HomePage/solar_power.png';

const HomePage = () => {
  const navigate = useNavigate();
  const sectionRefs = useRef([]); // section 참조 저장

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="Home-container">
      {/* Section 1 탄소 중립 */}
      <section className="section" ref={el => (sectionRefs.current[0] = el)}>
        <img src={green_intro} alt="배경 상단 이미지" className="top-overlay" />
        <img src={carbon_intro} alt="탄소중립 소개" className="intro-image clickable" />
      </section>

      {/* Section 2 신재생 에너지 소개 */}
      <section className="section" ref={el => (sectionRefs.current[1] = el)}>
        <img src={new_energy} alt="신재생 에너지" className="fullscreen-img clickable" />
      </section>

      {/* Section 3 태양광 에너지 */}
      <section className="section" ref={el => (sectionRefs.current[2] = el)}>
        <img src={solar_power} alt="태양광 관련" className="fullscreen-img solar-img" />
        <div className="button-group">
          <button className="custom-btn" onClick={() => navigate('/info')}>
            더 알아보기 →
          </button>
          <button className="custom-btn" onClick={() => navigate('/simulation')}>
            시뮬레이션 체험하기 →
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
