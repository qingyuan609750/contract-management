import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ContractList from "@/pages/ContractList";
import ContractDetail from "@/pages/ContractDetail";
import ContractEdit from "@/pages/ContractEdit";
import Reminders from "@/pages/Reminders";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import BackupManager from "@/pages/BackupManager";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/contracts" element={<ContractList />} />
                  <Route path="/contracts/new" element={<ContractEdit />} />
                  <Route path="/contracts/:id" element={<ContractDetail />} />
                  <Route path="/contracts/:id/edit" element={<ContractEdit />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/users" element={<UserManagement />} />
                  <Route path="/settings/backup" element={<BackupManager />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
