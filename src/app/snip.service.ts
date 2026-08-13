import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { signal } from "@angular/core";

export interface Link {
  code: string;
  url: string;
  shortUrl: string;
  hits: number;
  createdAt: string;
}

export interface CreateLinkResponse {
  code?: string;
  url?: string;
  shortUrl?: string;
  hits?: number;
  createdAt?: string;
  error?: string;
}

@Injectable({
  providedIn: "root",
})
export class SnipService {
  private readonly API_BASE = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  createLink(url: string) {
    return this.http.post<CreateLinkResponse>(
      `${this.API_BASE}/api/links`,
      { url },
      { headers: { "Content-Type": "application/json" } },
    );
  }

  getLinks() {
    return this.http.get<Link[]>(`${this.API_BASE}/api/links`);
  }
}
