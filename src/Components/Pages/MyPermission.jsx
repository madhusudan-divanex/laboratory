import { PiTagChevronFill } from "react-icons/pi";
import { updateApiData } from "../../services/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function MyPermission() {
    const userId = localStorage.getItem("userId");
    const { id: permissionId, name } = useParams();
    const {permissions}=useSelector(state=>state.user)
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        permissionId,
        ownerId: userId,
        name,
        lab: {

            testRequest: false,
            addTest: false,
            editTest: false,
            viewReport: false,
            billing:false,
            export: false,
            editReport: false,
            patientDetails: false,
            appointmentDetails: false,
            sendReportMail: false,
            printReport: false,
            addReport: false,
            patientCall: false,
            paymentStatus: false,
            appointmentStatus: false,
            chat: false,
        }
    });

   

    /* ✅ load existing permission safely */
    useEffect(() => {
        if (storedPermission?.permissions) {
            setFormData(prev => ({
                ...prev,
                permissionId,
                ownerId: userId,
                name,
                lab: {
                    ...prev.lab,
                    ...permissions
                }
            }));
        }
    }, []);

   

    return (
        <>
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <form>
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="innr-title">Permission</h3>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="submega-main-bx">
                    <form onSubmit={updateLabPermission}>
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12">

                                {/* Test Request */}
                                <div className="permission-check-main-bx">
                                    <h4><PiTagChevronFill /> Test Request Management</h4>
                                    <div className="form-check custom-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={formData.lab.testRequest}
                                        />

                                        <label className="form-check-label">Test Request</label>
                                    </div>
                                </div>

                                {/* Tests */}
                                <div className="permission-check-main-bx my-4">
                                    <h4><PiTagChevronFill /> Tests Management</h4>
                                    <ul className="permision-check-list">
                                        {["addTest", "editTest",].map(key => (
                                            <li key={key}>
                                                <div className="form-check custom-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={formData.lab[key]}
                                                    />
                                                    <label className="form-check-label">
                                                        {key.replace(/([A-Z])/g, " $1")}
                                                    </label>
                                                </div>
                                            </li>
                                        ))}

                                    </ul>
                                </div>

                                {/* Reports */}
                                <div className="permission-check-main-bx my-4">
                                    <h4><PiTagChevronFill /> Lab Reports Management</h4>
                                    <ul className="permision-check-list">
                                        {[
                                            "viewReport",
                                            "editReport",
                                            "patientDetails",
                                            "appointmentDetails",
                                            "sendReportMail",
                                            "printReport",
                                            "addReport",
                                            "patientCall",
                                            "paymentStatus",
                                            "appointmentStatus",
                                            "billing"
                                        ].map(key => (
                                            <li key={key}>
                                                <div className="form-check custom-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={formData.lab[key]}
                                                    />
                                                    <label className="form-check-label text-capitalize">
                                                        {key.replace(/([A-Z])/g, " $1")}
                                                    </label>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Chat */}
                                <div className="permission-check-main-bx">
                                    <h4><PiTagChevronFill /> Chat Management</h4>
                                    <div className="form-check custom-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="chat"
                                            checked={formData.lab.chat}
                                        />
                                        <label className="form-check-label">Chat</label>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <Link to={-1} className="nw-filtr-thm-btn rounded-3 outline" >
                                        Go Back
                                    </Link>
                                    <button type="submit" className="nw-filtr-thm-btn">
                                        Save
                                    </button>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default MyPermission;
