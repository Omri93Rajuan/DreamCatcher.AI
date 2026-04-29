import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastViewport() {
  return (
    <ToastContainer
      position="top-right"
      rtl
      autoClose={1800}
      className="toast-container"
      toastClassName="toast-body"
    />
  );
}
