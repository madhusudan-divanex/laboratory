import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faBars, faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { IoMdQrScanner } from "react-icons/io";
import Scanner from "../Pages/Scanner";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmpDetail, fetchUserDetail } from "../../redux/features/userSlice";
import base_url from "../../../baseUrl";
import { BarcodeScanner } from 'react-barcode-scanner'
import { toast } from "react-toastify";
import { getApiData } from "../../services/api";
import { Loader } from "lucide-react";
function TopHeader() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [ptId, setPtId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const { profiles, labPerson, user, labImg, staffUser,staffData, isOwner, customId,
    rating, avgRating, labLicense, isRequest, notification } = useSelector(state => state.user)
  useEffect(() => {
    dispatch(fetchUserDetail())
    if (localStorage.getItem('isOwner') === 'false') {
      dispatch(fetchEmpDetail(localStorage.getItem('staffId')))
    }
  }, [dispatch])
  const openScanner = () => setScannerOpen(true);
  const closeScanner = () => setScannerOpen(false);
  useEffect(() => {
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.classList.add('mobile-overlay');
      document.body.appendChild(overlay);
    }

    const dashboard = document.querySelector('.dashboard-left-side');
    const menuBtn = document.querySelector('.tp-mobile-menu-btn');
    const closeBtns = document.querySelectorAll('.tp-mobile-close-btn, .mobile-overlay');

    const handleMenuClick = (e) => {
      e.preventDefault();
      if (window.innerWidth < 992) {
        dashboard.classList.add('mobile-show');
        overlay.classList.add('show');
      } else {
        dashboard.classList.toggle('hide-sidebar');
      }
    };

    const handleClose = (e) => {
      e.preventDefault();
      dashboard.classList.remove('mobile-show');
      overlay.classList.remove('show');
    };

    menuBtn?.addEventListener('click', handleMenuClick);
    closeBtns.forEach(btn => btn.addEventListener('click', handleClose));

    // Cleanup on unmount
    return () => {
      menuBtn?.removeEventListener('click', handleMenuClick);
      closeBtns.forEach(btn => btn.removeEventListener('click', handleClose));
    };
  }, []);


  const handleDetected = (code, err) => {
    if (err) {
      alert(err);
      setScannerOpen(false);   // close modal
      return;
    }
    setScannerOpen(false);
  };
  const handleSearch = async () => {
    if (ptId?.length !== 12) {
      return toast.error("Please enter valid Id")
    }
    setLoading(true)
    try {
      const res = await getApiData(`patient/${ptId}`)
      if (res.success) {
        setPtId("")
        navigate(`/patient-view/${res.userId}`)
      } else {
        toast.error("Patient not found")
      }

    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div className="tp-header-section d-flex align-items-center justify-content-between w-100 py-2 px-3">
        <div className="dash-vendr-header-left-bx">
          <a href="#" className="tp-mobile-menu-btn me-lg-0 me-sm-3 toggle-bar-btn">
            <FontAwesomeIcon icon={faBars} className="fa-lg" />
          </a>

          <div className="top-header-icon tp-header-search-br ">
            <div className="d-flex align-items-center gap-2">
              <div className="custom-frm-bx mb-0 position-relative">
                <input
                  type="text"
                  className="form-control px-5"
                  id="email"
                  value={ptId}
                  onChange={(e) => setPtId(e.target.value)}
                  placeholder="Search Patient id"
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      handleSearch()
                    }
                  }}
                  required
                />
                <div className="tp-search-bx">
                  <button onClick={() => {
                    handleSearch()
                  }
                  } className="tp-search-btn">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>

              <div className="add-patient-bx">
                <Link to="/report-tabs?addPatient=true" className="add-patient-btn">
                  <img src="/white-plus.png" alt="" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex top-header-icon-sec align-items-center">
          <div className="tp-right-admin-bx d-flex align-items-center">

            <div>
              <button className="rq-scan-btn" onClick={() => setScannerOpen(true)} >
                <IoMdQrScanner className="fz-18" /> SCAN</button>
            </div>

            <div className="position-relative">
              <NavLink to="/notification" className="tp-bell-icon">
                <FontAwesomeIcon icon={faBell} className="text-black" />
                <div className="bell-nw-icon-alrt">
                  <span className="bell-title">{notification}</span>
                </div>
              </NavLink>
            </div>
            <div className="header-user dropdown tp-right-admin-details d-flex align-items-center">
              <a
                href="#"
                className="user-toggle d-flex align-items-center"
                id="userMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="admn-icon">
                  <img src={isOwner ? `${base_url}/${profiles?.logo}` : `${base_url}/${staffData?.profileImage}`} alt="" />
                </div>
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end user-dropdown sallr-drop-box"
                aria-labelledby="userMenu"
              >
                <div className="profile-card-box">
                  <div className="profile-top-section">
                    <img
                      src={isOwner ? `${base_url}/${profiles?.logo}` : `${base_url}/${staffData?.profileImage}`}
                      alt="Profile"
                      className="profile-image"
                    />
                    <div className="profile-info">
                      {/* <span className="profile-role">Admin</span> */}
                      <h4 className="profile-name">{isOwner ? labPerson?.name : staffUser?.name}</h4>
                      <p className="profile-id">ID : {isOwner ? user?.nh12 : staffUser?.nh12}</p>
                    </div>
                  </div>
                  <div className="profile-logout-box">
                    <Link to="/login" onClick={() => localStorage.clear()} className="logout-btn">
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </Link>
                  </div>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>


      {/*Payment Status Popup Start  */}
      {/* data-bs-toggle="modal" data-bs-target="#scanner-Request" */}
      {scannerOpen && (
        <div className="modal fade show step-modal"
          id="scanner-Request"
          style={{ display: "block", background: "#00000080" }}
          data-bs-backdrop="static"
          data-bs-keyboard="false">

          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content rounded-5">
              <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
                <h6 className="lg_title mb-0">Scan</h6>

                <button
                  className="fz-18"
                  onClick={closeScanner}     // <-- closes modal
                  aria-label="Close"
                  style={{ color: "#00000040" }}>
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              </div>

              <div className="modal-body px-4">
                <Scanner open={scannerOpen} onDetected={handleDetected} />
              </div>

            </div>
          </div>
        </div>
      )}

      {/*  Payment Status Popup End */}

    </>
  );
}

export default TopHeader;
