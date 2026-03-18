import apiClient from "./client";
import type { OrgListItem, CreateOrgRequest } from "../types";
import type { OrgMember } from "../types";

export type { OrgListItem, CreateOrgRequest };

export async function createOrg(data: CreateOrgRequest): Promise<OrgListItem> {
  const response = await apiClient.post("/api/admin/orgs", data);
  return response.data;
}

export async function listOrgs(): Promise<OrgListItem[]> {
  const response = await apiClient.get("/api/admin/orgs");
  return response.data;
}

export async function renameOrg(orgId: string, name: string): Promise<OrgListItem> {
  const response = await apiClient.patch(`/api/admin/orgs/${orgId}`, { name });
  return response.data;
}

export async function deleteOrg(orgId: string): Promise<void> {
  await apiClient.delete(`/api/admin/orgs/${orgId}`);
}

export async function transferOwnership(
  orgId: string,
  newOwnerEmail: string
): Promise<OrgMember> {
  const response = await apiClient.post(`/api/admin/orgs/${orgId}/transfer-ownership`, {
    new_owner_email: newOwnerEmail,
  });
  return response.data;
}

export async function deleteSystemUser(userId: string): Promise<void> {
  const response = await apiClient.delete(`/api/admin/users/${userId}`);
  if (response.status !== 204) {
    throw new Error(`Unexpected status: ${response.status}`);
  }
}