import apiClient from "./client";
import type { OrgListItem, CreateOrgRequest } from "../types/admin";

export type { OrgListItem, CreateOrgRequest };

export async function createOrg(data: CreateOrgRequest): Promise<OrgListItem> {
  const response = await apiClient.post("/api/admin/orgs", data);
  return response.data;
}

export async function listOrgs(): Promise<OrgListItem[]> {
  const response = await apiClient.get("/api/admin/orgs");
  return response.data;
}