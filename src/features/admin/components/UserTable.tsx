import { useCallback, useMemo, useState } from "react";
import { listAllUsers } from "../api/adminApi";
import type { UserListItem } from "../../../shared/types";
import { useApiData } from "../../../shared/hooks/useApiData";
import { usePagination } from "../../../shared/hooks/usePagination";
import { formatDate } from "../../../shared/utils";
import { EmptyState, ErrorBanner, LoadingState, Pagination } from "../../../shared/components/ui";
import DeleteUserModal from "./DeleteUserModal";
import "./UserTable.css";

interface UserTableProps {
  refreshKey: number;
  currentUserEmail: string;
}

export default function UserTable({ refreshKey, currentUserEmail }: UserTableProps) {
  const fetchUsers = useCallback(() => listAllUsers(), []);
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useApiData<UserListItem[]>(fetchUsers, [refreshKey]);
  const allUsers = useMemo(() => usersData ?? [], [usersData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const q = searchQuery.toLowerCase();
    return allUsers.filter((u) => u.email.toLowerCase().includes(q));
  }, [allUsers, searchQuery]);

  const {
    paginatedItems: users,
    page,
    pageSize,
    pageSizeOptions,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination(filteredUsers);

  const handleDeleteSuccess = () => {
    setDeleteTarget(null);
    refetch();
  };

  return (
    <div className="user-table">
      <div className="user-table__toolbar">
        <div className="user-table__title">
          All users ({totalItems})
        </div>
        <input
          type="text"
          className="user-table__search"
          placeholder="Filter by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingState text="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState
          message={searchQuery ? "No users match your search." : "No users found."}
        />
      ) : (
        <>
          <div className="user-table__header">
            <span>Email</span>
            <span>System Role</span>
            <span>Status</span>
            <span>Orgs</span>
            <span>Created</span>
            <span>Actions</span>
          </div>
          {users.map((user) => {
            const isSelf = user.email === currentUserEmail;
            return (
              <div key={user.id} className="user-table__row">
                <span className="user-table__email">{user.email}</span>
                <span className="user-table__role">
                  {user.system_role === "SYSTEM_ADMIN" ? "Admin" : "User"}
                </span>
                <span>
                  <span
                    className={`user-table__badge ${
                      user.is_active
                        ? "user-table__badge--active"
                        : "user-table__badge--inactive"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </span>
                <span className="user-table__orgs">{user.org_count}</span>
                <span className="user-table__date">
                  {formatDate(user.created_at)}
                </span>
                <span className="user-table__actions">
                  {!isSelf && (
                    <button
                      className="user-table__delete-btn"
                      title={`Delete ${user.email}`}
                      onClick={() => setDeleteTarget(user)}
                    >
                      🗑️
                    </button>
                  )}
                </span>
              </div>
            );
          })}

          <Pagination
            inline
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {deleteTarget && (
        <DeleteUserModal
          userId={deleteTarget.id}
          userEmail={deleteTarget.email}
          onSuccess={handleDeleteSuccess}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
