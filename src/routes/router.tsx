import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../app/RootLayout';
import WelcomePage from '../pages/WelcomePage/WelcomePage';
import PatientAuthPage from '../pages/PatientAuthPage/PatientAuthPage';
import CaregiverAuthPage from '../pages/CaregiverAuthPage/CaregiverAuthPage';
import PatientPage from '../pages/PatientPage/PatientPage';
import CaregiverPage from '../pages/CaregiverPage/CaregiverPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/welcome" replace /> },
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'auth/patient', element: <PatientAuthPage /> },
      { path: 'auth/caregiver', element: <CaregiverAuthPage /> },
      { path: 'patient', element: <PatientPage /> },
      { path: 'caregiver', element: <CaregiverPage /> },
      { path: '*', element: <Navigate to="/welcome" replace /> },
    ],
  },
]);
