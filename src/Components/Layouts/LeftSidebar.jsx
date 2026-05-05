import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faBuilding,
  faCalendar,
  faChartColumn,
  faCheckCircle,
  faClose,
  faFlask,
  faFlaskVial,
  faKey,
  faLock,
  faMessage,
  faRightFromBracket,
  faRobot,
  faUserCircle,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import base_url from "../../../baseUrl";
import { useEffect } from "react";
import { fetchEmpDetail, fetchUserDetail } from "../../redux/features/userSlice";

function LeftSidebar() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const {
    profiles, allowEdit, permissions, user, staffData, staffUser,
    labPerson, empData, isOwner, customId
  } = useSelector((state) => state.user);
  console.log(isOwner);
  useEffect(() => {

    dispatch(fetchUserDetail());
    if (!isOwner) {
      dispatch(fetchEmpDetail(localStorage.getItem('staffId')))
    }
  }, [isOwner]);

  // helper to check active route
  const active = (path) =>
    pathname === path ? "nav-link nav-active" : "nav-link";
  return (
    <>
      <div className="dashboard-left-side min-vh-100 flex-shrink-0">
        <div className="text-end admn-mob-close-bx">
          <NavLink
            to="#"
            className="d-lg-none tp-mobile-close-btn mb-3 fs-6 text-black"
          >
            <FontAwesomeIcon icon={faClose} />
          </NavLink>
        </div>

        <div className="task-vendr-left-title-bx">
          <div className="dashboard-logo-tp d-flex justify-content-center align-items-center">
            <h4 className="mb-0">
              <NavLink to="/" className="dash-hp-title">
                <img src="/logo.png" alt="" />
              </NavLink>
            </h4>
          </div>
        </div>

        <div className="d-flex flex-column p-3">
          <div className="task-vendor-profile-crd">
            <NavLink to="#">
              <div className="task-vendor-profile-bx">
                <img
                  src={
                    isOwner
                      ? `${base_url}/${profiles?.logo}`
                      : `${base_url}/${staffData?.profileImage}`
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/profile.png";
                  }}
                  alt=""
                />
                <div>
                  <h6 className="new_title fw-500 mb-0 fz-18">
                    {isOwner ? user?.name : staffData?.name}
                  </h6>
                  <p>#{isOwner ? user?.nh12 : staffUser?.nh12}</p>
                </div>
              </div>
            </NavLink>
          </div>

          <div className="left-navigation flex-grow-1 overflow-auto">
            <ul className="nav flex-column mt-lg-3">
              <h6>Navigation</h6>

              <li className="nav-item">
                <NavLink to="/dashboard" className={active("/dashboard")}>
                  <FontAwesomeIcon icon={faBorderAll} /> Dashboard
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/appointment-request"
                  className={active("/appointment-request")}
                >
                  <FontAwesomeIcon icon={faCheckCircle} /> Appointment Request
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/tests" className={active("/tests")}>
                  <FontAwesomeIcon icon={faFlask} /> Tests
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/test-reports-appointment"
                  className={active("/test-reports-appointment")}
                >
                  <FontAwesomeIcon icon={faFlaskVial} /> Lab Reports
                </NavLink>
              </li>

              {(isOwner || permissions?.chat) && <li className="nav-item">
                <NavLink to="/chat" className={active("/chat")}>
                  <FontAwesomeIcon icon={faMessage} /> Chat
                </NavLink>
              </li>}
              <li className="nav-item">
                <NavLink to="/neo-ai" className={active("/neo-ai")}>
                  <FontAwesomeIcon icon={faRobot} /> Neo Ai
                </NavLink>
              </li>
              {isOwner && <li className="nav-item">
                <NavLink to="/slots" className={active("/slots")}>
                  <FontAwesomeIcon icon={faCalendar} /> Slots
                </NavLink>
              </li>}

              <li className="nav-item">
                <NavLink to="/report-tabs" className={active("/report-tabs")}>
                  <FontAwesomeIcon icon={faChartColumn} /> Add  Patient
                </NavLink>
              </li>

              {isOwner && <li className="nav-item">
                <NavLink to="/employee-list" className={active("/employee-list")}>
                  <FontAwesomeIcon icon={faUsers} /> Employees/Doctor
                </NavLink>
              </li>}
              {isOwner && <li className="nav-item">
                <NavLink to="/department" className={active("/department")}>
                  <FontAwesomeIcon icon={faBuilding} /> Department
                </NavLink>
              </li>}

              {isOwner && <li className="nav-item">
                <NavLink to="/permission" className={active("/permission")}>
                  <FontAwesomeIcon icon={faKey} /> Permission
                </NavLink>
              </li>}

              {isOwner ?
                <li className="nav-item">
                  <NavLink
                    to={allowEdit ? "/approve-profile" : "/profile"}
                    className={active(
                      allowEdit
                        ? "/approve-profile"
                        : "/profile"
                    )}
                  >
                    <FontAwesomeIcon icon={faUserCircle} /> Profile
                  </NavLink>
                </li>
                : <li className="nav-item">
                  <NavLink
                    to={`/view-employee/${staffUser?.name}/${staffUser?.nh12}`}
                    className={active(
                      allowEdit
                        ? "/approve-profile"
                        : "/profile"
                    )}
                  >
                    <FontAwesomeIcon icon={faUserCircle} />Profile
                  </NavLink>
                </li>}

              {isOwner && <li className="nav-item">
                <NavLink
                  to="/change-password"
                  className={active("/change-password")}
                >
                  <FontAwesomeIcon icon={faLock} /> Change Password
                </NavLink>
              </li>}

              <li className="nav-item">
                <NavLink to="/login" className={active("/login")}>
                  <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeftSidebar;
