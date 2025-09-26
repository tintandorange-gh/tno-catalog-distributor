import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import AdminDashboard from "@/components/admin/dashboard"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin-auth")?.value === "true"

  if (!isAuthenticated) {
    redirect("/admin")
  }

  return <AdminDashboard />
}
