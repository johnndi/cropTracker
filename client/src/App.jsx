
import Dashboard from "./Pages/Admin/Dashboard"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import AddField from "./Pages/Admin/AddField"
import AddAgent from "./Pages/Admin/AddAgent"
import Admin from "./Pages/Admin/Admin"
import AgentDashboard from "./Pages/Admin/AgentDashboard"
import Login from "./Pages/login"
function App() {
 
  return (
    <>
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<login/>}/>
           <Route path='/dashboard' element={<AgentDashboard/>}/>
        <Route path= "/Admin/AddField" element={<AddField/>}/>
        <Route path="/Admin/AddAgent" element={<AddAgent/>}/>
      
        
        </Routes>
      </BrowserRouter>
      

    </div>
      
    </>
  )
}

export default App
