import { apiClient, ApiResponse } from "@/lib/api-client";

export interface SavedCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  createdUtc: string;
}

export interface CustomerCreateDto {
  name: string;
  email: string;
  phone?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
}

export interface CustomerUpdateDto extends CustomerCreateDto {}

export const customerService = {
  getAll: (): Promise<ApiResponse<SavedCustomer[]>> =>
    apiClient.get<SavedCustomer[]>("/api/Customers"),

  getById: (id: number): Promise<ApiResponse<SavedCustomer>> =>
    apiClient.get<SavedCustomer>(`/api/Customers/${id}`),

  create: (dto: CustomerCreateDto): Promise<ApiResponse<SavedCustomer>> =>
    apiClient.post<SavedCustomer>("/api/Customers", dto),

  update: (id: number, dto: CustomerUpdateDto): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/Customers/${id}`, dto),

  delete: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/Customers/${id}`),
};
