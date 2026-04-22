import { useEffect, useMemo, useState, createContext, useContext } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { applyThemeColors } from './constants.js'
import { createTicket, createUser, loadTickets, loadUsers, loginUser, updateTicket, updateUser } from './services/airtableApi.js'
import Login from './screens/Login.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './screens/Dashboard.jsx'
import TicketList from './screens/TicketList.jsx'
import NewTicket from './screens/NewTicket.jsx'
import TicketDetail from './screens/TicketDetail.jsx'
import UserManagement from './screens/UserManagement.jsx'
import MyTickets from './screens/MyTickets.jsx'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const PROSPECTS = []
const SESSION_USER_KEY = "ticketing-session-user-id"
const PAGE_PATHS = {
  dashboard: "/dashboard",
  tickets: "/tickets",
  "new-ticket": "/tickets/new",
  "my-tickets": "/my-tickets",
  users: "/users",
}

function getInitialTheme() {
  const saved = window.localStorage.getItem("ticketing-theme")
  if (saved === "dark" || saved === "light") return saved
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

function getPageFromPath(pathname) {
  if (pathname.startsWith("/tickets/new")) return "new-ticket"
  if (pathname.startsWith("/tickets/")) return "ticket"
  if (pathname.startsWith("/tickets")) return "tickets"
  if (pathname.startsWith("/my-tickets")) return "my-tickets"
  if (pathname.startsWith("/users")) return "users"
  return "dashboard"
}

function TicketDetailRoute() {
  const { ticketId } = useParams()
  return <TicketDetail ticketId={ticketId} />
}

function ProtectedLayout({ user }) {
  if (!user) return <Navigate to="/login" replace />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function AppShell() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(getInitialTheme)
  const [tickets, setTickets] = useState([])
  const [users, setUsers] = useState([])
  const [bootLoading, setBootLoading] = useState(true)
  const [bootError, setBootError] = useState("")

  const location = useLocation()
  const routerNavigate = useNavigate()
  const page = getPageFromPath(location.pathname)
  applyThemeColors(theme)

  const navigate = (p, params = {}) => {
    if (p === "ticket" && params.ticketId) {
      routerNavigate(`/tickets/${params.ticketId}`)
    } else {
      routerNavigate(PAGE_PATHS[p] || "/dashboard")
    }
    window.scrollTo(0, 0)
  }

  const logout = () => {
    window.localStorage.removeItem(SESSION_USER_KEY)
    setUser(null)
    routerNavigate("/login", { replace: true })
  }

  const loadInitialData = async () => {
    setBootLoading(true)
    setBootError("")
    try {
      const [userRows, ticketRows] = await Promise.all([loadUsers(), loadTickets()])
      const userNameByRecordId = Object.fromEntries(userRows.map((u) => [u.id, u.name]))
      const hydrateTicketUserNames = (ticket) => ({
        ...ticket,
        createdBy: userNameByRecordId[ticket.createdBy] || ticket.createdBy,
        assignedTo: userNameByRecordId[ticket.assignedTo] || ticket.assignedTo,
        closedBy: userNameByRecordId[ticket.closedBy] || ticket.closedBy,
      })
      const hydratedUsers = userRows.map((u) => ({
        ...u,
        addedBy: userNameByRecordId[u.addedBy] || u.addedBy,
      }))
      const savedUserId = window.localStorage.getItem(SESSION_USER_KEY)
      if (savedUserId) {
        const restoredUser = hydratedUsers.find((u) => u.id === savedUserId)
        if (restoredUser && restoredUser.status === "Active") {
          setUser(restoredUser)
        } else {
          window.localStorage.removeItem(SESSION_USER_KEY)
        }
      }
      setUsers(hydratedUsers)
      setTickets(ticketRows.map(hydrateTicketUserNames))
    } catch (err) {
      setBootError(err instanceof Error ? err.message : "Failed to load Airtable data.")
    } finally {
      setBootLoading(false)
    }
  }

  const handleLogin = async (email, password) => {
    const loggedIn = await loginUser(email, password)
    if (!loggedIn) throw new Error("Invalid credentials or account inactive.")
    window.localStorage.setItem(SESSION_USER_KEY, loggedIn.id)
    setUser(loggedIn)
    routerNavigate("/dashboard", { replace: true })
    return loggedIn
  }

  const createTicketRecord = async (ticketInput) => {
    const created = await createTicket(ticketInput)
    const userNameByRecordId = Object.fromEntries(users.map((u) => [u.id, u.name]))
    const hydrated = {
      ...created,
      createdBy: userNameByRecordId[created.createdBy] || created.createdBy,
      assignedTo: userNameByRecordId[created.assignedTo] || created.assignedTo,
      closedBy: userNameByRecordId[created.closedBy] || created.closedBy,
    }
    setTickets((prev) => [hydrated, ...prev])
    return hydrated
  }

  const updateTicketRecord = async (recordId, patch) => {
    const updated = await updateTicket(recordId, patch)
    const userNameByRecordId = Object.fromEntries(users.map((u) => [u.id, u.name]))
    const hydrated = {
      ...updated,
      createdBy: userNameByRecordId[updated.createdBy] || updated.createdBy,
      assignedTo: userNameByRecordId[updated.assignedTo] || updated.assignedTo,
      closedBy: userNameByRecordId[updated.closedBy] || updated.closedBy,
    }
    setTickets((prev) => prev.map((t) => (t.id === recordId ? hydrated : t)))
    return hydrated
  }

  const createUserRecord = async (userInput) => {
    const created = await createUser(userInput)
    const userNameByRecordId = Object.fromEntries(users.map((u) => [u.id, u.name]))
    const hydrated = { ...created, addedBy: userNameByRecordId[created.addedBy] || created.addedBy }
    setUsers((prev) => [...prev, hydrated])
    return hydrated
  }

  const updateUserRecord = async (recordId, patch) => {
    const updated = await updateUser(recordId, patch)
    const userNameByRecordId = Object.fromEntries(users.map((u) => [u.id, u.name]))
    const hydrated = { ...updated, addedBy: userNameByRecordId[updated.addedBy] || updated.addedBy }
    setUsers((prev) => prev.map((u) => (u.id === recordId ? hydrated : u)))
    if (user?.id === recordId) setUser(hydrated)
    return hydrated
  }

  useEffect(() => {
    window.localStorage.setItem("ticketing-theme", theme)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    loadInitialData()
  }, [])

  const ctx = useMemo(() => ({
    user,
    navigate,
    page,
    tickets,
    users,
    logout,
    prospects: PROSPECTS,
    theme,
    setTheme,
    reloadData: loadInitialData,
    createTicketRecord,
    updateTicketRecord,
    createUserRecord,
    updateUserRecord,
  }), [user, page, tickets, users, theme])

  if (bootLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--c-muted)" }}>
        Loading Airtable data...
      </div>
    )
  }

  return (
    <AppContext.Provider value={ctx}>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                onLogin={handleLogin}
                loadingData={bootLoading}
                dataError={bootError}
                theme={theme}
                onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              />
            )
          }
        />

        <Route element={<ProtectedLayout user={user} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<NewTicket />} />
          <Route path="/tickets/:ticketId" element={<TicketDetailRoute />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </AppContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
