import apiClient from "./client";
import type { OrgListItem, CreateOrgRequest, UserListItem, OrgMemberDetail } from "../types";

export type { OrgListItem, CreateOrgRequest };

export async function createOrg(data: CreateOrgRequest): Promise<OrgListItem> {
  const response = await apiClient.post("/api/admin/orgs", data);
  return response.data;
}

export async function listOrgs(): Promise<OrgListItem[]> {
  const response = await apiClient.get("/api/admin/orgs");
  return response.data;
}

export async function listAllUsers(): Promise<UserListItem[]> {
  const response = await apiClient.get("/api/admin/users");
  return response.data;
}

export async function listOrgMembers(orgId: string): Promise<OrgMemberDetail[]> {
  const response = await apiClient.get(`/api/admin/orgs/${orgId}/members`);
  return response.data;
}

export async function deleteSystemUser(userId: string): Promise<void> {
  const response = await apiClient.delete(`/api/admin/users/${userId}`);
  if (response.status !== 204) {
    throw new Error(`Unexpected status: ${response.status}`);
  }
}