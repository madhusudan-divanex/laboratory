import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getSecureApiData } from "../services/api";
import Loader from "./Layouts/Loader";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await getSecureApiData(
          `lab/${localStorage.getItem("userId")}`
        );

        if (res?.success) {
          setIsAuthenticated(true);
          if(res?.nextStep){
            navigate(res?.nextStep)
          }
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      }
    };

    validateToken();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <Loader/>;
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;