import { Outlet } from "react-router-dom"
import { useAuth } from "@/layouts/Root"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Layout = () => {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">FlowTrack</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ApperIcon name="LogOut" className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

export default Layout