import { Link } from "react-router-dom";
import "../../assets/css/landing.css"

import {
  Shield,
  Sparkles,
  ClipboardList,
  TestTube2,
  Barcode,
  Activity,
  Brain,
  FileSignature,
  Users,
  Network,
  BarChart3,
  Cloud,
  Lock,
  Building2,
  ArrowRight,
  Check,
} from "lucide-react";


import { FaHospital } from "react-icons/fa";

import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

function LandingHeader() {


  const [menuOpen, setMenuOpen] = useState(false);
  // const [selectedLocation, setSelectedLocation] = useState("Jaipur, India");

  // const locations = ["English", "Delhi"];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };



  useEffect(() => {
    const onScroll = () => {
      document
        .querySelector(".navbar")
        ?.classList.toggle("fixed", window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  return (


    <>
      {/* <header className="neo-lab-header">
        <div className="container neo-lab-inner">


          <div className="d-flex align-items-center gap-3">

            <div className="neo-lab-icon-box">
              🧪
            </div>

            <div className="neo-lab-title">
              <div className="neo-lab-main">NeoHealthCard</div>
              <div className="neo-lab-sub">Laboratory</div>
            </div>

          </div>


          <nav className="neo-lab-nav d-none d-md-flex">
            <Link to="/#capabilities" className="neo-lab-link">Capabilities</Link>
            <Link to="/#security" className="neo-lab-link">Security</Link>
            <Link to="/#roles" className="neo-lab-link">Roles</Link>
            <Link to="/#connectivity" className="neo-lab-link">Connectivity</Link>
            <Link to="/#analytics" className="neo-lab-link">Analytics</Link>
          </nav>


          <div className="d-flex gap-2">
            <a href="#contact" className="neo-lab-btn-outline">
              Integrate
            </a>

            <Link to="/login" className="neo-lab-btn-primary">
              Request Demo →
            </Link>
          </div>

        </div>
      </header> */}

      <header>
        <nav className="navbar navbar-expand-lg navbar-light-box">
          <div className="container">
            <NavLink className="navbar-brand me-0" to="/">
              <div className="neo-landing-header">

                <div className="neo-landing-box">
                <img src="/logo.png" alt="" />
              </div>

                {/* <div className="neo-lab-title">
                  <div className="neo-lab-main">NeoHealthCard</div>
                  <div className="neo-lab-sub">Laboratory</div>
                </div> */}

              </div>
            </NavLink>

            <button className="navbar-toggler" type="button" onClick={toggleMenu}>
              <span className="navbar-toggler-icon" />
            </button>

            <div className={`collapse navbar-collapse${menuOpen ? " show" : ""}`}
              id="navbarSupportedContent" >

              <div className="mobile-close-btn d-lg-none">
                <FontAwesomeIcon icon={faTimes} onClick={closeMenu} />
              </div>

              <ul className="navbar-nav mx-auto mb-2 mb-lg-0  gap-lg-2 gap-sm-0">
                <li className="nav-item">
                  <Link to="/#capabilities" className="nav-link" onClick={closeMenu}>
                    Capabilities
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/#roles" onClick={closeMenu}>
                    Roles
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/#ecosystem" onClick={closeMenu}>
                    Security
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/#connectivity" onClick={closeMenu}>
                    Connectivity
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/#analytics" onClick={closeMenu}>
                    Analytics
                  </Link>
                </li>

              </ul>


              <div className="d-flex align-items-center gap-3 hospital-request-box">

                {localStorage.getItem('token')?
                <Link to='/dashboard' className="lb-thm-btn ">
                  Go To Dashboard →
                </Link>
                :<Link to='/login' className="lb-thm-btn ">
                  Join Free Now →
                </Link>}
              </div>
            </div>
          </div>
          {menuOpen && <div className="hp-mobile-overlay" onClick={closeMenu}></div>}
        </nav>
      </header>

    </>
  )
}

export default LandingHeader
