import { Navigate, Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/footer/Footer";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function AdminLayout() {
    const { user, loading } = useContext(AuthContext);

    // while checking auth, don’t flash redirects
    if(loading) return null;

    // if not logged in, go to login
    if(!user) return <Navigate to='/login' replace />

    // if logged in but not admin, go to hom page
    if(!user.roles?.includes('Admin')) return <Navigate to='/' replace />

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />

            <main className="flex-grow-1" style={{ backgroundColor: "#f7f7f9" }}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default AdminLayout;