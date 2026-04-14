import { FaFlask } from "react-icons/fa6";
import { BsFillFileImageFill } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FaPlusCircle } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { securePostData } from "../../services/api";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetail } from "../../redux/features/userSlice";

function Wating() {
    const [isShow, setIsShow] = useState(true)
    
    return (
        <>


            {/*Edit Profile Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#edit-Request" */}
            {isShow &&
                <div className="modal show fade step-modal" id="edit-Request" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                    aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ display: "block" }}  >
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content edit-modal-content rounded-5 p-5">
                            <div className="modal-body p-0">
                                <div className="row justify-content-center">
                                    <div className="col-lg-9">
                                        <div className="text-center your-document-mega-dv">
                                            <div className="submit-document-bx">
                                                <FontAwesomeIcon icon={faCopy} className="document-icon" />
                                                <div className="timr-bx">
                                                    <img src="/timer.png" alt="" />
                                                </div>
                                            </div>
                                            <h6 className="fz-16 fw-400 text-white my-3">Your documents have been submitted for verification. This may take up to 48 hours. You’ll be notified once approved.</h6>

                                            <p className="mt-4">“Your KYC verification is in progress. You can continue browsing but cannot access patient data until approval.”</p>

                                            <div className="mt-5">
                                                <Link to='/login' onClick={() => localStorage.clear()} className="thm-btn w-75" >OK</Link>
                                            </div>


                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            {/*  Edit Profile Popup End */}



        </>
    )
}

export default Wating