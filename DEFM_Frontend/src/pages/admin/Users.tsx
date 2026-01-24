import { useEffect, useState } from "react"
import api from "../../services/api"

export default function Users() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get("/admin/users").then(res => setUsers(res.data))
  }, [])

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>{u.email} ({u.role})</li>
        ))}
      </ul>
    </div>
  )
}
