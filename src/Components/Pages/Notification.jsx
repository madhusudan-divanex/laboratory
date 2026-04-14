import { faBell, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { deleteApiData, getSecureApiData } from "../../services/api"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from 'date-fns';
import { Link } from "react-router-dom";
function Notification() {
    const userId = localStorage.getItem('userId')
    const [allData, setAllData] = useState()
    const [totalPages, setTotalPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    async function fetchNotifications() {
        try {
            const result = await getSecureApiData(`api/comman/notification`)
            if (result.success) {
                setAllData(result.data)
                setTotalPage(result.pagination.totalPages)
                setCurrentPage(result.pagination.page)
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        if (userId) {
            fetchNotifications()
        }
    }, [userId])
    async function deleteNotifications() {
        try {
            const result = await deleteApiData(`api/comman/delete-all-notification`)
            if (result.success) {
                fetchNotifications()
            }
        } catch (error) {

        }
    }
    async function deleteOneNotifications(id) {
        try {
            const result = await deleteApiData(`api/comman/delete-notification/${id}`)
            if (result.success) {
                fetchNotifications()
            }
        } catch (error) {

        }
    }
    return (
        <>
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <div className="row ">
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h3 className="innr-title mb-2 gradient-text">Notification</h3>
                            <div className="admin-breadcrumb">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb custom-breadcrumb">
                                        <li className="breadcrumb-item">
                                            <a href="#" className="breadcrumb-link">
                                                Dashboard
                                            </a>
                                        </li>
                                        <li
                                            className="breadcrumb-item active"
                                            aria-current="page"
                                        > Notification
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        {allData?.length > 0 && <div>
                            <button type="button" onClick={() => deleteNotifications()} className="nw-thm-btn ">All  Delete </button>
                        </div>}

                    </div>
                </div>

                <div className='lab-chart-crd patient-bio-tab lab-profile-bio-tab'>
                    <div className="row">
                        <div className="col-lg-12 col-dm-12 col-sm-12">

                            {allData?.length > 0 ?
                                allData?.map((item, key) =>
                                    <div className="notification-card" key={key}>
                                        <div className="notification-parent-card">
                                            <div className="notification-sub-card">
                                                <div>
                                                    <span className="notifi-icon-bx"><FontAwesomeIcon icon={faBell} /></span>
                                                </div>
                                                <div className="notification-content">
                                                    <h5>{item?.title}</h5>
                                                    <p>{item?.message}</p>
                                                </div>
                                            </div>
                                            <div className="notification-timing">
                                                <span><button onClick={() => deleteOneNotifications(item?._id)} className="notifi-remv-btn"><FontAwesomeIcon icon={faTrash} /></button></span>
                                                <h6 className="text-capitalize">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</h6>
                                            </div>
                                        </div>
                                    </div>) : 'No notification '}


                        </div>
                    </div>

                </div>
                <div className="text-end mt-4">
                    <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                        Go Back
                    </Link>
                </div>




            </div>
        </>
    )
}

export default Notification