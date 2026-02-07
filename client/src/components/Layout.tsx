import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', visible: true },
    { path: '/scenarios', label: 'Cenários', visible: true },
    { path: '/dados', label: 'Cadastros', visible: isAdmin },
    { path: '/users', label: 'Usuários', visible: isAdmin },
  ].filter(item => item.visible);

  const roleBadge = isAdmin ? 'Admin' : 'Vendedor';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Logo"
                  className="h-8 object-contain"
                />
                <span className="font-bold text-lg text-gray-900">BaaS Calculator</span>
              </Link>
              <div className="hidden sm:flex gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {roleBadge}
                </span>
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
