import apiClient from "./client";

export interface OrgMember {
  id: string;
  user_id: string;
  email: string;
  org_role: string;
  is_active: boolean;
  joined_at: string;
}

export interface InviteRequest {
  email: string;
  org_role: string;
}

export interface UpdateRoleRequest {
  org_role: string;
}

export async function listMembers(): Promise<OrgMember[]> {
  const response = await apiClient.get("/api/orgs/members");
  return response.data;
}

export async function inviteMember(data: InviteRequest): Promise<OrgMember> {
  const response = await apiClient.post("/api/orgs/invite", data);
  return response.data;
}

export async function updateMemberRole(
  memberId: string,
  data: UpdateRoleRequest
): Promise<OrgMember> {
  const response = await apiClient.patch(
    `/api/orgs/members/${memberId}/role`,
    data
  );
  return response.data;
}

export async function deactivateMember(
  memberId: string
): Promise<OrgMember> {
  const response = await apiClient.patch(
    `/api/orgs/members/${memberId}/deactivate`
  );
  return response.data;
}

export async function activateMember(
  memberId: string
): Promise<OrgMember> {
  const response = await apiClient.patch(
    `/api/orgs/members/${memberId}/activate`
  );
  return response.data;
}

export async function removeMember(memberId: string): Promise<void> {
  await apiClient.delete(`/api/orgs/members/${memberId}`);
}