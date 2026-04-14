import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClose,
  faFilePdf,
  faPen
} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchUserDetail } from "../../redux/features/userSlice";
import base_url from "../../../baseUrl";

function ApproveProfile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userId = localStorage.getItem('userId')
  const { profiles, labPerson, labAddress, labImg,
    rating, avgRating, labLicense, isRequest, customId } = useSelector(state => state.user)
  useEffect(() => {
    dispatch(fetchUserDetail())
  }, [dispatch])
  const handleDownload = async (filePath) => {
    if (!filePath) return;

    const fileUrl = `${base_url}/${filePath}`;
    const fileName = filePath.split("\\").pop().split("-").pop();

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName; // forces download
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  useEffect(() => {
    if (profiles && profiles.status !== 'verify') {
      navigate('/profile')
    }
  }, [profiles])
  return (
    <>
      <div className="main-content flex-grow-1 p-3 overflow-auto">
        <div className="row mb-3">
          <div className="d-flex align-items-center justify-content-between sub-header-bx">
            <div>
              <h3 className="innr-title">Profile</h3>
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
                      Profile
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
            {/* <div className="add-nw-bx">
              <a href="javascript:void(0)" className="add-nw-btn nw-thm-btn sub-nw-brd-tbn"  >
                Send Profile Edit Request
              </a>
            </div> */}
          </div>
        </div>

        <div className="lab-chart-crd">
          <div className="row">
            <div className="col-lg-12">
              <div className="lab-tp-title patient-bio-tab lab-profile-bio-tab d-flex align-items-center justify-content-between py-2">
                <div>
                  <h6 className="mb-0">Profile</h6>
                </div>

                <div className="d-flex align-items-center gap-2">

                  <div className="approve-title">
                    <h5><span className="approve-right-check"><FontAwesomeIcon icon={faCheck} /></span> Approved Edit Request</h5>
                  </div>

                  <NavLink to={`/edit-profile/${userId}`} type="submit" className="nw-filtr-thm-btn" >Edit</NavLink>
                </div>

              </div>

              <div className="patient-bio-tab">
                <ul className="nav nav-tabs gap-3" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link active"
                      id="home-tab"
                      data-bs-toggle="tab"
                      href="#home"
                      role="tab"
                    >
                      Lab Profile
                    </a>
                  </li>

                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link"
                      id="profile-tab"
                      data-bs-toggle="tab"
                      href="#profile"
                      role="tab"
                    >
                      Lab Images
                    </a>
                  </li>

                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link"
                      id="contact-tab"
                      data-bs-toggle="tab"
                      href="#contact"
                      role="tab"
                    >
                      Lab Address
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link"
                      id="upload-tab"
                      data-bs-toggle="tab"
                      href="#upload"
                      role="tab"
                    >
                      Upload License And Certificate
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link"
                      id="person-tab"
                      data-bs-toggle="tab"
                      href="#person"
                      role="tab"
                    >
                      Contact Person
                    </a>
                  </li>
                </ul>

                <div className="tab-content mt-4" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="home"
                    role="tabpanel"
                  >
                    <div className="sub-tab-brd">
                      <form action="">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="lab-profile-mega-bx">
                              <div className="lab-profile-avatr-bx">
                                <img src={profiles?.logo ? `${base_url}/${profiles?.logo}` : "/profile-tab-avatar.png"} alt="" />
                                <div className="lab-profile-edit-avatr">
                                  <a href="javascript:void(0)" className="edit-btn cursor-pointer">
                                    <FontAwesomeIcon icon={faPen} />
                                  </a>
                                </div>
                                {/* <input
                                  type="file"
                                  accept=""
                                  className="lab-profile-file-input"
                                /> */}
                              </div>

                              <div>
                                <h4 className="lg_title ">{profiles?.name}</h4>
                                <p className="first_para">ID : #{customId}</p>
                              </div>



                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Laboratory Name</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={profiles?.name}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Mobile Number</label>
                              <input
                                type="number"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={profiles?.contactNumber}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Email Number</label>
                              <input
                                type="email"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={profiles?.email}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Gst Number</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={profiles?.gstNumber}
                              />
                            </div>
                          </div>

                          <div className="col-lg-12">
                            <div className="custom-frm-bx">
                              <label htmlFor="">About</label>
                              <textarea name="" id="" className="form-control patient-frm-control" value={profiles?.about}></textarea>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="tab-pane fade" id="profile" role="tabpanel">
                    <div className="sub-tab-brd lab-thumb-bx">
                      <div className="row mb-3">
                        <h5>Thumbnail image</h5>
                        <div className="col-lg-4">
                          <div className="lab-images-bx">
                            <img src={labImg?.thumbnail ? `${base_url}/${labImg?.thumbnail}` : "/thumb.png"} alt="" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <h5>Image</h5>
                        {labImg?.labImg?.length > 0 &&
                          labImg?.labImg?.map((item, key) =>
                            <div className="col-lg-4 mb-3" key={key}>
                              <div className="lab-multi-image-bx">
                                <img src={item ? `${base_url}/${item}` : "/pic-first.png"} alt="" />
                              </div>
                            </div>)}
                        {/* <div className="col-lg-4 mb-3">
                          <div className="lab-multi-image-bx">
                            <img src="/pic-two.png" alt="" />
                          </div>
                        </div>
                        <div className="col-lg-4 mb-3">
                          <div className="lab-multi-image-bx">
                            <img src="/pic-three.png" alt="" />
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  <div className="tab-pane fade" id="contact" role="tabpanel">
                    <div className="sub-tab-brd ">
                      <form action="">
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Full Address</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labAddress?.fullAddress}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Country</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labAddress?.countryId?.name}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">State</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labAddress?.stateId?.name}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">City</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labAddress?.cityId?.name}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Pin Code</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labAddress?.pinCode}
                              />
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="tab-pane fade" id="upload" role="tabpanel">
                    <div className="sub-tab-brd lab-thumb-bx">
                      <form action="">
                        <div className="row">
                          <h5>License Details</h5>
                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Lab License Number</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labLicense?.labLicenseNumber}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Lab License  Documents</label>
                              <div className="form-control lablcense-frm-control">
                                <div className="lablcense-bx">
                                  <div>
                                    <h6 ><FontAwesomeIcon icon={faFilePdf} style={{ color: "#EF5350" }} />  {labLicense?.licenseFile?.split("\\").pop()?.split("-").pop()}</h6>
                                  </div>
                                  <div className="">
                                    <button type="button" className="pdf-download-tbn" onClick={() => handleDownload(labLicense?.licenseFile)}>Download</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <h5>Certified  </h5>
                          </div>


                          {labLicense?.labCert?.map((item, key) =>
                            <>
                              <div className="col-lg-6">
                                <div className="custom-frm-bx">
                                  <label htmlFor="">Certified Name</label>
                                  <input
                                    type="email"
                                    className="form-control patient-frm-control"
                                    placeholder=""
                                    value={item?.certName}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-6">
                                <div className="custom-frm-bx">
                                  <label htmlFor="">Certified Documents</label>
                                  <div className="form-control lablcense-frm-control">
                                    <div className="lablcense-bx">
                                      <div>
                                        <h6 ><FontAwesomeIcon icon={faFilePdf} style={{ color: "#EF5350" }} />  {item?.certFile?.split("\\").pop()?.split("-").pop()}</h6>
                                      </div>
                                      <div className="">
                                        <button type="button" className="pdf-download-tbn" onClick={() => handleDownload(item?.certFile)}>Download</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>)}
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="person" role="tabpanel">
                    <div className="sub-tab-brd">
                      <form action="">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="lab-profile-mega-bx">
                              <div className="lab-profile-avatr-bx lab-contact-prson">
                                <img src={labPerson?.photo ? `${base_url}/${labPerson?.photo}` : "/user-avatar.png"} alt="" />
                                <div className="lab-profile-edit-avatr">
                                  <a href="javascript:void(0)" className="edit-btn cursor-pointer">
                                    <FontAwesomeIcon icon={faPen} />
                                  </a>
                                </div>
                                <input
                                  type="file"
                                  accept=""
                                  className="lab-profile-file-input"
                                />
                              </div>

                              <div>
                                <h4 className="lg_title ">{labPerson?.name}</h4>
                              </div>



                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Name</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labPerson?.name}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Mobile Number</label>
                              <input
                                type="number"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labPerson?.contactNumber}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Email Number</label>
                              <input
                                type="email"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labPerson?.email}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="custom-frm-bx">
                              <label htmlFor="">Gender</label>
                              <input
                                type="text"
                                className="form-control patient-frm-control"
                                placeholder=""
                                value={labPerson?.gender}
                              />
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-end mt-3">
          <Link to={-1} className="nw-thm-btn rounded-3 outline" >
            Go Back
          </Link>
        </div>
      </div>

      {/*Payment Status Popup Start  */}
      {/* data-bs-toggle="modal" data-bs-target="#edit-Request" */}
      <div className="modal step-modal" id="edit-Request" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5 p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="lg_title mb-0">Edit Request from Admin</h6>
              </div>
              <div>
                <button type="button" className="" data-bs-dismiss="modal" aria-label="Close">
                  <FontAwesomeIcon icon={faClose} />
                </button>
              </div>
            </div>
            <div className="modal-body p-0">
              <div className="row ">
                <div className="col-lg-12 mt-5">
                  <div className="edit-request-bx">
                    <div className="float-left">
                      <img src="/edit-reqest.png" alt="" />
                    </div>
                    <div className="float-right">
                      <p>You can edit your profile when you click on the request button. The edit option will appear after your request is approved. After making changes, click on save and you will have to wait for approval
                      </p>
                    </div>
                  </div>

                  <div className="custom-frm-bx">
                    <label htmlFor="">Note</label>
                    <textarea name="" id="" className="form-control"></textarea>

                  </div>

                  <div>
                    <button type="submit" className="nw-thm-btn w-100"> Send Edit Request </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  Payment Status Popup End */}

    </>
  )
}

export default ApproveProfile