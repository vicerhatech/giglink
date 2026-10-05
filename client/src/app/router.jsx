import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
