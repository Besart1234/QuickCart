import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "./layouts/Layout"

import Home from "./pages/home/Home"
import Cart from "./pages/cart/Cart"
import Wishlist from "./pages/wishlist/Wishlist"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import Dashboard from "./pages/dashboard/main-page/Dashboard"
import ProductDetails from "./pages/product/ProductDetails"
import AdminLayout from "./layouts/AdminLayout"
import CategoryList from "./pages/dashboard/category/CategoryList"
import CategoryForm from "./pages/dashboard/category/CategoryForm"
import ProductList from "./pages/dashboard/product/ProductList"
import ProductForm from "./pages/dashboard/product/ProductForm"
import CheckoutPage from "./pages/order/CheckoutPage"
import OrderSummaryPage from "./pages/order/OrderSummaryPage"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import ProfilePage from "./pages/user/ProfilePage"
import OrderList from "./pages/dashboard/order/OrderList"
import OrderForm from "./pages/dashboard/order/OrderForm"
import UserList from "./pages/dashboard/user/UserList"
import UserForm from "./pages/dashboard/user/UserForm"
import Notifications from "./pages/notification/Notifications"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
				<Route path="notifications" element={<Notifications />} />

				<Route path="products/:id" element={<ProductDetails />}/>

				<Route 
					path="/checkout" 
					element={
						<Elements stripe={stripePromise}>
							<CheckoutPage />
						</Elements>	
					} 
				/>
				<Route path="/orders/:orderId" element={<OrderSummaryPage />} />

				<Route path='/profile' element={<ProfilePage />} />
			</Route>

			{/* Admin area with full-width layout */}
			<Route path="/dashboard" element={<AdminLayout />}>
				<Route index element={<Dashboard />} />
				
				<Route path="categories" element={<CategoryList />} />
				<Route path="categories/new" element={<CategoryForm />} />
				<Route path="categories/:id" element={<CategoryForm />} />

				<Route path="products" element={<ProductList />} />
				<Route path="products/new" element={<ProductForm />} />
				<Route path="products/:id" element={<ProductForm />} />

				<Route path="orders" element={<OrderList />} />
				<Route path="orders/:id" element={<OrderForm />} />

				<Route path="users" element={<UserList />} />
				<Route path="users/:id" element={<UserForm />} />
			</Route>
    	</Routes>
  	)
}

export default App
