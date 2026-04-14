import { faLocationDot, faPaperPlane,faPrint} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function InvoiceDetails() {
    return (
        <>
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <form action="">
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="innr-title">Invoice Details</h3>
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
                                                    Invoices
                                                </a>
                                            </li>
                                            <li
                                                className="breadcrumb-item active"
                                                aria-current="page"
                                            >
                                                Invoice Details
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="submega-main-bx ">
                    <div className="invoice-details-crd">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="lab-tp-title invoice-tp-bx">
                                    <div className='invoice-logo-bx'>
                                        <img src="/lab-logo.png" alt="" />
                                    </div>

                                    <div>
                                        <h4 className='lg_title text-white'>Advance Lab Tech</h4>
                                        <p className='subtitle text-white mb-0'><FontAwesomeIcon icon={faLocationDot} /> 123 Oak Street, Jaipur</p>
                                    </div>

                                </div>

                                <div className="patient-bio-tab">

                                    <div className='invoice-user-details'>
                                        <div className='patient-main-bx'>
                                            <h5>Patient Details</h5>
                                            <ul className='invoice-patient-usr-list'>
                                                <li className='invoice-patient-item'><span className='invoice-patient-title'>Sunil Kumar Sharma</span></li>
                                                <li className='invoice-patient-item'>ID: SUNIL33209490</li>
                                            </ul>
                                        </div>


                                        <div className='patient-main-bx'>
                                            <h5 className='text-end'>Appointment  Details</h5>
                                            <ul className='invoice-appointment-list'>
                                                <li className='invoice-appointment-item'>Appointment ID : <span className='invoice-appointment-title'> #0959595</span></li>
                                                <li className='invoice-appointment-item'>Appointment date : <span className='invoice-appointment-title'> 20 June 2025, at 10:00pm</span></li>
                                                <li className='invoice-appointment-item'>Visited  date :  <span className='invoice-appointment-title'> 21 June 2025</span></li>
                                                <li className='invoice-appointment-item'>Appointment Completed date  : <span className='invoice-appointment-title'> 22 June 2025</span></li>

                                            </ul>
                                        </div>
                                    </div>


                                    <div className="table-section mega-table-section invoice-table-report-section">
                                        <div className="table table-responsive mb-0">
                                            <table className="table mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Test</th>
                                                        <th >Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>CBC</td>
                                                        <td>
                                                            $25
                                                        </td>
                                                    </tr>
                                                </tbody> 

                                            
                                            </table>
                                        </div>

                                         <div className='total-reporting-print-bx me-3'>
                                                    <ul className='total-amount-list'>
                                                        <li className='total-amount-item'>Total Amount : <span className='total-amount-title'> $25</span></li>
                                                        <li className='total-amount-item'>Payment Status : <span className='status-paid-title'> Paid</span></li>
                                                    </ul>
                                            </div>


                                    </div>

                                </div>

                                


                            </div>

                            

                        </div>


                        



                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-3">
                                                    <button type="submit" className="nw-filtr-thm-btn" data-bs-toggle="modal" data-bs-target="#edit-Request" ><FontAwesomeIcon icon={faPaperPlane}/> Send  invoice  Email</button>

                                                    <button type="submit" className="nw-meeting-thm-btn" ><FontAwesomeIcon icon={faPrint}/> Print</button>
                                                </div>


                </div>


            </div>
        </>
    )
}

export default InvoiceDetails