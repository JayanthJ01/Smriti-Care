import { Outlet } from 'react-router-dom';
import { PatientDataProvider } from '../contexts/PatientDataContext';
import { CaregiverProvider } from '../contexts/CaregiverContext';

export default function RootLayout() {
  return (
    <PatientDataProvider>
      <CaregiverProvider>
        <Outlet />
      </CaregiverProvider>
    </PatientDataProvider>
  );
}
