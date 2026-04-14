import { faEnvelope, faMessage, faPhone } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link, NavLink, useNavigate, useParams } from "react-router-dom"
import { getSecureApiData } from "../../services/api"
import { useEffect, useState } from "react"
import base_url from "../../../baseUrl"
import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserDetail } from "../../redux/features/userSlice"


function PatientDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const userId = localStorage.getItem('userId')
  const [appointments, setAppointments] = useState([])
  const dispatch = useDispatch()
  const [patientData, setPatientData] = useState({});
  const [demoData, setDemoData] = useState({});
  const [isLoading, setIsLoading] = useState(true)
  const [customId, setCustomId] = useState('')
  const { isOwner, permissions } = useSelector(state => state.user)
  useDispatch(() => {
    dispatch(fetchUserDetail())
  }, [dispatch])
  const fetchLabAppointment = async () => {
    try {
      const response = await getSecureApiData(`lab/appointment/${userId}`);
      if (response.success) {
        // setCurrentPage(response.pagination.page)
        // setTotalPage(response.pagination.totalPages)
        setAppointments(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  useEffect(() => {
    fetchLabAppointment()
  }, [userId])
  console.log(permissions, isOwner)
  useEffect(() => {
    if (!isOwner && !permissions?.patientDetails) {
      toast.error('You do not have permission to see patient deatails ')
      navigate(-1)
    }
  }, [isOwner, permissions])
  const fetchPtDemoData = async () => {
    if (!id) {
      return
    }
    try {
      const response = await getSecureApiData(`patient/demographic/${id}`)
      if (response.success) {
        setDemoData(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {

    }
  }
  const fetchPtData = async () => {
    if (!id) {
      return
    }
    try {
      const response = await getSecureApiData(`patient/${id}`)
      if (response.success) {
        setCustomId(response.customId)
        setPatientData(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {

    }
  }
  useEffect(() => {
    fetchPtDemoData()
    fetchPtData()
  }, [id])
  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--; // haven't had birthday yet this year
    }
    return age;
  };
  return (
    <>
      <div className="main-content flex-grow-1 p-3 overflow-auto">
        <form action="">
          <div className="row mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="innr-title">Patient Details</h3>
                <div className="admin-breadcrumb">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb custom-breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="#" className="breadcrumb-link">
                          Dashboard
                        </a>
                      </li>
                      <li className="breadcrumb-item">
                        <a href="#" className="breadcrumb-link">
                          Test  Request
                        </a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Patient Details
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="submega-main-bx">
          <div className="row">
            <div className="col-lg-12">
              {/* {appointments?.length > 0 &&
                appointments?.map((item, key) => */}
              <div className="patient-main-bx">
                <h5>Patient Details</h5>
                <div className="admin-table-bx">
                  <div className=" patient-details-bx mb-3 new-lab-patient-details">
                    <div className="admin-table-sub-bx patient-avartr-bx new-lab-profile-details gap-3">
                      <img src={patientData?.profileImage ? `${base_url}/${patientData?.profileImage}` : "/table-avatar.jpg"} alt="" />
                      <div className="admin-table-sub-details patient-bio-content">
                        <h6>{patientData?.name}</h6>
                        <p>ID: {customId}</p>
                      </div>
                    </div>

                    <div className="patient-social-bx">
                      <button type="button" className="patient-social-btn animate-btn"><FontAwesomeIcon icon={faPhone} /></button>
                      <a href="javascript:void(0)" className="patient-social-btn"><FontAwesomeIcon icon={faEnvelope} /></a>
                      <button href="javascript:void(0)" className="patient-social-btn"><FontAwesomeIcon icon={faMessage} /></button>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <ul className="patient-bio-list">
                      <li className="patient-bio-item"><img src="/person.png" alt="" /> Age :<span className="patient-bio-title"> {calculateAge(demoData?.dob)}</span> </li>
                      <li className="patient-bio-item"><img src="/gender.png" alt="" /> Gender :<span className="patient-bio-title"> {patientData?.gender}</span> </li>
                      <li className="patient-bio-item"><img src="/height.png" alt="" /> Height :<span className="patient-bio-title"> {demoData?.height} </span> </li>
                      <li className="patient-bio-item"><img src="/weight.png" alt="" /> Weight :<span className="patient-bio-title"> {demoData?.weight}</span> </li>
                      <li className="patient-bio-item"><img src="/blood.png" alt="" /> Blood Group :<span className="patient-bio-title"> {demoData?.bloodGroup}</span> </li>
                    </ul>
                    <div>
                      <NavLink to={`/patient-view/${id}`} className="option-rep-add-btn">View More</NavLink>
                    </div>
                  </div>



                </div>
              </div>
            </div>
          </div>
        </div>
        


      </div>
    </>
  )
}

export default PatientDetails