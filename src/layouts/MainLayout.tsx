import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const MainLayout: React.FC = () => {
  const location = useLocation();

  // Extract breadcrumb segments from the URL path
  const pathSegments = location.pathname.split('/').filter((segment) => segment);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col flex-1">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              {pathSegments.map((segment, index) => {
                const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                const name = decodeURIComponent(segment);

                return (
                  <span key={index} className="flex items-center">
                    <a href={path} className="hover:text-gray-800 capitalize">
                      {name}
                    </a>
                    {index < pathSegments.length - 1 && <span className="mx-2">/</span>}
                  </span>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet/>
        </main>
      </div>
      <Toaster/>
    </div>
  );
};

export default MainLayout;
