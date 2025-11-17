import axios, { AxiosInstance } from "axios"
import type { Substitution, NewsMessage, LastUpdated, HTTPValidationError, SubstitutionFilters } from './types'


export class SchuleInfoportalAPI {
  private client: AxiosInstance

  constructor(baseUrl: string, username?: string, password?: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      auth: username && password ? { username, password } : undefined
    })
  }

  async getConfig() {
    const res = await this.client.get<any>("/config")
    return res.data
  }

  async authCheck() {
    const res = await this.client.get<any>("/auth/check")
    return res.data
  }

  async getSubstitutions(filters?: {
    class_name?: string
    teacher_name?: string
    info?: string
    date?: string
    start_date?: string
    end_date?: string
  }) {
    const res = await this.client.get<Substitution[]>("/substitutions", {
      params: filters
    })
    return res.data
  }

  async getAllNews() {
    const res = await this.client.get<NewsMessage[]>("/news")
    return res.data
  }

  async getTodayNews() {
    const res = await this.client.get<NewsMessage[]>("/news/today")
    return res.data
  }

  async getNewsForDate(date: string) {
    const res = await this.client.get<NewsMessage[]>(`/news/date/${date}`)
    return res.data
  }

  async getLastUpdated() {
    const res = await this.client.get<LastUpdated>("/last_updated")
    return res.data
  }

  async getInternalLastUpdated() {
    const res = await this.client.get<any>("/internal/last_updated")
    return res.data
  }
}
