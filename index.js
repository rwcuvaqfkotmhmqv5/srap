// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  searchHistory;
  currentUserId;
  currentHistoryId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.searchHistory = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentHistoryId = 1;
  }
  // User operations
  async addUser(userData) {
    const id = this.currentUserId++;
    const now = /* @__PURE__ */ new Date();
    const user = {
      id,
      createdAt: now.toISOString(),
      citizenId: userData.citizenId || "",
      fullName: userData.fullName || "",
      dateOfBirth: userData.dateOfBirth || "",
      phoneNumber: userData.phoneNumber || "",
      email: userData.email || "",
      address: userData.address || "",
      status: userData.status || "active",
      provinceCode: userData.provinceCode || "",
      districtCode: userData.districtCode || "",
      checkCode: userData.checkCode || "",
      departmentName: userData.departmentName || "",
      position: userData.position || "",
      promotionUnit: userData.promotionUnit || "",
      workplace: userData.workplace || "",
      notes: userData.notes || "",
      profileStatus: userData.profileStatus || ""
    };
    this.users.set(id, user);
    return user;
  }
  async getUserById(id) {
    return this.users.get(id);
  }
  async getUserByCitizenId(citizenId) {
    return Array.from(this.users.values()).find(
      (user) => user.citizenId === citizenId
    );
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async clearUsers() {
    this.users.clear();
    this.currentUserId = 1;
  }
  async searchUsers(query, filter, page, pageSize) {
    const allUsers = Array.from(this.users.values());
    const filteredUsers = allUsers.filter((user) => {
      if (!query) return true;
      const searchQuery = query.toLowerCase();
      switch (filter) {
        case "cccd":
          return user.citizenId?.toLowerCase().includes(searchQuery);
        case "phone":
          return user.phoneNumber?.toLowerCase().includes(searchQuery);
        case "name":
          return user.fullName?.toLowerCase().includes(searchQuery);
        case "recruitment":
          return user.departmentName?.toLowerCase().includes(searchQuery) || user.position?.toLowerCase().includes(searchQuery) || user.promotionUnit?.toLowerCase().includes(searchQuery) || user.workplace?.toLowerCase().includes(searchQuery);
        case "address":
          return user.address?.toLowerCase().includes(searchQuery) || user.provinceCode?.toLowerCase().includes(searchQuery) || user.districtCode?.toLowerCase().includes(searchQuery);
        case "workplace":
          return user.workplace?.toLowerCase().includes(searchQuery) || user.departmentName?.toLowerCase().includes(searchQuery);
        case "all":
        default:
          return user.citizenId?.toLowerCase().includes(searchQuery) || user.fullName?.toLowerCase().includes(searchQuery) || user.phoneNumber?.toLowerCase().includes(searchQuery) || user.email?.toLowerCase().includes(searchQuery) || user.address?.toLowerCase().includes(searchQuery) || user.position?.toLowerCase().includes(searchQuery) || user.workplace?.toLowerCase().includes(searchQuery) || user.departmentName?.toLowerCase().includes(searchQuery);
      }
    });
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    const totalCount = sortedUsers.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);
    return {
      data: paginatedUsers,
      totalCount,
      page,
      pageSize
    };
  }
  // Search history operations
  async addSearchHistory(historyData) {
    const id = this.currentHistoryId++;
    const searchTime = (/* @__PURE__ */ new Date()).toISOString();
    const history = {
      id,
      searchTime,
      searchQuery: historyData.searchQuery,
      searchFilter: historyData.searchFilter || "all",
      citizenId: historyData.citizenId || "",
      fullName: historyData.fullName || "",
      dateOfBirth: historyData.dateOfBirth || "",
      district: historyData.district || "",
      phoneNumber: historyData.phoneNumber || ""
    };
    this.searchHistory.set(id, history);
    return history;
  }
  async getSearchHistory() {
    const history = Array.from(this.searchHistory.values());
    return history.sort((a, b) => {
      const dateA = a.searchTime ? new Date(a.searchTime).getTime() : 0;
      const dateB = b.searchTime ? new Date(b.searchTime).getTime() : 0;
      return dateB - dateA;
    });
  }
  async clearSearchHistory() {
    this.searchHistory.clear();
    this.currentHistoryId = 1;
  }
};
var storage = new MemStorage();

// server/routes.ts
import path from "path";

// server/excel-reader.ts
import { readFile } from "fs/promises";
import * as XLSX from "xlsx";
async function loadExcelData(filePath) {
  try {
    const fileData = await readFile(filePath);
    const workbook = XLSX.read(fileData);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    await storage.clearUsers();
    for (const row of data) {
      try {
        const userData = {
          citizenId: String(row["Citizen ID/CCCD"] || ""),
          fullName: String(row["Full Name"] || ""),
          dateOfBirth: String(row["Date of Birth"] || ""),
          phoneNumber: String(row["Phone Number"] || ""),
          email: String(row["Email"] || ""),
          address: String(row["Address"] || ""),
          status: String(row["Current Status"] || "Active"),
          provinceCode: String(row["Province Code"] || ""),
          districtCode: String(row["District Code"] || ""),
          checkCode: String(row["Check Code"] || ""),
          departmentName: String(row["Department Name"] || ""),
          position: String(row["Position"] || ""),
          promotionUnit: String(row["Promotion Unit"] || ""),
          workplace: String(row["Workplace"] || ""),
          notes: row["Notes"] ? String(row["Notes"]) : void 0,
          profileStatus: String(row["Profile Status (HSL)"] || "")
        };
        await storage.addUser(userData);
      } catch (error) {
        console.error(`Error processing row: ${JSON.stringify(row)}`, error);
      }
    }
    console.log(`Loaded ${data.length} users from Excel file`);
    return data.length;
  } catch (error) {
    console.error("Error loading Excel data:", error);
    throw new Error(`Failed to load Excel data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// server/csv-reader.ts
import * as fs from "fs";
import csvParser from "csv-parser";
async function loadCsvData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;
    storage.clearUsers().catch(console.error);
    fs.createReadStream(filePath).pipe(csvParser()).on("data", (data) => {
      let provinceCode = "";
      let districtCode = "";
      const address = data["\u0110\u1ECBa ch\u1EC9"] || "";
      const addressParts = address.split("-").map((part) => part.trim());
      if (addressParts.length >= 2) {
        provinceCode = addressParts[addressParts.length - 1] || "";
        districtCode = addressParts[addressParts.length - 2] || "";
      }
      const citizenId = data.CCCD || data["CCCD"] || `TEMP-${Math.floor(Math.random() * 1e6)}`;
      let email = "";
      if (data["H\u1ECD t\xEAn"]) {
        const nameParts = data["H\u1ECD t\xEAn"].toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");
        email = `${nameParts}@example.com`;
      }
      const workplaceAddress = data["\u0110\u1ECBa ch\u1EC9 l\xE0m vi\u1EC7c"] || "";
      const userData = {
        citizenId,
        fullName: data["H\u1ECD t\xEAn"] || "",
        dateOfBirth: data["Ng\xE0y sinh"] || "",
        phoneNumber: data["S\u1ED1 \u0111i\u1EC7n tho\u1EA1i"] || "",
        email,
        address,
        status: "active",
        // Default status
        provinceCode,
        districtCode,
        checkCode: citizenId.slice(-6) || "",
        // Use last 6 digits of CCCD as check code
        departmentName: data["N\u01A1i l\xE0m vi\u1EC7c"] || "",
        // Department name / Workplace
        position: data["Ch\u1EE9c v\u1EE5"] || "",
        promotionUnit: data["N\u01A1i l\xE0m vi\u1EC7c"] || "",
        // For management unit, use workplace
        workplace: data["\u0110\u1ECBa ch\u1EC9 l\xE0m vi\u1EC7c"] || ""
        // Use workplace address field
      };
      storage.addUser(userData).then(() => {
        count++;
      }).catch(console.error);
      results.push(data);
    }).on("end", () => {
      console.log(`Loaded ${count} users from CSV file`);
      resolve(count);
    }).on("error", (err) => {
      console.error("Error reading CSV file:", err);
      reject(err);
    });
  });
}

// shared/schema.ts
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  citizenId: text("citizen_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  address: text("address"),
  status: text("status").default("Active"),
  provinceCode: text("province_code"),
  districtCode: text("district_code"),
  checkCode: text("check_code"),
  departmentName: text("department_name"),
  position: text("position"),
  promotionUnit: text("promotion_unit"),
  workplace: text("workplace"),
  notes: text("notes"),
  profileStatus: text("profile_status"),
  createdAt: timestamp("created_at").defaultNow()
});
var searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  searchQuery: text("search_query").notNull(),
  searchFilter: text("search_filter").default("all"),
  citizenId: text("citizen_id"),
  fullName: text("full_name"),
  dateOfBirth: text("date_of_birth"),
  district: text("district"),
  phoneNumber: text("phone_number"),
  searchTime: timestamp("search_time").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  searchTime: true
});

// server/routes.ts
import session from "express-session";
import memorystore from "memorystore";
async function registerRoutes(app2) {
  const MemoryStore = memorystore(session);
  app2.use(
    session({
      cookie: { maxAge: 864e5 },
      // 24 hours
      secret: process.env.SESSION_SECRET || "keyboard cat",
      resave: false,
      saveUninitialized: true,
      store: new MemoryStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      })
    })
  );
  const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.authenticated) {
      return next();
    }
    if (req.path === "/api/login") {
      return next();
    }
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  app2.use(isAuthenticated);
  try {
    const csvPath = path.resolve(process.cwd(), "cleaned_data.csv");
    await loadCsvData(csvPath);
    console.log("Successfully loaded CSV data from cleaned_data.csv");
  } catch (csvError) {
    console.error("Failed to load CSV data from cleaned_data.csv:", csvError);
    try {
      console.log("Falling back to secondary CSV data...");
      const fallbackCsvPath = path.resolve(process.cwd(), "cleaned_data_final_v2.csv");
      await loadCsvData(fallbackCsvPath);
      console.log("Successfully loaded CSV data from cleaned_data_final_v2.csv");
    } catch (secondaryCsvError) {
      console.error("Failed to load secondary CSV data:", secondaryCsvError);
      try {
        console.log("Falling back to Excel data...");
        const excelPath = path.resolve(process.cwd(), "1000xlsx.xlsx");
        await loadExcelData(excelPath);
      } catch (excelError) {
        console.error("Failed to load Excel data:", excelError);
      }
    }
  }
  app2.get("/api/users/search", async (req, res) => {
    try {
      const query = req.query.query;
      const filter = req.query.filter || "all";
      const page = parseInt(req.query.page || "1");
      const pageSize = parseInt(req.query.pageSize || "5");
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const result = await storage.searchUsers(query, filter, page, pageSize);
      try {
        const searchHistoryData = {
          searchQuery: query,
          searchFilter: filter,
          // Use data from first result if available, otherwise store empty strings
          citizenId: result.data.length > 0 ? result.data[0].citizenId : "",
          fullName: result.data.length > 0 ? result.data[0].fullName : "",
          dateOfBirth: result.data.length > 0 ? result.data[0].dateOfBirth : "",
          district: result.data.length > 0 ? result.data[0].districtCode : "",
          phoneNumber: result.data.length > 0 ? result.data[0].phoneNumber : ""
        };
        const validatedData = insertSearchHistorySchema.parse(searchHistoryData);
        await storage.addSearchHistory(validatedData);
        console.log("Search history saved:", searchHistoryData.searchQuery);
      } catch (error) {
        console.error("Failed to validate or save search history:", error);
      }
      res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Error searching users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error retrieving user" });
    }
  });
  app2.get("/api/search-history", async (_req, res) => {
    try {
      const history = await storage.getSearchHistory();
      res.json({ data: history, totalCount: history.length });
    } catch (error) {
      console.error("Get search history error:", error);
      res.status(500).json({ message: "Error retrieving search history" });
    }
  });
  app2.post("/api/reload-csv", async (req, res) => {
    try {
      const csvPath = path.resolve(process.cwd(), "cleaned_data.csv");
      const result = await loadCsvData(csvPath);
      res.json({ message: "CSV data reloaded successfully", count: result });
    } catch (error) {
      console.error("CSV reload error:", error);
      res.status(500).json({ message: "Error reloading CSV data" });
    }
  });
  app2.post("/api/reload-excel", async (req, res) => {
    try {
      const excelPath = path.resolve(process.cwd(), "1000xlsx.xlsx");
      const result = await loadExcelData(excelPath);
      res.json({ message: "Excel data reloaded successfully", count: result });
    } catch (error) {
      console.error("Excel reload error:", error);
      res.status(500).json({ message: "Error reloading Excel data" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }
      if (username === "admin" && password === "admin123") {
        if (req.session) {
          req.session.authenticated = true;
          req.session.user = { username };
        }
        res.json({
          success: true,
          message: "Login successful",
          user: { username }
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid username or password. Try admin/admin123"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error occurred during login"
      });
    }
  });
  app2.post("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ success: false, message: "Error during logout" });
        }
        res.json({ success: true, message: "Logout successful" });
      });
    } else {
      res.json({ success: true, message: "Already logged out" });
    }
  });
  app2.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.authenticated) {
      res.json({
        authenticated: true,
        user: req.session.user
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  app2.delete("/api/search-history", async (req, res) => {
    try {
      await storage.clearSearchHistory();
      res.json({ success: true, message: "Search history cleared successfully" });
    } catch (error) {
      console.error("Clear search history error:", error);
      res.status(500).json({
        success: false,
        message: "Error clearing search history"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
