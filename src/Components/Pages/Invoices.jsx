import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faSearch,

} from "@fortawesome/free-solid-svg-icons";

function Invoices() {
  return (
    <>
      <div className="main-content flex-grow-1 p-3 overflow-auto">
        <form action="">
          <div className="row mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="innr-title">Invoices</h3>
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
                        Invoices
                      </li>
                    </ol>
                  </nav>
                </div>
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
                      <th>Appointment  ID</th>
                      <th>Appointment  date</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    <tr>
                      <td>01.</td>
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
                        #0959595
                      </td>
                      <td>
                        20 jun 2025
                      </td>
                      <td>
                        $25
                      </td>
                      <td>
                        <span className="paid-title"> Paid</span>
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
                        #0959595
                      </td>
                      <td>
                        20 jun 2025
                      </td>
                      <td>
                        $25
                      </td>
                      <td>
                        <span className="paid-title"> Paid</span>
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
                        #0959595
                      </td>
                      <td>
                        20 jun 2025
                      </td>
                      <td>
                        $25
                      </td>
                      <td>
                        <span className="paid-title"> Paid</span>
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
                      <td>04.</td>
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
                        #0959595
                      </td>
                      <td>
                        20 jun 2025
                      </td>
                      <td>
                        $25
                      </td>
                      <td>
                        <span className="paid-title"> Paid</span>
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
                      <td>05.</td>
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
                        #0959595
                      </td>
                      <td>
                        20 jun 2025
                      </td>
                      <td>
                        $25
                      </td>
                      <td>
                        <span className="paid-title"> Paid</span>
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
    </>
  )
}

export default Invoices