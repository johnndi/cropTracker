import {navigate} from 'react-router-dom';
import{ useState } from 'react';
import useUserStore from '../store/UserStore';
const Login = () => {
    const {user,setUser, setRole} = useUserStore();

    const handleSubmit = (e) => {
        e.preventDefault( );
        try {const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        setUser(data.user);
        setRole(data.user.role);
        navigate('/dashboard');
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
    };
    

  return (
    <div>
        <h1>Login Page</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" />
            </div>
            <button type="submit">Login</button>
        </form>

    </div>
    );
}
export default Login;