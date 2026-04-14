import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getSecureApiData } from "./Services/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
// import { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyAC2yHXIIptDFannYC-u3eI4sibErN08vA",
  authDomain: "neohelth-a97f7.firebaseapp.com",
  projectId: "neohelth-a97f7",
  storageBucket: "neohelth-a97f7.firebasestorage.app",
  messagingSenderId: "10649086040",
  appId: "1:10649086040:web:60124ab036f48647ed022d",
  measurementId: "G-TWJTBPBTHF"
};

const app = initializeApp(firebaseConfig);
const userId = localStorage.getItem('userId')
export const messaging = getMessaging(app);

// useEffect(() => {
//     if (userId) {

//         getUserData()
//     }
// }, [userId])
// const [role, setRole] = useState()
// const [userData, setUserData] = useState()
// async function getUserData() {
//     try {
//         const res = await getSecureApiData(`user/${userId}`)
//         if (res?.success) {
//             setUserData(res.data)
//             setRole(res.data.role);
//         }
//     } catch (error) {
//     }
// }

// const profiles = useSelector(state => {
//     if (role === 'patient') return state.patient.profiles;
//     if (role === 'doctor') return state.doctor.profiles;
//     return null;
// });

export const listenForegroundNotification = (navigate) => {
    const messaging = getMessaging();

    onMessage(messaging, (payload) => {
        console.log("Foreground notification received:", payload);
        const data = payload.data;
        const { title, body } = payload.notification || {};

        // toast.success(`${title}\n${body}`);
        // navigate(`/chat`);
        //   if (data?.type === "chat") {
        //     navigate(`/chat/${data.conversationId}`);
        //   }

        //   if (data?.type === "chat") {
        //     navigate(`/chat/${data.fromUserId}`);
        //   }
    });
};