import type {
  Substitution,
  RawNewsMessage,
  NewsFilters,
  LastUpdated,
  SubstitutionFilters,
} from "./types";

import axios, { AxiosInstance, AxiosResponse } from "axios";

export class SchuleInfoportalAPI {
  private client: AxiosInstance;

  constructor(baseUrl: string, username?: string, password?: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      auth: username && password ? { username, password } : undefined,
    });
  }

  async getConfig(): Promise<any> {
    const res: AxiosResponse<any> = await this.client.get<any>("/config");

    return res.data;
  }

  async authCheck(): Promise<any> {
    const res: AxiosResponse<any> = await this.client.get<any>("/auth/check");

    return res.data;
  }

  async getSubstitutions(
    filters?: SubstitutionFilters,
  ): Promise<Substitution[]> {
    const res: AxiosResponse<Substitution[]> = await this.client.get<
      Substitution[]
    >("/substitutions", {
      params: filters,
    });

    return res.data;
  }

  async getRawNews(filters?: NewsFilters): Promise<RawNewsMessage[]> {
    const res: AxiosResponse<RawNewsMessage[]> = await this.client.get<
      RawNewsMessage[]
    >("/news/raw", { params: filters });

    return res.data;
  }

  async getLastUpdated(): Promise<LastUpdated> {
    const res: AxiosResponse<LastUpdated> =
      await this.client.get<LastUpdated>("/last_updated");

    return res.data;
  }

  async getInternalLastUpdated(): Promise<LastUpdated> {
    const res: AxiosResponse<LastUpdated> = await this.client.get<LastUpdated>(
      "/internal/last_updated",
    );

    return res.data;
  }
}
