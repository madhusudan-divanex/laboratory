const calculateAge = (dob, asOfDate = new Date()) => {
  if (!dob) return "";

  const birthDate = new Date(dob);
  const refDate = new Date(asOfDate);

  let age = refDate.getFullYear() - birthDate.getFullYear();

  const monthDiff = refDate.getMonth() - birthDate.getMonth();
  const dayDiff = refDate.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
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