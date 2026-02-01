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
import ServiceRequest from "./pages/serviceRequest/serviceRequest";
import AdminServiceRequestsPage from "./pages/serviceRequest/serviceRequest";
import Coupons from "./pages/coupons/all-coupons";

function App() {
  return (
    <>
      {/* Define Routes */}
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/category" exact element={<Category />} />
            <Route path="/service" exact element={<Service />} />
            <Route path="/users" exact element={<Users />} />
            <Route
              path="/service-providers"
              exact
              element={<ServiceProviders />}
            />
            <Route path="/bookings" exact element={<AllBooking />} />{" "}
            <Route path="/banner" exact element={<Banner />} />
            <Route path="/settings" exact element={<Settings />} />
            <Route path="/razorpay-config" exact element={<RazorpayConfig />} />
            <Route
              path="/section-management"
              exact
              element={<SectionManager />}
            />
            <Route
              path="/service-request"
              exact
              element={<AdminServiceRequestsPage />}
            />
            <Route path="/coupons" exact element={<Coupons />} />
            <Route
              path="/booking/allbookings/:id"
              exact
              element={<BookingDetail />}
            />
            {/* <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />  */}
          </Routes>{" "}
        </Layout>
      </BrowserRouter>
    </>
  );
}

export default App;
