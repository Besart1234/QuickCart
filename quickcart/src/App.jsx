import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "./layouts/Layout"

import Home from "./pages/home/Home"
import Cart from "./pages/cart/Cart"
import Wishlist from "./pages/wishlist/Wishlist"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import Dashboard from "./pages/dashboard/Dashboard"

function App() {
	return (
		<Routes>
			{/* Wrap all routes within the layout */}
			<Route path="/" element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="home" element={<Navigate to="/" replace />} />
				<Route path="login" element={<Login />} />
				<Route path="signup" element={<Signup />} />
				<Route path="cart" element={<Cart />} />
				<Route path="wishlist" element={<Wishlist />} />
				<Route path="dashboard" element={<Dashboard />} />
			</Route>
    	</Routes>
  	)
}

export default App
