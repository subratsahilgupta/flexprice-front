import MainLayout from "@/layouts/MainLayout";
import Auth from "@/pages/auth/Auth";
import { createBrowserRouter } from "react-router-dom";
import CustomerPage from "@/pages/customer/Customer";


const RouteNames = {
    home:{
        path: '/'
    },
    login:{
        path: '/login'
    },
	plans: {
		path: '/plans',
        create: {
            path: '/create',
        },
        edit: {
            path: '/edit/:id',
            routing_path: '/edit/'
        }
	},
	metering: {
		path: '/metering',
	},
	query: {
		path: '/query',
	},
	customer: {
		path: '/customer',
        detail:{
            path: '/details/:id',
            routing_path: '/details/'
        }
	}
};

export const MainRouter = createBrowserRouter([
    {
        path: RouteNames.login.path,
        element: <Auth/>
    },
    {
        path: RouteNames.home.path,
        element: <MainLayout/>,
        children:[
            {
                path: RouteNames.plans.path,
                element: <CustomerPage/>
            }
        ]
    }
])