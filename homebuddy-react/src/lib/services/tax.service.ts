import { apiClient, ApiResponse } from "@/lib/api-client";

export interface CountryTaxBracket {
  code: string;
  name: string;
  vatRate: number;
}

export interface TaxCalculationResult {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export const taxService = {
  /** Fetch all European countries with VAT rates for checkout dropdown */
  async getCountries(): Promise<ApiResponse<CountryTaxBracket[]>> {
    try {
      return await apiClient.get<CountryTaxBracket[]>("/api/tax/countries");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch countries";
      return { error: msg, status: 500 };
    }
  },

  /** Calculate tax for a given subtotal and country code */
  async calculateTax(
    countryCode: string,
    subtotal: number
  ): Promise<ApiResponse<TaxCalculationResult>> {
    try {
      const params = new URLSearchParams({
        countryCode,
        subtotal: String(subtotal),
      });
      return await apiClient.get<TaxCalculationResult>(
        `/api/tax/calculate?${params.toString()}`
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to calculate tax";
      return { error: msg, status: 500 };
    }
  },

  /** Client-side tax calculation using a known VAT rate (no API call) */
  calculateTaxLocal(subtotal: number, vatRate: number): TaxCalculationResult {
    const taxAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxRate: vatRate, taxAmount, total };
  },
};
