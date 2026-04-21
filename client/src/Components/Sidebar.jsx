import { Link , useNavigate} from "react-router-dom";
// import useUserStore from "../../store/user.store";
import "./sidebar.css"
const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Crop Tracker</h2>
             <h2>Admin Dashboard</h2>
{/* //         <p>Welcome, {user?.data?.fullName}</p> */}
         <nav className="navs">
          <ul className="list">
           <li>
               <Link to="/Admin">Dashboard</Link>
             </li>
             <li>
               <Link to="/Admin/Addadmin">Fields</Link>
             </li>
             <li>
               <Link to="/Admin/Porders">Agents</Link>
             </li>
             <li>
               <Link to="/Admin/Addmenu">Reports</Link>
             </li>
             
           </ul>
         </nav>
{/* // <button className="logout" onClick={handleLogoutClick}>log out</button> */}
        </div>
    )
}

export default Sidebar
// 
// const Dashboard=()=>{
//     const { user ,clearUser} = useUserStore();
// const navigate= useNavigate();
//     const handleLogoutClick = () => {
//       clearUser();
//       navigate("/");
//     };
//     return(
// <div>
    
//     <div className="dashboard">
//    
       
//     </div>
   
// </div>
//     );
// }
// export default Dashboard