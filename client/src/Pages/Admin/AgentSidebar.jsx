import { Link , useNavigate} from "react-router-dom";
import useUserStore from  "./../../store/UserStore";
import "./../../Components/sidebar.css"
const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Crop Tracker</h2>
{/* //         <p>Welcome, {user?.data?.fullName}</p> */}
         <nav className="navs">
          <ul className="list">
           <li>
               <Link to="/">Dashboard</Link>
             </li>
             <li>
               <Link to="/field">update field</Link>
             </li>
             
             <li>
               <Link to="AddReport">Add observation</Link>
             </li>
             
           </ul>
         </nav>
{/* // <button className="logout" onClick={handleLogoutClick}>log out</button> */}
        </div>
    )
}

export default Sidebar
