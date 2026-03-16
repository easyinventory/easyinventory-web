import apiClient from "./client";

export interface OrgListItem {
  id: string;
  name: string;
  created_at: string;
  owner_email: string | null;
  member_count: number;
}

export interface CreateOrgRequest {
  name: string;
  owner_email: string;
}

export async function createOrg(data: CreateOrgRequest): Promise<OrgListItem> {
  const response = await apiClient.post("/api/admin/orgs", data);
  return response.data;
}

export async function listOrgs(): Promise<OrgListItem[]> {
  const response = await apiClient.get("/api/admin/orgs");
  return response.data;
}