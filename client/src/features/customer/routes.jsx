import { CreateGigPage, CustomerDashboardLayout, ManageGigPage, MyGigsPage } from "./CustomerPages";
import { ApplicantReviewPage } from "./ApplicantReviewPage";

/** Route objects for Captain integration into client/src/app/router.jsx. */
export const customerRoutes = {
  path: "/customer",
  element: <CustomerDashboardLayout />,
  children: [
    { path: "gigs", element: <MyGigsPage /> },
    { path: "gigs/new", element: <CreateGigPage /> },
    { path: "gigs/:id/applicants", element: <ApplicantReviewPage /> },
    { path: "gigs/:id", element: <ManageGigPage /> },
  ],
};

export { ApplicantReviewPage, CreateGigPage, CustomerDashboardLayout, ManageGigPage, MyGigsPage };
