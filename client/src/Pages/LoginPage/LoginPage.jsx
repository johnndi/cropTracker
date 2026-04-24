import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    try {
      login(email, password);
      const user = useAuthStore.getState().user;
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "agent") {
        navigate("/agent");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🌾</h1>
          <h2 className="text-3xl font-bold text-gray-800">Crop Tracker</h2>
          <p className="text-gray-600 mt-2">Field Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center font-medium mb-3">
            Demo Credentials
          </p>
          <div className="space-y-2 text-xs text-gray-600">
            <p>
              <strong>Admin:</strong> admin@example.com / admin123
            </p>
            <p>
              <strong>Agent:</strong> john@example.com / john123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
