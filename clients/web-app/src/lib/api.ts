const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Chef {
  id: string;
  name: string;
  bio: string;
  rating: number;
  ratingCount: number;
  image: string | null;
  createdAt: string;
  requiresSecret?: boolean;
  menuItems?: MenuItem[];
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  preparationTime: number;
  rating: number;
  ratingCount: number;
  image: string | null;
  chef: {
    id: string;
    name: string;
    rating: number;
  };
  category: {
    id: string;
    name: string;
  };
  customizationOptions: {
    id: string;
    name: string;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();
    if (!result.success) {
      throw new Error(`API Error: ${result.message || "Unknown error"}`);
    }
    return result.data;
  }

  // Chef API methods
  async getChefs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    minRating?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.minRating)
      queryParams.append("minRating", params.minRating.toString());

    const query = queryParams.toString();
    return this.fetchApi<{
      chefs: Chef[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/chefs${query ? `?${query}` : ""}`);
  }

  async getChefById(chefId: string) {
    return this.fetchApi<{ chef: Chef }>(`/chefs/${chefId}`);
  }

  async verifyChefSecret(chefId: string, secret: string) {
    return this.fetchApi<{ chef: Chef }>(`/chefs/${chefId}/verify-secret`, {
      method: "POST",
      body: JSON.stringify({ secret }),
    });
  }

  async getChefMenuItems(
    chefId: string,
    secret: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
    }
  ) {
    const queryParams = new URLSearchParams();
    queryParams.append("chefId", chefId);
    queryParams.append("secret", secret);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("categoryId", params.category);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.fetchApi<{
      menuItems: MenuItem[];
      chef: { id: string; name: string };
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/menu/items?${query}`);
  }

  // Category API methods
  async getCategories(params?: { chefId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.chefId) queryParams.append("chefId", params.chefId);

    const query = queryParams.toString();
    return this.fetchApi<{ categories: Category[] }>(
      `/categories${query ? `?${query}` : ""}`
    );
  }

  async getCategoryById(categoryId: string) {
    return this.fetchApi<{
      category: Category & {
        menuItems: MenuItem[];
      };
    }>(`/categories/${categoryId}`);
  }

  // Menu API methods
  async getMenuItems(params?: {
    page?: number;
    limit?: number;
    category?: string;
    chef?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.chef) queryParams.append("chef", params.chef);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.fetchApi<{
      menuItems: MenuItem[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/menu${query ? `?${query}` : ""}`);
  }

  async getMenuItemById(itemId: string) {
    return this.fetchApi<{ menuItem: MenuItem }>(`/menu/${itemId}`);
  }
}

export const apiService = new ApiService();
export type { Chef, Category, MenuItem };
