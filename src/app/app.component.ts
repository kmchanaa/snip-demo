import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SnipService, Link } from "./snip.service";
import { signal } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  urlInput = "";
  links = signal<Link[]>([]);
  successMessage = signal<string>("");
  errorMessage = signal<string>("");
  loading = signal<boolean>(false);

  constructor(private snipService: SnipService) {}

  ngOnInit() {
    this.loadLinks();
  }

  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  }

  createLink() {
    this.successMessage.set("");
    this.errorMessage.set("");

    if (!this.urlInput.trim()) {
      this.errorMessage.set("Please enter a URL");
      return;
    }

    if (!this.isValidUrl(this.urlInput)) {
      this.errorMessage.set("Invalid URL: must start with http:// or https://");
      return;
    }

    this.loading.set(true);
    this.snipService.createLink(this.urlInput).subscribe({
      next: (response) => {
        if (response.error) {
          this.errorMessage.set(`Error: ${response.error}`);
        } else {
          this.successMessage.set(
            `Short link created! Copy: ${response.shortUrl}`,
          );
          this.urlInput = "";
          this.loadLinks();
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error("API Error:", err);
        this.errorMessage.set(
          "Network error: Could not reach backend at http://localhost:3000",
        );
        this.loading.set(false);
      },
    });
  }

  loadLinks() {
    this.snipService.getLinks().subscribe({
      next: (data) => {
        this.links.set(data);
      },
      error: (err) => {
        console.error("Failed to load links:", err);
      },
    });
  }

  openShortUrl(shortUrl: string) {
    window.open(shortUrl, "_blank");
  }
}
