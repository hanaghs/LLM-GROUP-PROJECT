import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Missions from './pages/Missions';
import Invoices from './pages/Invoices';
import Meetings from './pages/Meetings';
import Analytics from './pages/Analytics';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="missions" element={<Missions />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
