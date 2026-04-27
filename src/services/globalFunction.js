const calculateAge = (dob) => {
        if (!dob) return "";

        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--; // haven't had birthday yet this year
        }
        return age;
    };
const saveFcmToken = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const token = await getToken(messaging, {
        vapidKey: "BE3q7ncn4UgC6EPT2Ehc8ozFDuu7tjRPV35MgbwCRV_QizDXeAH7nGtVxcStGmloWt0HQ9NfGIToPZ9EalL4Qe0"
      });

      if (token) {
        await securePostData("api/comman/save-fcm-token", { fcmToken: token });
        console.log("✅ FCM Token Saved");
      }
    } catch (err) {
      console.error("FCM error", err);
    }
  };
export {calculateAge,saveFcmToken}