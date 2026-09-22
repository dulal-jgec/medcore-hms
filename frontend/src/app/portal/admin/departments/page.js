"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import {
  getDepartments,
  searchDepartments,
} from "@/services/department.service";

export default function DepartmentsPage() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  async function loadDepartments() {
    try {
      setLoading(true);
      setError("");

      const result = await getDepartments(accessToken, {
        page: 0,
        size: 50,
        sortBy: "id",
        sortDir: "asc",
      });

      setDepartments(result.data.items || []);
    } catch (err) {
      setError(
        err.message || "Failed to load departments"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(value) {
    setSearch(value);

    if (!value.trim()) {
      loadDepartments();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await searchDepartments(
        accessToken,
        value,
        {
          page: 0,
          size: 50,
        }
      );

      setDepartments(result.data.items || []);
    } catch (err) {
      setError(
        err.message || "Failed to search departments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      loadDepartments();
    }
  }, [accessToken]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Departments
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage hospital departments
          </p>
        </div>

        <button
          onClick={() =>
            router.push("/portal/admin/departments/new")
          }
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          value={search}
          onChange={(e) =>
            handleSearch(e.target.value)
          }
          placeholder="Search departments..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No departments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    Department
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Code
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Description
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    className="border-b last:border-0"
                  >
                    {/* Department */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {department.imageUrl ? (
                          <img
                            src={department.imageUrl}
                            alt={department.name}
                            className="h-10 w-10 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}

                        <div>
                          <p className="font-medium">
                            {department.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            ID: {department.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-4 py-3 font-medium">
                      {department.code}
                    </td>

                    {/* Description */}
                    <td className="max-w-sm truncate px-4 py-3 text-muted-foreground">
                      {department.description || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={
                          department.status === "ACTIVE"
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {department.status}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {department.createdAt
                        ? new Date(
                            department.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}