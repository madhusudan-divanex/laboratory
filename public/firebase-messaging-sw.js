importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAC2yHXIIptDFannYC-u3eI4sibErN08vA",
  authDomain: "neohelth-a97f7.firebaseapp.com",
  projectId: "neohelth-a97f7",
  storageBucket: "neohelth-a97f7.firebasestorage.app",
  messagingSenderId: "10649086040",
  appId: "1:10649086040:web:60124ab036f48647ed022d",
  measurementId: "G-TWJTBPBTHF"
});

const messaging = firebase.messaging();

/**
 * 🔔 BACKGROUND MESSAGE
 */
messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Background push:", payload);

  self.registration.showNotification(
    payload.notification?.title || "New Notification",
    {
      body: payload.notification?.body || "",
      icon: "/logo.png",               // optional
      data: payload.data,              // 🔥 MOST IMPORTANT
      requireInteraction: true,        // stays until clicked
      vibrate: [200, 100, 200],         // mobile support
    }
  );
});

/**
 * 🖱️ NOTIFICATION CLICK
 */
// self.addEventListener("notificationclick", function (event) {
//   event.notification.close();

//   const data = event.notification.data || {};
//   let url = "/dashboard";

//   if (data.type === "chat" && data.conversationId) {
//     url = `/chat/${data.conversationId}`;
//   }

//   if (data.type === "call" && data.fromUserId) {
//     url = `/incoming-call/${data.fromUserId}`;
//   }

//   event.waitUntil(
//     clients.matchAll({
//       type: "window",
//       includeUncontrolled: true,
//     }).then((clientList) => {
//       for (const client of clientList) {
//         if ("focus" in client) {
//           client.navigate(url);
//           return client.focus();
//         }
//       }
//       return clients.openWindow(url);
//     })
//   );
// });
