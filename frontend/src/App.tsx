import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const AddProperty = lazy(() => import("./pages/AddProperty"));
const EditProperty = lazy(() => import("./pages/EditProperty"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function App() {
    return (
        <BrowserRouter>
            <Suspense
                fallback={
                    <div className="flex min-h-screen items-center justify-center">
                        <p className="text-gray-600">Loading page...</p>
                    </div>
                }
            >
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password/:token"
                        element={<ResetPassword />}
                    />

                    <Route
                        path="/properties/:id"
                        element={<PropertyDetails />}
                    />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route
                            path="/properties/new"
                            element={<AddProperty />}
                        />

                        <Route
                            path="/properties/:id/edit"
                            element={<EditProperty />}
                        />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;