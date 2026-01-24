import { Link } from "react-router-dom"

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        <li><Link to="/admin/users">Users</Link></li>
        <li><Link to="/admin/roles">Roles</Link></li>
        <li><Link to="/admin/audit">Audit Logs</Link></li>
      </ul>
    </div>
  )
}
