import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SearchHistory from "@/pages/search-history";
import Layout from "@/components/layout";

function Router({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Home /> : <div>Please log in to continue</div>}
      </Route>
      <Route path="/search-history">
        {isAuthenticated ? <SearchHistory /> : <div>Please log in to continue</div>}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include"
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const result = await response.json();
        if (result && result.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [setLocation]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      setIsAuthenticated(false);
      setLocation("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-r-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <Layout>
          <button onClick={handleSignOut}>Sign Out</button>
          <Router isAuthenticated={isAuthenticated} />
        </Layout>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
            <h2 className="text-center text-3xl font-bold">Login Required</h2>
            <p className="text-center">Please log in to access the application</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const response = await fetch("/api/login", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password")
                  })
                });

                if (!response.ok) {
                  throw new Error("Login failed");
                }

                const result = await response.json();
                if (result.success) {
                  window.location.href = "/";
                }
              } catch (error) {
                console.error("Login error:", error);
              }
            }} className="mt-8 space-y-6">
              <input type="hidden" name="remember" value="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                <input
                  type="text"
                  name="username"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
                <input
                  type="password"
                  name="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}
      <Toaster />
    </>
  );
}