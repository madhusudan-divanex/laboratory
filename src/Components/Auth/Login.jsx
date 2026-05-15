import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { postApiData } from '../../services/api'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { fetchEmpDetail, setOwner, setPermissions } from '../../redux/features/userSlice'
import { useDispatch } from 'react-redux'
import Loader from '../Layouts/Loader'


function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loginAsEmployee, setLoginAsEmployee] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isShow, setIsShow] = useState(false)
  const userId = localStorage.getItem('userId')
  const [emailLogin, setEmailLogin] = useState(false)
  const [formData, setFormData] = useState({
    contactNumber: "",
    email: "",
    panelId: "",
    password: "", withOtp: true
  });
  const [errors, setErrors] = useState({});
  const validate = () => {
    let temp = {};

    if (emailLogin) {
      if (!formData?.email?.trim())
        temp.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        temp.email = "Invalid email format";
    } else {
      if (!formData?.contactNumber?.trim())
        temp.contactNumber = "Mobile number is required";
      else if (formData.contactNumber.length !== 10)
        temp.contactNumber = "Mobile number must be 10 digits";
    }
    if (!formData?.password?.trim())
      temp.password = "Password is required";
    if (loginAsEmployee && !formData?.panelId?.trim()) {
      temp.panelId = "Panel id is required"
    }


    setErrors(temp);
    return Object.keys(temp).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true)
    let data = { password: formData.password, withOtp: formData?.withOtp }
    if (formData.contactNumber) {
      data.contactNumber = formData.contactNumber
    }
    if (formData.email) {
      data.email = formData.email
    }
    try {
      if (loginAsEmployee) {
        const response = await postApiData('api/staff/login', formData)
        if (response.success) {
          if (formData?.withOtp) {
            localStorage.setItem('staffId', response.staffId)
            localStorage.setItem('panelId', formData.panelId)
            toast.success(`Login Success`)
            navigate(`/otp?contact=${formData?.contactNumber || formData?.email}`)
          } else {
            localStorage.setItem('staffId', response.staffId)
            toast.success('Verify successfully');
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            dispatch(fetchEmpDetail(response.staffId));
            // await saveFcmToken();
            navigate('/dashboard');
            dispatch(fetchUserDetail());
          }
        } else {
          toast.error(response.message)
        }
      } else {
        const response = await postApiData('lab/signin', data)
        if (response.success) {
          if (formData?.withOtp) {
            navigate(`/otp?contact=${formData?.contactNumber || formData?.email}`)
          } else {
            localStorage.setItem('token', response.token)
            localStorage.setItem('userId', response.userId)
            // localStorage.setItem('isOwner', response.isOwner);



            toast.success('Login successfully')
            if (response.nextStep) {
              navigate(response.nextStep)
              return
            }
            if (response.user.status == 'pending') {
              navigate('/wating-for-approval')
              return
            } else {
              navigate('/dashboard')
              await saveFcmToken();
            }
          }

        } else {
          toast.error(response.message)
        }
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    } finally {
      setLoading(false)
    }
  };
  useEffect(() => {
    if (emailLogin) {
      setFormData({ ...formData, contactNumber: "" })
    } else {
      setFormData({ ...formData, email: "" })
    }
  }, [emailLogin])
  return (
    <>
      {loading ? <Loader />
        : <section className="admin-login-section ">
          <div className="container-fluid ">
            <div className="row">
              <div className="col-lg-6 col-md-12 col-sm-12 px-0 mb-sm-3 mb-lg-0">
                <div className="admin-pisture-bx">
                  <img src="login-bnnr.png" alt="" />
                </div>
              </div>

              <div className="col-lg-6 col-md-12 col-sm-12 d-flex flex-column justify-content-center">
                <div>
                  <div className="admin-frm-vendor-bx">
                    <div className="admin-lg-title">
                      <h4 className="mb-0"><a href="javascript:void(0)" className="dash-hp-title">
                        <img src="/logo.png" alt="" />
                      </a></h4>
                    </div>

                    <div className="admin-vendor-login">
                      <div className="admin-vndr-login">
                        <h3>Laboratory Login</h3>
                        <p>Secure access to the Laboratory Information System.</p>
                      </div>

                      <form onSubmit={handleSubmit}>
                        {loginAsEmployee && <div className="custom-frm-bx">
                          <div className="custom-frm-bx mb-0">
                            <label htmlFor="">Enter Id</label>
                            <input type="number" name="panelId"
                              value={formData.panelId}
                              onChange={(e) => setFormData({ ...formData, panelId: e.target.value })} className="form-control nw-frm-select" placeholder="Enter id" />
                            {/* <div className="contact-add-icon">
                              <span className="nw-contact-icon"> <FontAwesomeIcon icon={faIdCard} /> </span>
                            </div> */}
                          </div>
                          {errors.panelId && <small className="text-danger">{errors.panelId}</small>}
                        </div>}
                        {emailLogin ?
                          <div className="custom-frm-bx admin-frm-bx">
                            <label htmlFor="">Email address</label>
                            <input
                              type="email"
                              className="form-control admin-frm-control"
                              placeholder="Enter email address"
                              name='email'
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            {errors.email && <small className="text-danger">{errors.email}</small>}
                          </div>
                          : <div className="custom-frm-bx admin-frm-bx">
                            <label htmlFor="">Mobile Number</label>
                            <input
                              type="number"
                              className="form-control admin-frm-control"
                              placeholder="Enter mobile number"
                              name='contactNumber'
                              value={formData.contactNumber}
                              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            />
                            {errors.contactNumber && <small className="text-danger">{errors.contactNumber}</small>}
                          </div>}

                        <div className="custom-frm-bx admin-frm-bx">
                          <label htmlFor="">Password</label>
                          <input
                            type={isShow ? "text" : "password"}
                            className="form-control admin-frm-control pe-5"
                            placeholder="*******"
                            name='password'
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />

                          <div className="pass-eye-bx">
                            <a href="#" onClick={() => setIsShow(!isShow)} className="pass-eye-slash-btn">
                              <FontAwesomeIcon icon={isShow ? faEyeSlash : faEye} />
                            </a>
                          </div>
                          {errors.password && <small className="text-danger">{errors.password}</small>}
                        </div>
                        <div className='d-flex justify-content-between'>
                          <button type="button" onClick={() => setEmailLogin(!emailLogin)} className='lab-login-forgot-btn fs-6'>Login using {emailLogin ? 'mobile number' : 'email'}</button>
                          <NavLink to="/forgot-password" className='lab-login-forgot-btn fs-6'>Forgot Password</NavLink>
                        </div>
                        <div className="custom-radio-group my-3 d-flex flex-row">
                          <label className="form-label me-3">Continue with Otp</label>
                          <input type="checkbox" className="form-check-input" name="" checked={formData?.withOtp}
                            onChange={(e) => setFormData({ ...formData, withOtp: e.target.checked })} id="" />
                        </div>
                        <div className='d-flex justify-content-between mt-4'>
                          <button className='lab-login-forgot-btn fs-6' type="button" onClick={() => setLoginAsEmployee(!loginAsEmployee)}>
                            Login as {loginAsEmployee ? 'owner' : 'employee'}
                          </button>
                        </div>


                        <div className='mt-3'>
                          <button type="submit" className="admin-lg-btn">
                            Login
                          </button>
                        </div>

                        <div className='text-center mt-5'>
                          <span className='do-account-title'>don't have an account?  <Link to="/create-account" className='lab-login-forgot-btn'>Register here</Link></span>
                        </div>

                      </form>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}
    </>
  )
}

export default Login