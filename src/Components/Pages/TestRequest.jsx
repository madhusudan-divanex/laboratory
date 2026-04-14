import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faSearch } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

function TestRequest() {
    return (
        <>
              <div className="main-content flex-grow-1 p-3 overflow-auto">
                        <form action="">
                            <div className="row mb-3">
                                <div>
                                    <h3 className="innr-title">Appointment Request</h3>
                                    <div className="admin-breadcrumb mb-3">
                                        <nav aria-label="breadcrumb">
                                            <ol class="breadcrumb custom-breadcrumb justify-content-start">
                                                <li className="breadcrumb-item">
                                                    <NavLink to="/dashboard" className="breadcrumb-link">
                                                        Dashboard
                                                    </NavLink>
                                                </li>
                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Appointment Request
                                                </li>
                                            </ol>
                                        </nav>
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
                                        <input type="date" className="form-control" />
                                    </div>
                                </div>
                                <div className="col-lg-2">
                                    <div className="custom-frm-bx">
                                        <input type="date" className="form-control" />
                                    </div>
                                </div>

                                <div className="col-lg-2">
                                    <div>
                                        <a href="javascript:void(0)" className="nw-thm-btn" >Filter</a>
                                    </div>
                                </div>

                            </div>
                        </form>

                            <div className="row justify-content-between">
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
                                                    <th>Patient Name</th>
                                                    <th>Date</th>
                                                    <th>Test</th>
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
                                                    <td>20 Jun 2025</td>
                                                    <td>CBC</td>
                                                    <td>
                                                        <ul className="test-action-list">
                                                            <li className="test-action-item">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="test-right-btn"
                                                                >
                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                </a>
                                                            </li>
                                                            <li className="test-action-item">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="test-right-btn test-close-btn"
                                                                >
                                                                    <FontAwesomeIcon icon={faClose} />
                                                                </a>
                                                            </li>
                                                        </ul>
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
                                                    <td>20 Jun 2025</td>
                                                    <td>CBC</td>
                                                    <td>
                                                        <span className="approved">Approved</span>
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
                                                    <td>20 Jun 2025</td>
                                                    <td>CBC</td>
                                                    <td>
                                                        <ul className="test-action-list">
                                                            <li className="test-action-item">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="test-right-btn"
                                                                >
                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                </a>
                                                            </li>
                                                            <li className="test-action-item">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="test-right-btn test-close-btn"
                                                                >
                                                                    <FontAwesomeIcon icon={faClose} />
                                                                </a>
                                                            </li>
                                                        </ul>
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
                                                    <td>20 Jun 2025</td>
                                                    <td>CBC</td>
                                                    <td>
                                                        <span className="approved reject">Reject</span>
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
                                                    <td>20 Jun 2025</td>
                                                    <td>CBC</td>
                                                    <td>
                                                        <ul className="test-action-list">
                                                            <li className="test-action-item">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="test-right-btn"
                                                                >
                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                </a>
                                                            </li>
                                                            <li className="test-action-item">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="test-right-btn test-close-btn"
                                                                >
                                                                    <FontAwesomeIcon icon={faClose} />
                                                                </a>
                                                            </li>
                                                        </ul>
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
    );
}

export default TestRequest;
