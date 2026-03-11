"use strict";

const { app } = require("electron");
const { autoUpdater } = require("electron-updater");
const https = require("node:https");

const RELEASES_BASE_URL = "https://cdn.sitepulse.app/releases/";
const VERSION_MANIFEST_URL = "https://cdn.sitepulse.app/update/version.json";

function createInitialUpdateState() {
  return {
    currentVersion: app.getVersion(),
    remoteVersion: "",
    manifestUrl: VERSION_MANIFEST_URL,
    releaseUrl: "",
    releaseNotes: "",
    status: app.isPackaged ? "idle" : "development-build",
    detail: app.isPackaged
      ? "Updates have not been checked yet."
      : "Updates are only available in packaged builds.",
    available: false,
    downloading: false,
    downloaded: false,
    checkInFlight: false,
    downloadProgress: 0,
    lastCheckedAt: "",
    lastError: "",
  };
}

function compareVersions(left, right) {
  const leftParts = String(left || "0")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = String(right || "0")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  const maxLength = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] || 0;
    const rightValue = rightParts[index] || 0;
    if (leftValue > rightValue) return 1;
    if (leftValue < rightValue) return -1;
  }
  return 0;
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { Accept: "application/json" } }, (response) => {
      const statusCode = Number(response.statusCode || 0);
      if (statusCode < 200 || statusCode >= 300) {
        response.resume();
        reject(new Error(`manifest_http_${statusCode}`));
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          const message = error instanceof Error ? error.message : "manifest_parse_failed";
          reject(new Error(message));
        }
      });
    });

    request.on("error", (error) => {
      reject(error instanceof Error ? error : new Error(String(error || "manifest_request_failed")));
    });
  });
}

function normalizeManifest(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    version: String(source.version || "").trim(),
    url: String(source.url || "").trim(),
    notes: String(source.notes || "").trim(),
  };
}

class UpdateService {
  constructor(options) {
    this.log = typeof options?.log === "function" ? options.log : () => {};
    this.notify = typeof options?.notify === "function" ? options.notify : () => {};
    this.state = createInitialUpdateState();
    this.latestManifest = null;
    this.initialized = false;
    this.autoUpdaterConfigured = false;
    this.updateCheckPromise = null;
  }

  getState() {
    return { ...this.state };
  }

  setState(patch) {
    this.state = {
      ...this.state,
      ...patch,
    };
    this.notify(this.getState());
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;

    if (!app.isPackaged) {
      this.setState({
        status: "development-build",
        detail: "Updates are only available in packaged builds.",
      });
      return;
    }

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoRunAppAfterInstall = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.setFeedURL({
      provider: "generic",
      url: RELEASES_BASE_URL,
    });

    autoUpdater.on("checking-for-update", () => {
      this.setState({
        status: "checking",
        detail: "Checking the SitePulse release channel.",
        checkInFlight: true,
        lastError: "",
      });
    });

    autoUpdater.on("update-available", (info) => {
      const version = String(info?.version || this.latestManifest?.version || "").trim();
      const releaseNotes = typeof info?.releaseNotes === "string"
        ? info.releaseNotes
        : this.latestManifest?.notes || "";
      this.setState({
        status: "update-available",
        detail: `Version ${version} is available and ready to download.`,
        remoteVersion: version,
        releaseNotes,
        available: true,
        checkInFlight: false,
        downloaded: false,
      });
    });

    autoUpdater.on("update-not-available", () => {
      this.setState({
        status: "up-to-date",
        detail: "Application is up to date.",
        available: false,
        downloading: false,
        downloaded: false,
        checkInFlight: false,
        downloadProgress: 0,
      });
    });

    autoUpdater.on("download-progress", (progress) => {
      const percent = Math.max(0, Math.min(100, Number(progress?.percent || 0)));
      this.setState({
        status: "downloading",
        detail: `Downloading update ${percent.toFixed(0)}%.`,
        downloading: true,
        downloadProgress: percent,
      });
    });

    autoUpdater.on("update-downloaded", (info) => {
      const version = String(info?.version || this.latestManifest?.version || "").trim();
      this.setState({
        status: "ready-to-install",
        detail: `Version ${version} is downloaded and ready to install.`,
        remoteVersion: version,
        downloading: false,
        downloaded: true,
        downloadProgress: 100,
        checkInFlight: false,
      });
    });

    autoUpdater.on("error", (error) => {
      const message = error instanceof Error ? error.message : String(error || "update_failed");
      this.log(`[update] ${message}`);
      this.setState({
        status: "error",
        detail: message,
        lastError: message,
        downloading: false,
        downloaded: false,
        checkInFlight: false,
      });
    });

    this.autoUpdaterConfigured = true;
  }

  async fetchManifest() {
    const manifest = normalizeManifest(await requestJson(VERSION_MANIFEST_URL));
    if (!manifest.version) {
      throw new Error("manifest_missing_version");
    }
    this.latestManifest = manifest;
    this.setState({
      remoteVersion: manifest.version,
      releaseUrl: manifest.url,
      releaseNotes: manifest.notes,
      lastCheckedAt: new Date().toISOString(),
      lastError: "",
    });
    return manifest;
  }

  async checkForUpdates(options = {}) {
    this.initialize();
    const silent = options.silent === true;

    if (!app.isPackaged) {
      this.setState({
        status: "development-build",
        detail: "Updates are only available in packaged builds.",
        checkInFlight: false,
      });
      return {
        ok: true,
        available: false,
        state: this.getState(),
      };
    }

    if (this.state.checkInFlight) {
      return {
        ok: true,
        available: this.state.available,
        state: this.getState(),
      };
    }

    this.setState({
      status: "checking",
      detail: silent ? "Checking for updates in the background." : "Checking for updates.",
      checkInFlight: true,
      lastError: "",
    });

    try {
      const manifest = await this.fetchManifest();
      const comparison = compareVersions(manifest.version, this.state.currentVersion);
      if (comparison <= 0) {
        this.setState({
          status: "up-to-date",
          detail: "Application is up to date.",
          available: false,
          downloaded: false,
          downloading: false,
          checkInFlight: false,
          downloadProgress: 0,
        });
        return {
          ok: true,
          available: false,
          manifest,
          state: this.getState(),
        };
      }

      this.setState({
        status: "update-available",
        detail: `Version ${manifest.version} is available.`,
        available: true,
        downloaded: false,
        downloading: false,
        checkInFlight: false,
        downloadProgress: 0,
      });

      if (this.autoUpdaterConfigured) {
        this.updateCheckPromise = autoUpdater.checkForUpdates();
        await this.updateCheckPromise;
      }

      return {
        ok: true,
        available: true,
        manifest,
        state: this.getState(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "update_check_failed");
      this.log(`[update] check failed: ${message}`);
      this.setState({
        status: "error",
        detail: message,
        lastError: message,
        available: false,
        downloading: false,
        downloaded: false,
        checkInFlight: false,
      });
      return {
        ok: false,
        error: "update_check_failed",
        detail: message,
        state: this.getState(),
      };
    }
  }

  async downloadUpdate() {
    this.initialize();

    if (!app.isPackaged) {
      return {
        ok: false,
        error: "development_build",
        detail: "Updates are only available in packaged builds.",
        state: this.getState(),
      };
    }

    if (!this.state.available) {
      return {
        ok: false,
        error: "no_update_available",
        detail: "No newer version is available.",
        state: this.getState(),
      };
    }

    try {
      this.setState({
        status: "downloading",
        detail: `Downloading version ${this.state.remoteVersion || "latest"}.`,
        downloading: true,
        downloaded: false,
        downloadProgress: 0,
        lastError: "",
      });
      await autoUpdater.downloadUpdate();
      return {
        ok: true,
        state: this.getState(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "update_download_failed");
      this.log(`[update] download failed: ${message}`);
      this.setState({
        status: "error",
        detail: message,
        lastError: message,
        downloading: false,
        downloaded: false,
      });
      return {
        ok: false,
        error: "update_download_failed",
        detail: message,
        state: this.getState(),
      };
    }
  }

  async installUpdate() {
    this.initialize();

    if (!this.state.downloaded) {
      return {
        ok: false,
        error: "update_not_downloaded",
        detail: "No downloaded update is ready to install.",
        state: this.getState(),
      };
    }

    this.setState({
      status: "installing",
      detail: "Closing the app to install the update.",
    });

    return {
      ok: true,
      installNow: true,
      state: this.getState(),
    };
  }

  applyUpdateAndRestart() {
    autoUpdater.quitAndInstall(false, true);
  }
}

module.exports = {
  UpdateService,
  RELEASES_BASE_URL,
  VERSION_MANIFEST_URL,
};
