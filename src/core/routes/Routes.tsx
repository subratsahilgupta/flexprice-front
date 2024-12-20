import MainLayout from "@/layouts/MainLayout";
import Auth from "@/pages/auth/Auth";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthProvider } from "../auth/AuthProvider";
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
        element: <AuthProvider><MainLayout/></AuthProvider>,
        children:[
            {
                index: true,
                element: <Navigate to={RouteNames.plans.path} replace />
            },
            {
                path: RouteNames.plans.path,
                element: <CustomerPage/>
            },
            {
                path: RouteNames.metering.path,
                element: <div>Metering Page</div>
            },
            {
                path: RouteNames.query.path,
                element: <div>Query Page</div>
            },
            {
                path: RouteNames.customer.path,
                element: <CustomerPage/>
            }
        ]
    }
]);