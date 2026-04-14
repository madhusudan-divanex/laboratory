import { Outlet, useLocation } from "react-router-dom"
import LeftSidebar from "./LeftSidebar"
import TopHeader from "./TopHeader"
import { useDispatch } from "react-redux";
import { fetchEmpDetail, fetchUserDetail } from "../../redux/features/userSlice";
import { useEffect } from "react";

function AppLayout() {
  const location = useLocation();
  const dispatch = useDispatch()
  const path = location.pathname;
  const staticRoute = ['/login', '/wating-for-approval', '/forgot-password', '/otp', '/set-password', '/create-account', '/create-account-image', '/create-account-address', '/create-account-person', '/create-account-upload' , '/']

  return (
    <>
      <div className="all-tp-main-section">
        {!staticRoute.includes(path) && < LeftSidebar />}
        <div className="dashboard-right-side flex-grow-1 d-flex flex-column">
          {!staticRoute.includes(path) && <TopHeader />}
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default AppLayout