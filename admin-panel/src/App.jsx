import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/home";
import Layout from "./layout";
import Category from "./pages/category/category";
import Service from "./pages/service/service";
import Users from "./pages/user/users/page";
import ServiceProviders from "./pages/user/serviceproviders/page";
import AllBooking from "./pages/booking/allbooking";
import BookingDetail from "./pages/booking/bookingDetails";
import Banner from "./pages/banner/all-banner";
import RazorpayConfig from "./pages/razorpay/RazorpayConfig";
import Settings from "./pages/settings/setting";
import SectionManager from "./pages/sectionmanage/sectionManage";
import AdminServiceRequestsPage from "./pages/serviceRequest/serviceRequest";
import Login from "./pages/auth/login";
import ProtectedRoute from "./protectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/service" element={<Service />} />
          <Route path="/users" element={<Users />} />
          <Route path="/service-providers" element={<ServiceProviders />} />
          <Route path="/bookings" element={<AllBooking />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/razorpay-config" element={<RazorpayConfig />} />
          <Route path="/section-management" element={<SectionManager />} />
          <Route path="/service-request" element={<AdminServiceRequestsPage />} />
          <Route path="/booking/allbookings/:id" element={<BookingDetail />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;