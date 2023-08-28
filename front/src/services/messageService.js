import { toast } from "react-toastify";

const messageObject = {
  position: "bottom-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

function showError(message) {
  (() => toast.error(message, messageObject))();
}

function showSuccess(message) {
  (() => toast.success(message, messageObject))();
}

export const messageService = { showError, showSuccess };
