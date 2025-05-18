"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Registration {
  id: string
  fullName: string
  status: string
  totalPrice: number
  tickets: Array<{
    id: string
    quantity: number
    dancer: string
    ticketType: {
      id: string
      name: string
      price: number
    }
  }>
}

interface AdminStatsProps {
  registrations: Registration[]
}

export function AdminStats({ registrations }: AdminStatsProps) {
  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalRegistrations = registrations.length
    const confirmedRegistrations = registrations.filter((r) => r.status === "CONFIRMED").length
    const pendingRegistrations = registrations.filter((r) => r.status === "PENDING").length
    const cancelledRegistrations = registrations.filter((r) => r.status === "CANCELLED").length

    const totalRevenue = registrations.filter((r) => r.status === "CONFIRMED").reduce((sum, r) => sum + r.totalPrice, 0)

    const potentialRevenue = registrations
      .filter((r) => r.status === "PENDING")
      .reduce((sum, r) => sum + r.totalPrice, 0)

    // Count tickets by type
    const ticketsByType = registrations
      .filter((r) => r.status !== "CANCELLED")
      .flatMap((r) => r.tickets)
      .reduce(
        (acc, ticket) => {
          const type = ticket.ticketType.name
          if (!acc[type]) acc[type] = 0
          acc[type] += ticket.quantity
          return acc
        },
        {} as Record<string, number>,
      )

    // Count tickets by dancer
    const ticketsByDancer = registrations
      .filter((r) => r.status !== "CANCELLED")
      .flatMap((r) => r.tickets)
      .reduce(
        (acc, ticket) => {
          const dancer = ticket.dancer
          if (!acc[dancer]) acc[dancer] = 0
          acc[dancer] += ticket.quantity
          return acc
        },
        {} as Record<string, number>,
      )

    return {
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      cancelledRegistrations,
      totalRevenue,
      potentialRevenue,
      ticketsByType,
      ticketsByDancer,
    }
  }, [registrations])

  // Prepare chart data
  const statusData = [
    { name: "Confirmed", value: stats.confirmedRegistrations, color: "#10b981" },
    { name: "Pending", value: stats.pendingRegistrations, color: "#6b7280" },
    { name: "Cancelled", value: stats.cancelledRegistrations, color: "#ef4444" },
  ]

  const ticketTypeData = Object.entries(stats.ticketsByType).map(([name, value]) => ({
    name,
    value,
    color: name === "VIP" ? "#14b8a6" : "#64748b",
  }))

  const dancerData = Object.entries(stats.ticketsByDancer)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const COLORS = ["#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a", "#1e3a8a"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {stats.confirmedRegistrations} confirmed registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.potentialRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {stats.pendingRegistrations} pending registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedRegistrations} confirmed, {stats.pendingRegistrations} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
            <CardDescription>Distribution of registration statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} registrations`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
            <CardDescription>Distribution of ticket types</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ticketTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tickets`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets by Dancer</CardTitle>
          <CardDescription>Number of tickets sold for each dancer</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dancerData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value) => [`${value} tickets`, "Count"]} />
              <Bar dataKey="value" fill="#14b8a6">
                {dancerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
