import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { securePostData } from "../../services/api";
import { toast } from "react-toastify";
import { Link, NavLink } from "react-router-dom";


function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isConf, setIsConf] = useState(false)
  const [isPass, setIsPass] = useState(false)
  const [isOld, setIsOld] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('otoken')

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password and confirm password was not match")
      return
    }
    const data = { userId, oldPassword, newPassword: password }
    try {
      const response = await securePostData(`lab/change-password`, data);
      if (response.success) {
        setConfirmPassword('')
        setOldPassword('')
        setPassword('')
        toast.success("Password changed successfully")
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  return (
    <>
      <div className="main-content flex-grow-1 p-3 overflow-auto">
        <form action="">
          <div className="row mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="innr-title">Change Password</h3>
                <div className="admin-breadcrumb">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb custom-breadcrumb">
                      <li className="breadcrumb-item">
                        <NavLink to="/dashboard" className="breadcrumb-link">
                          Dashboard
                        </NavLink>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Change Password
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </form>

        <form onSubmit={handleSubmit}>
          <div className="submega-main-bx">
            <div className="row">
              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="custom-frm-bx">
                  <label htmlFor="">Current Password</label>
                  <input
                    type={isOld ? "password" : "text"}
                    className="form-control pe-5"
                    placeholder="Enter Current Password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />

                  <div className="search-item-bx">
                    <a href="javascript:void(0)" onClick={() => setIsOld(!isOld)} className="search-item-btn">
                      <FontAwesomeIcon icon={isOld ? faEye : faEyeSlash} className="text-black" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="custom-frm-bx">
                  <label htmlFor="">New Password</label>
                  <input
                    type={isPass ? "password" : "text"}
                    className="form-control pe-5"
                    placeholder="Enter New Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="search-item-bx">
                    <a href="javascript:void(0)" onClick={() => setIsPass(!isPass)} className="search-item-btn">
                      <FontAwesomeIcon icon={isPass ? faEye : faEyeSlash} className="text-black" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-sm-12">
                <div className="custom-frm-bx">
                  <label htmlFor="">Confirm New Password</label>
                  <input
                    type={isConf ? "password" : "text"}
                    className="form-control pe-5"
                    placeholder="Confirm New Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <div className="search-item-bx">
                    <a href="javascript:void(0)" onClick={() => setIsConf(!isConf)} className="search-item-btn">
                      <FontAwesomeIcon icon={isConf ? faEye : faEyeSlash} className="text-black" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between mt-3">
                  <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                    Go Back
                  </Link>
                <button type="submit" className="nw-thm-btn sub-nw-brd-tbn">Change Password</button>
              </div>

            </div>
          </div>
        </form>


      </div>
    </>
  )
}

export default ChangePassword