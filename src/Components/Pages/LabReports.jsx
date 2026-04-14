import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faGear,
  faPen,
  faSearch,

} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSecureApiData } from "../../services/api";
import { useParams } from "react-router-dom";

function LabReports() {

  return (
    <>
      <div className="main-content flex-grow-1 p-3 overflow-auto">
        <form action="">
          <div className="row mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="innr-title"> Lab Reports</h3>
                <div className="admin-breadcrumb">
                  <nav aria-label="breadcrumb">
                    <ol class="breadcrumb custom-breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="#" className="breadcrumb-link">
                          Dashboard
                        </a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Lab Reports
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>

              <div className="add-nw-bx">
                <a
                  href="javascript:void(0)"
                  className="add-nw-btn nw-filtr-thm-btn "
                >
                  <img src="/export.png" alt="" /> Export
                </a>
              </div>
            </div>

            <div className="col-lg-2">
              <div className="custom-frm-bx">
                <select class="form-select ">
                  <option>All</option>
                </select>
              </div>
            </div>
            <div className="col-lg-2">
              <div className="custom-frm-bx">
                <select class="form-select ">
                  <option>All</option>
                </select>
              </div>
            </div>
            <div className="col-lg-2">
              <div className="custom-frm-bx">
                <select class="form-select ">
                  <option>All</option>
                </select>
              </div>
            </div>
            <div className="col-lg-2">
              <div>
                <a href="javascript:void(0)" className="nw-thm-btn">
                  Filter
                </a>
              </div>
            </div>
          </div>
        </form>

        <div className="row ">
          <div className="d-flex align-items-center justify-content-between">
            <div className="custom-frm-bx">
              <input type="text" className="form-control" placeholder="Search " />

              <div className="search-item-bx">
                <button className="search-item-btn"><FontAwesomeIcon icon={faSearch} /></button>
              </div>

            </div>

            <div>
              <div className="page-selector d-flex align-items-center">

                <div className="custom-frm-bx">
                  <select className="form-select custom-page-dropdown">
                    <option value="1" selected>1</option>
                    <option value="2">2</option>
                  </select>
                </div>

              </div>
            </div>
          </div>



        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div class="table-section mega-table-section">
              <div class="table table-responsive mb-0">
                <table class="table mb-0">
                  <thead>
                    <tr>
                      <th>S.no.</th>
                      <th>Patient Details</th>
                      <th>Appointment ID</th>
                      <th>Test</th>
                      <th>Payment Status</th>
                      <th>Appointment Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {appointments?.length > 0 &&
                      appointments?.map((item, key) =>
                        <tr key={key}>
                          <td>{key + 1}</td>
                          <td>
                            <div className="admin-table-bx">
                              <div className="admin-table-sub-bx">
                                <img src="/table-avatar.jpg" alt="" />
                                <div className="admin-table-sub-details">
                                  <h6>{item?.patientId?.name} </h6>
                                  <p>ID: {item?.patientId?.customId}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <ul className="admin-appointment-list">
                              <li className="admin-appoint-item">
                                <span className="admin-appoint-id">
                                  Appointment ID : #{item?.customId}
                                </span>
                              </li>
                              <li className="admin-appoint-item">
                                Appointment Book Date : 20 jun 2025
                              </li>
                              <li className="admin-appoint-item">
                                Total Amount : ${item?.fees}
                              </li>
                            </ul>
                          </td>
                          <td>
                            <ul className="admin-test-list">
                              <li className="admin-test-item">CBC</li>
                              <li className="admin-test-item">Haemoglobin</li>
                            </ul>
                          </td>
                          <td>
                            <ul className="admin-paid-list">
                              <li>

                                <span className="paid">Paid</span>
                              </li>
                              <li>
                                <a
                                  href="javascript:void(0)"
                                  className="edit-btn" data-bs-toggle="modal" data-bs-target="#payment-Status"
                                >
                                  <FontAwesomeIcon icon={faPen} />
                                </a>
                              </li>
                            </ul>
                          </td>
                          <td>
                            <ul className="admin-paid-list">
                              <li>

                                <span className="paid">
                                  Deliver Report
                                </span>
                              </li>
                              <li>
                                <a
                                  href="javascript:void(0)"
                                  className="edit-btn" data-bs-toggle="modal" data-bs-target="#appointment-Status"
                                >
                                  <FontAwesomeIcon icon={faPen} />
                                </a>
                              </li>
                            </ul>
                          </td>
                          <td>
                            <a
                              href="javascript:void(0)"
                              className=" admin-sub-dropdown dropdown-toggle"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >

                              <FontAwesomeIcon icon={faGear} /> Action
                            </a>

                            <div class="dropdown">
                              <a
                                href="javascript:void(0)"
                                class="attendence-edit-btn"
                                id="acticonMenu1"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                {/* <i class="fas fa-pen"></i> */}
                              </a>
                              <ul
                                class="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                                aria-labelledby="acticonMenu1"
                              >
                                <li className="drop-item">
                                  <a
                                    class="nw-dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#attendance-edit"
                                  >
                                    <img src="/flask-report.png" alt="" />
                                    Edit Report
                                  </a>
                                </li>
                                <li className="drop-item">
                                  <a class="nw-dropdown-item" href="#">
                                    <img src="/add-user.png" alt="" />
                                    Patient Details
                                  </a>
                                </li>
                                <li className="drop-item">
                                  <a class="nw-dropdown-item" href="#">
                                    <img src="/flask-report.png" alt="" />
                                    Appointment Details
                                  </a>
                                </li>

                                <li className="drop-item">
                                  <a class="nw-dropdown-item" href="#">
                                    <img src="/report-mail.png" alt="" />
                                    Send  Report  Email
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>)}

                    <tr>
                      <td>02.</td>
                      <td>
                        <div className="admin-table-bx">
                          <div className="admin-table-sub-bx">
                            <img src="/table-avatar.jpg" alt="" />
                            <div className="admin-table-sub-details">
                              <h6>Sunil </h6>
                              <p>ID: SUNIL3320</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <ul className="admin-appointment-list">
                          <li className="admin-appoint-item">
                            <span className="admin-appoint-id">
                              Appointment ID : #0959595
                            </span>
                          </li>
                          <li className="admin-appoint-item">
                            Appointment Book Date : 20 jun 2025
                          </li>
                          <li className="admin-appoint-item">
                            Total Amount : $25
                          </li>
                        </ul>
                      </td>
                      <td>
                        <ul className="admin-test-list">
                          <li className="admin-test-item">CBC</li>
                          <li className="admin-test-item">Haemoglobin</li>
                        </ul>
                      </td>
                      <td>
                        <ul className="admin-paid-list">
                          <li>

                            <span className="paid due">Due</span>
                          </li>
                          <li>
                            <a
                              href="javascript:void(0)"
                              className="edit-btn" data-bs-toggle="modal" data-bs-target="#payment-Status"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </a>
                          </li>
                        </ul>
                      </td>
                      <td>
                        <ul className="admin-paid-list">
                          <li>

                            <span className="paid pending">
                              Visit Pending
                            </span>
                          </li>
                          <li>
                            <a
                              href="javascript:void(0)"
                              className="edit-btn" data-bs-toggle="modal" data-bs-target="#appointment-Status"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </a>
                          </li>
                        </ul>
                      </td>
                      <td>
                        <a
                          href="javascript:void(0)"
                          className=" admin-sub-dropdown dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >

                          <FontAwesomeIcon icon={faGear} /> Action
                        </a>

                        <div class="dropdown">
                          <a
                            href="javascript:void(0)"
                            class="attendence-edit-btn"
                            id="acticonMenu1"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {/* <i class="fas fa-pen"></i> */}
                          </a>
                          <ul
                            class="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                            aria-labelledby="acticonMenu1"
                          >
                            <li className="drop-item">
                              <a
                                class="nw-dropdown-item"
                                href="#"
                                data-bs-toggle="modal"
                                data-bs-target="#attendance-edit"
                              >
                                <img src="/flask-report.png" alt="" />
                                Edit Report
                              </a>
                            </li>
                            <li className="drop-item">
                              <a class="nw-dropdown-item" href="#">
                                <img src="/add-user.png" alt="" />
                                Patient Details
                              </a>
                            </li>
                            <li className="drop-item">
                              <a class="nw-dropdown-item" href="#">
                                <img src="/flask-report.png" alt="" />
                                Appointment Details
                              </a>
                            </li>

                            <li className="drop-item">
                              <a class="nw-dropdown-item" href="#">
                                <img src="/report-mail.png" alt="" />
                                Send  Report  Email
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td>03.</td>
                      <td>
                        <div className="admin-table-bx">
                          <div className="admin-table-sub-bx">
                            <img src="/table-avatar.jpg" alt="" />
                            <div className="admin-table-sub-details">
                              <h6>Sunil </h6>
                              <p>ID: SUNIL3320</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <ul className="admin-appointment-list">
                          <li className="admin-appoint-item">
                            <span className="admin-appoint-id">
                              Appointment ID : #0959595
                            </span>
                          </li>
                          <li className="admin-appoint-item">
                            Appointment Book Date : 20 jun 2025
                          </li>
                          <li className="admin-appoint-item">
                            Total Amount : $25
                          </li>
                        </ul>
                      </td>
                      <td>
                        <ul className="admin-test-list">
                          <li className="admin-test-item">CBC</li>
                          <li className="admin-test-item">Haemoglobin</li>
                        </ul>
                      </td>
                      <td>
                        <ul className="admin-paid-list">
                          <li>

                            <span className="paid due">Due</span>
                          </li>
                          <li>
                            <a
                              href="javascript:void(0)"
                              className="edit-btn" data-bs-toggle="modal" data-bs-target="#payment-Status"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </a>
                          </li>
                        </ul>
                      </td>
                      <td>
                        <ul className="admin-paid-list">
                          <li>

                            <span className="paid visited">
                              Visited
                            </span>
                          </li>
                          <li>
                            <a
                              href="javascript:void(0)"
                              className="edit-btn" data-bs-toggle="modal" data-bs-target="#appointment-Status"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </a>
                          </li>
                        </ul>
                      </td>
                      <td>
                        <a
                          href="javascript:void(0)"
                          className=" admin-sub-dropdown dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >

                          <FontAwesomeIcon icon={faGear} /> Action
                        </a>

                        <div class="dropdown">
                          <a
                            href="javascript:void(0)"
                            class="attendence-edit-btn"
                            id="acticonMenu1"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {/* <i class="fas fa-pen"></i> */}
                          </a>
                          <ul
                            class="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                            aria-labelledby="acticonMenu1"
                          >
                            <li className="drop-item">
                              <a
                                class="nw-dropdown-item"
                                href="#"
                                data-bs-toggle="modal"
                                data-bs-target="#attendance-edit"
                              >
                                <img src="/flask-report.png" alt="" />
                                Edit Report
                              </a>
                            </li>
                            <li className="drop-item">
                              <a class="nw-dropdown-item" href="#">
                                <img src="/add-user.png" alt="" />
                                Patient Details
                              </a>
                            </li>
                            <li className="drop-item">
                              <a class="nw-dropdown-item" href="#">
                                <img src="/flask-report.png" alt="" />
                                Appointment Details
                              </a>
                            </li>

                            <li className="drop-item">
                              <a class="nw-dropdown-item" href="#">
                                <img src="/report-mail.png" alt="" />
                                Send  Report  Email
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/*Payment Status Popup Start  */}
      {/* data-bs-toggle="modal" data-bs-target="#payment-Status" */}
      <div className="modal step-modal fade" id="payment-Status" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5 p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="lg_title mb-0">Payment Status</h6>
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
                  <div className="custom-frm-bx">
                    <label htmlFor="">Status</label>
                    <select className="form-select ">
                      <option>Due</option>
                    </select>
                  </div>

                  <div>
                    <button type="submit" className="nw-thm-btn w-100"> Submit</button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  Payment Status Popup End */}


      {/*Appointment Popup Start  */}
      {/* data-bs-toggle="modal" data-bs-target="#appointment-Status" */}
      <div className="modal step-modal fade" id="appointment-Status" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5">
            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
              <div>
                <h6 className="lg_title mb-0">Appointment Status</h6>
              </div>
              <div>
                <button type="button" className="" data-bs-dismiss="modal" aria-label="Close">
                  <FontAwesomeIcon icon={faClose} />
                </button>
              </div>
            </div>
            <div className="modal-body px-4 py-4">
              <div className="row ">
                <div className="col-lg-12 ">
                  <div className="custom-frm-bx">
                    <label htmlFor="">Status</label>
                    <select className="form-select ">
                      <option>Visit Pending</option>
                    </select>
                  </div>

                  <div>
                    <button type="submit" className="nw-thm-btn w-100"> Submit</button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Appointment Popup End */}
    </>
  );
}

export default LabReports;
