import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Header from "../components/Header/Header";

function Layout() {
    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Always visible */}
            <Header />
            
            {/*Page content*/}
            <main className="flex-grow-1 py-4" style={{ backgroundColor: "#f7f7f9" }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>

            {/* Sticks to the bottom */}
            <Footer />
        </div>
    );
}

export default Layout;