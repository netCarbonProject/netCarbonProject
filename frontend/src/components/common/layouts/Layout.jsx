import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

// 화면에 출력되는 레이아웃
const Layout = () => {
    return (
        <div>
            <Header />
            <main>
                <Outlet /> {/* 자식 라우터 페이지들이 여기 출력됨 */}
            </main>
        </div>
    );
};

export default Layout;