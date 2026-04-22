import { Routes, Route } from 'react-router-dom';
import AddField from './AddField';
import AddAgent from './AddAgent';
import Dashboard from './Dashboard';
function Admin() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
      <Route path="AddField" element={<AddField />}/>
        <Route path="AddAgent" element={<AddAgent />}/>
      </Route>
    </Routes>
  );
}

export default Admin;
