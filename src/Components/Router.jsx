import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import TestRequest from "./Pages/TestRequest";
import Tests from "./Pages/Tests";
import LabReports from "./Pages/LabReports";
import AppLayout from "./Layouts/AppLayout";
import Invoices from "./Pages/Invoices";
import Permission from "./Pages/Permission";
import EmployeeList from "./Pages/EmployeeList.JSX";
import ChangePassword from "./Pages/ChangePassword";
import PatientDetails from "./Pages/PatientDetails";
import Profile from "./Pages/Profile";
import PermissionCheck from "./Pages/PermissionCheck";
import Login from "./Auth/Login";
import ForgotPassword from "./Auth/ForgotPassword";
import Otp from "./Auth/Otp";
import SetPassword from "./Auth/SetPassword";
import CreateAccount from "./Auth/CreateAccount";
import AddEmployee from "./Pages/AddEmployee";
import ViewEmployee from "./Pages/ViewEmployee";
import TestReports from "./Pages/LabTestReports";
import EditProfile from "./Pages/EditProfile";
import AppointmentDetails from "./Pages/AppointmentDetails";
import LabTestReports from "./Pages/LabTestReports";
import Reports from "./Pages/Reports";
import InvoiceDetails from "./Pages/InvoiceDetails";
import Chat from "./Pages/Chat";
import CreateAccountImage from "./Auth/CreateAccountImage";
import CreateAccountAddress from "./Auth/CreateAccountAddress";
import CreateAccountPerson from "./Auth/CreateAccountPerson";
import Error from "./Pages/Error";
import CreateAccountUpload from "./Auth/CreateAccountUpload";
import ApproveProfile from "./Pages/ApproveProfile";
import PatientsView from "./Pages/PatientsView";
import Labels from "./Pages/Labels";
import ReportsTabs from "./Pages/ReportsTabs";
import AppointmentRequest from "./Pages/AppointmentRequest";
import TestReportsAppoiments from "./Pages/TestReportsAppoiments";
import NewInvoice from "./Pages/NewInvoice";
import ReportView from "./Pages/ReportView";
import Notification from "./Pages/Notification";
import EditTest from "./Pages/EditTest";
import ProtectedRoute from "./ProtectedRoute";
import Wating from "./Auth/Wating";
import AddAppointment from "./Pages/AddAppointment";
import LandingPage from "./Pages/LandingPage";
import LandingApp from "./Landing Layout/LandingApp";
import TermAndCondition from "./CMS/TermAndCondition";
import PrivacyPolicy from "./CMS/PrivacyPolicy";
import GovermentHealth from "./CMS/GovernmentHealth";
import ClinicalSafetyStatement from "./CMS/ClinicalSafetyStatement";
import NeoAi from "./Pages/NeoAi";
import Slots from "./Pages/Slots";
import NeoHealthCardLabTemplates from "./Pages/Billing";
import Departments from "./Pages/Departments";
import { useGlobalSocket } from "./Utils/useGlobalSocket";
import MyPermission from "./Pages/MyPermission";


function Router() {
const { socket, startCall } = useGlobalSocket();
  const router = createBrowserRouter([
    // =============================
    // Public Landing Layout
    // =============================
    {
      path: "/",
      element: <LandingApp />,
      errorElement: <Error />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: "/", element: <LandingPage /> },
        {
          path: "/term-condition",
          element: <TermAndCondition />,
        },
        {
          path: "/privacy-policy",
          element: <PrivacyPolicy />,
        },
        {
          path: "/government-public-health",
          element: <GovermentHealth />,
        },
        {
          path: "/clinical-safety-statement",
          element: <ClinicalSafetyStatement />,
        },
      ],
    },

    // =============================
    // Auth Routes (Public)
    // =============================
    { path: "/login", element: <Login /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/otp", element: <Otp /> },
    { path: "/set-password", element: <SetPassword /> },
    { path: "/create-account", element: <CreateAccount /> },

    // Protected Create Account Steps
    {
      path: "/create-account-image",
      element:
        <CreateAccountImage />

    },
    {
      path: "/create-account-address",
      element:
        <CreateAccountAddress />,
    },
    {
      path: "/create-account-person",
      element:
        <CreateAccountPerson />
    },
    {
      path: "/create-account-upload",
      element:
        <CreateAccountUpload />
    },

    // =============================
    // Protected App Layout
    // =============================
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "test-request", element: <TestRequest /> },
            { path: "tests", element: <Tests /> }, 
            { path: "lab-report", element: <LabReports /> },
            { path: "invoice", element: <Invoices /> },
            { path: "permission", element: <Permission /> },
            { path: "employee-list", element: <EmployeeList /> },
            
            { path: "change-password", element: <ChangePassword /> },
            { path: "patient-details/:id", element: <PatientDetails /> },
            { path: "profile", element: <Profile /> },
            { path: "permission-check/:name/:id", element: <PermissionCheck /> },
            { path: "my-permission", element: <MyPermission /> },
            { path: "employee-data", element: <AddEmployee /> },
            { path: "view-employee/:name/:id", element: <ViewEmployee /> },
            { path: "lab-test-reports/:id", element: <LabTestReports /> },
            { path: "edit-profile/:id", element: <EditProfile /> },
            { path: "appointment-details/:id", element: <AppointmentDetails /> },
            { path: "reports", element: <Reports /> },
            { path: "invoice-details", element: <InvoiceDetails /> },

            { path: "chat", element: <Chat socket={socket} startCall={startCall}/> },
             { path: "neo-ai", element: <NeoAi /> },
            { path: "approve-profile", element: <ApproveProfile /> },
            { path: "department", element: <Departments /> },
            { path: "patient-view/:id", element: <PatientsView /> },
            // { path: "billing-view/:id", element: <NeoHealthCardLabTemplates /> },

            { path: "label/:id", element: <Labels /> },
            { path: "report-tabs", element: <ReportsTabs /> },
            { path: "appointment-request", element: <AppointmentRequest /> },
            { path: "test-reports-appointment", element: <TestReportsAppoiments /> },

            { path: "new-invoice/:id", element: <NewInvoice /> },
            // { path: "new-invoice/:id", element: <NeoHealthCardLabTemplates /> },
            { path: "report-view/:id", element: <ReportView /> },

            { path: "notification", element: <Notification /> },
            { path: "edit-test/:id", element: <EditTest /> },
            { path: "wating-for-approval", element: <Wating /> },
            { path: "add-appointment", element: <AddAppointment /> },
            { path: "slots", element: <Slots /> },

            // 9917141332
          ]
        }

      ],
    },
  ]);



  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default Router