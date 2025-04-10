import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { loadExcelData } from "./excel-reader";
import { loadCsvData } from "./csv-reader";
import { z } from "zod";
import { insertSearchHistorySchema } from "@shared/schema";
import session from "express-session";
import memorystore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const MemoryStore = memorystore(session);
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      secret: process.env.SESSION_SECRET || 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.session && req.session.authenticated) {
      return next();
    }
    
    // Allow login API to pass through
    if (req.path === '/api/login') {
      return next();
    }
    
    // Check if this is an API call
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // For non-API calls, allow them to pass through for client-side auth check
    next();
  };
  
  // Apply authentication middleware
  app.use(isAuthenticated);

  // Initialize by loading CSV data, fallback to Excel data if CSV fails
  try {
    const csvPath = path.resolve(process.cwd(), 'cleaned_data.csv');
    await loadCsvData(csvPath);
    console.log("Successfully loaded CSV data from cleaned_data.csv");
  } catch (csvError) {
    console.error("Failed to load CSV data from cleaned_data.csv:", csvError);
    
    // Try with the previous CSV file
    try {
      console.log("Falling back to secondary CSV data...");
      const fallbackCsvPath = path.resolve(process.cwd(), 'cleaned_data_final_v2.csv');
      await loadCsvData(fallbackCsvPath);
      console.log("Successfully loaded CSV data from cleaned_data_final_v2.csv");
    } catch (secondaryCsvError) {
      console.error("Failed to load secondary CSV data:", secondaryCsvError);
      
      // Fallback to Excel data as last resort
      try {
        console.log("Falling back to Excel data...");
        const excelPath = path.resolve(process.cwd(), '1000xlsx.xlsx');
        await loadExcelData(excelPath);
      } catch (excelError) {
        console.error("Failed to load Excel data:", excelError);
      }
    }
  }
  
  // API Endpoints
  app.get('/api/users/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const filter = req.query.filter as string || 'all';
      const page = parseInt(req.query.page as string || '1');
      const pageSize = parseInt(req.query.pageSize as string || '5');
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const result = await storage.searchUsers(query, filter, page, pageSize);
      
      // Always save search history regardless of results
      try {
        // Create search history entry
        const searchHistoryData = {
          searchQuery: query,
          searchFilter: filter,
          // Use data from first result if available, otherwise store empty strings
          citizenId: result.data.length > 0 ? result.data[0].citizenId : '',
          fullName: result.data.length > 0 ? result.data[0].fullName : '',
          dateOfBirth: result.data.length > 0 ? result.data[0].dateOfBirth : '',
          district: result.data.length > 0 ? result.data[0].districtCode : '',
          phoneNumber: result.data.length > 0 ? result.data[0].phoneNumber : '',
        };
        
        // Add to search history
        const validatedData = insertSearchHistorySchema.parse(searchHistoryData);
        await storage.addSearchHistory(validatedData);
        console.log("Search history saved:", searchHistoryData.searchQuery);
      } catch (error) {
        console.error("Failed to validate or save search history:", error);
      }
      
      res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: 'Error searching users' });
    }
  });
  
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: 'Error retrieving user' });
    }
  });
  
  app.get('/api/search-history', async (_req: Request, res: Response) => {
    try {
      const history = await storage.getSearchHistory();
      res.json({ data: history, totalCount: history.length });
    } catch (error) {
      console.error("Get search history error:", error);
      res.status(500).json({ message: 'Error retrieving search history' });
    }
  });
  
  // Reload CSV data endpoint (for development or manual refresh)
  app.post('/api/reload-csv', async (req: Request, res: Response) => {
    try {
      const csvPath = path.resolve(process.cwd(), 'cleaned_data.csv');
      const result = await loadCsvData(csvPath);
      res.json({ message: 'CSV data reloaded successfully', count: result });
    } catch (error) {
      console.error("CSV reload error:", error);
      res.status(500).json({ message: 'Error reloading CSV data' });
    }
  });
  
  // Reload Excel data endpoint (for development or manual refresh)
  app.post('/api/reload-excel', async (req: Request, res: Response) => {
    try {
      const excelPath = path.resolve(process.cwd(), '1000xlsx.xlsx');
      const result = await loadExcelData(excelPath);
      res.json({ message: 'Excel data reloaded successfully', count: result });
    } catch (error) {
      console.error("Excel reload error:", error);
      res.status(500).json({ message: 'Error reloading Excel data' });
    }
  });
  
  // Login endpoint
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      // Simple hardcoded authentication for demo
      if (username === 'admin' && password === 'admin123') {
        // Set session data
        if (req.session) {
          req.session.authenticated = true;
          req.session.user = { username };
        }
        
        res.json({ 
          success: true, 
          message: 'Login successful',
          user: { username }
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid username or password. Try admin/admin123' 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error occurred during login' 
      });
    }
  });
  
  // Logout endpoint
  app.post('/api/logout', (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ success: false, message: 'Error during logout' });
        }
        
        res.json({ success: true, message: 'Logout successful' });
      });
    } else {
      res.json({ success: true, message: 'Already logged out' });
    }
  });
  
  // Check authentication status
  app.get('/api/auth/status', (req: Request, res: Response) => {
    if (req.session && req.session.authenticated) {
      res.json({ 
        authenticated: true, 
        user: req.session.user 
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // Clear search history
  app.delete('/api/search-history', async (req: Request, res: Response) => {
    try {
      await storage.clearSearchHistory();
      res.json({ success: true, message: 'Search history cleared successfully' });
    } catch (error) {
      console.error("Clear search history error:", error);
      res.status(500).json({ 
        success: false, 
        message: 'Error clearing search history' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
