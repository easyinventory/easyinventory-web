import apiClient from "../../../shared/api/client";
import type {
  Store,
  StoreLayout,
  LayoutZone,
  ZoneCreateRequest,
  ZoneUpdateRequest,
  LayoutFixture,
  FixtureCreateRequest,
  FixtureUpdateRequest,
} from "../../../shared/types";

export type { Store, StoreLayout };

export async function listStores(): Promise<Store[]> {
  const response = await apiClient.get("/api/stores");
  return response.data;
}

export async function listLayouts(storeId: string): Promise<StoreLayout[]> {
  const response = await apiClient.get(`/api/stores/${storeId}/layouts`);
  return response.data;
}

export async function createLayout(
  storeId: string,
  rows: number,
  cols: number
): Promise<StoreLayout> {
  const response = await apiClient.post(`/api/stores/${storeId}/layouts`, {
    rows,
    cols,
  });
  return response.data;
}

export async function activateLayout(
  storeId: string,
  layoutId: string
): Promise<StoreLayout> {
  const response = await apiClient.post(
    `/api/stores/${storeId}/layouts/${layoutId}/activate`
  );
  return response.data;
}

/* ── Zone CRUD ── */

const zonePath = (storeId: string, layoutId: string) =>
  `/api/stores/${storeId}/layouts/${layoutId}/zones`;

export async function createZone(
  storeId: string,
  layoutId: string,
  body: ZoneCreateRequest,
): Promise<LayoutZone> {
  const response = await apiClient.post(zonePath(storeId, layoutId), body);
  return response.data;
}

export async function updateZone(
  storeId: string,
  layoutId: string,
  zoneId: string,
  body: ZoneUpdateRequest,
): Promise<LayoutZone> {
  const response = await apiClient.put(
    `${zonePath(storeId, layoutId)}/${zoneId}`,
    body,
  );
  return response.data;
}

export async function deleteZone(
  storeId: string,
  layoutId: string,
  zoneId: string,
): Promise<void> {
  await apiClient.delete(`${zonePath(storeId, layoutId)}/${zoneId}`);
}

/* ── Fixture CRUD ── */

const fixturePath = (storeId: string, layoutId: string) =>
  `/api/stores/${storeId}/layouts/${layoutId}/fixtures`;

export async function createFixture(
  storeId: string,
  layoutId: string,
  body: FixtureCreateRequest,
): Promise<LayoutFixture> {
  const response = await apiClient.post(fixturePath(storeId, layoutId), body);
  return response.data;
}

export async function updateFixture(
  storeId: string,
  layoutId: string,
  fixtureId: string,
  body: FixtureUpdateRequest,
): Promise<LayoutFixture> {
  const response = await apiClient.put(
    `${fixturePath(storeId, layoutId)}/${fixtureId}`,
    body,
  );
  return response.data;
}

export async function deleteFixture(
  storeId: string,
  layoutId: string,
  fixtureId: string,
): Promise<void> {
  await apiClient.delete(`${fixturePath(storeId, layoutId)}/${fixtureId}`);
}
