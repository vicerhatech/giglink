import { TalentProfilePage } from "./TalentProfilePage";
import { BrowseGigsPage } from "./BrowseGigsPage";
import { GigDetailsPage } from "./GigDetailsPage";
import { ApplyToPositionPage } from "./ApplyToPositionPage";
import { MyApplicationsPage } from "./MyApplicationsPage";

export const talentRoutes = [
  { path: "/talent/profile", element: <TalentProfilePage /> },
  { path: "/talent/gigs", element: <BrowseGigsPage /> },
  { path: "/talent/gigs/:id", element: <GigDetailsPage /> },
  { path: "/talent/gigs/:gigId/positions/:positionId/apply", element: <ApplyToPositionPage /> },
  { path: "/talent/applications", element: <MyApplicationsPage /> },
];
