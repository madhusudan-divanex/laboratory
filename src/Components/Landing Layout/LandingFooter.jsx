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
  ArrowRight,
  Check,
} from "lucide-react";
import { getApiData } from "../../services/api";
import { useEffect, useState } from "react";
import { faFacebookF, faInstagram, faLinkedinIn, faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


function LandingFooter() {
  const year = new Date().getFullYear();
  const [socialLinks, setSocilLinks] = useState([])
  async function fetchSocialLink() {
    try {
      const res = await getApiData('api/social-links')
      if (res.success) {
        setSocilLinks(res.data)
      }
    } catch (error) {

    }
  }
  useEffect(() => {
    fetchSocialLink()
  }, [])
  return (
    <footer className="footer-section">
      <div className="container footer-container pb-0">

        <div className="row footer-grid">

          <div className="col-md-3">
            <img src="logo.png" width={100} height={60} alt="" />
            {/* <div className="footer-title">
                  <h6>NeoHealthCard Laboratory</h6>
                </div> */}
            <p className="footer-text">
              Secure, interoperable diagnostic infrastructure built for modern healthcare ecosystems.
            </p>
            <div className="footer-social mt-3">
                <a href={socialLinks?.facebook} className="dv-social-icon-btn" target="_blank">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>

                <a href={socialLinks?.instagram} className="dv-social-icon-btn" target="_blank">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>

                <a href={socialLinks?.youtube} className="dv-social-icon-btn" target="_blank">
                  <FontAwesomeIcon icon={faYoutube} />
                </a>

                <a href={socialLinks?.twitter} className="dv-social-icon-btn" target="_blank">
                  <FontAwesomeIcon icon={faXTwitter} />
                </a>

                <a href={socialLinks?.linkedin} className="dv-social-icon-btn" target="_blank">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
              </div>
              <div>
            <p className="footer-text">
              Contact : {socialLinks?.contactNumber}
            </p>
                <p className="footer-text">
              Email : {socialLinks?.email}
            </p>
            <p className="footer-text">
              Address : {socialLinks?.address}
            </p>
              </div>
          </div>

          <div className="col-md-3">
            <div className="footer-title">
              <h5>Platform</h5>
            </div>
            <ul className="footer-links">
              <li><Link to="/#capabilities">Capabilities</Link></li>
              <li><Link to="/#security">Security</Link></li>
              <li><Link to="/#roles">Roles</Link></li>
              <li><Link to="/#analytics">Analytics</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <div className="footer-title">
              <h5>Legal</h5>
            </div>
            <ul className="footer-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="term-condition">Terms of Service</Link></li>
              <li><Link to="/clinical-safety-statement">Clinical Safety Statement</Link></li>
              <li><Link to="/government-public-health">Governance & Compliance</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <div className="footer-title">
              <h5>Contact</h5>
            </div>
            <ul className="footer-links">
              <li><span className="lb-contact-info">Email: {socialLinks?.email}</span></li>
              <li><span className="lb-contact-info">{socialLinks?.address}</span></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p> © {year} NeoHealthCard Private Limited. All rights reserved.</p>
        </div>

      </div>
    </footer>
  )
}

export default LandingFooter
