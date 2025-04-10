import { InsertSearchHistory, InsertUser } from "@shared/schema";
import type { SearchHistory as SchemaSearchHistory, User as SchemaUser } from "@shared/schema";

// Define runtime interfaces with string dates instead of Date objects
export interface User {
  id: number;
  createdAt: string;
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: string;
  provinceCode: string;
  districtCode: string;
  checkCode: string;
  departmentName: string;
  position: string;
  promotionUnit: string;
  workplace: string;
  notes?: string;
  profileStatus?: string;
}

export interface SearchHistory {
  id: number;
  searchTime: string;
  searchQuery: string;
  searchFilter: string;
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  district: string;
  phoneNumber: string;
}

export interface IStorage {
  // User operations
  addUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByCitizenId(citizenId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  clearUsers(): Promise<void>;
  searchUsers(query: string, filter: string, page: number, pageSize: number): Promise<{ 
    data: User[]; 
    totalCount: number;
    page: number;
    pageSize: number;
  }>;
  
  // Search history operations
  addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistory(): Promise<SearchHistory[]>;
  clearSearchHistory(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private searchHistory: Map<number, SearchHistory>;
  private currentUserId: number;
  private currentHistoryId: number;
  
  constructor() {
    this.users = new Map();
    this.searchHistory = new Map();
    this.currentUserId = 1;
    this.currentHistoryId = 1;
  }
  
  // User operations
  async addUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    // Create a complete user object with all required fields
    const user: User = {
      id,
      createdAt: now.toISOString(),
      citizenId: userData.citizenId || '',
      fullName: userData.fullName || '',
      dateOfBirth: userData.dateOfBirth || '',
      phoneNumber: userData.phoneNumber || '',
      email: userData.email || '',
      address: userData.address || '',
      status: userData.status || 'active',
      provinceCode: userData.provinceCode || '',
      districtCode: userData.districtCode || '',
      checkCode: userData.checkCode || '',
      departmentName: userData.departmentName || '',
      position: userData.position || '',
      promotionUnit: userData.promotionUnit || '',
      workplace: userData.workplace || '',
      notes: userData.notes || '',
      profileStatus: userData.profileStatus || '',
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByCitizenId(citizenId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.citizenId === citizenId
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async clearUsers(): Promise<void> {
    this.users.clear();
    this.currentUserId = 1;
  }
  
  async searchUsers(query: string, filter: string, page: number, pageSize: number): Promise<{ 
    data: User[]; 
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    const allUsers = Array.from(this.users.values());
    
    // Filter users based on search criteria
    const filteredUsers = allUsers.filter(user => {
      if (!query) return true;
      
      const searchQuery = query.toLowerCase();
      
      switch (filter) {
        case 'cccd':
          return user.citizenId?.toLowerCase().includes(searchQuery);
        case 'phone':
          return user.phoneNumber?.toLowerCase().includes(searchQuery);
        case 'name':
          return user.fullName?.toLowerCase().includes(searchQuery);
        case 'recruitment':
          return (
            user.departmentName?.toLowerCase().includes(searchQuery) ||
            user.position?.toLowerCase().includes(searchQuery) ||
            user.promotionUnit?.toLowerCase().includes(searchQuery) ||
            user.workplace?.toLowerCase().includes(searchQuery)
          );
        case 'address':
          return (
            user.address?.toLowerCase().includes(searchQuery) ||
            user.provinceCode?.toLowerCase().includes(searchQuery) ||
            user.districtCode?.toLowerCase().includes(searchQuery)
          );
        case 'workplace':
          return (
            user.workplace?.toLowerCase().includes(searchQuery) ||
            user.departmentName?.toLowerCase().includes(searchQuery)
          );
        case 'all':
        default:
          return (
            user.citizenId?.toLowerCase().includes(searchQuery) ||
            user.fullName?.toLowerCase().includes(searchQuery) ||
            user.phoneNumber?.toLowerCase().includes(searchQuery) ||
            user.email?.toLowerCase().includes(searchQuery) ||
            user.address?.toLowerCase().includes(searchQuery) ||
            user.position?.toLowerCase().includes(searchQuery) ||
            user.workplace?.toLowerCase().includes(searchQuery) ||
            user.departmentName?.toLowerCase().includes(searchQuery)
          );
      }
    });
    
    // Sort by recently added first
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
  async addSearchHistory(historyData: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.currentHistoryId++;
    const searchTime = new Date().toISOString();
    
    const history: SearchHistory = {
      id,
      searchTime,
      searchQuery: historyData.searchQuery,
      searchFilter: historyData.searchFilter || 'all',
      citizenId: historyData.citizenId || '',
      fullName: historyData.fullName || '',
      dateOfBirth: historyData.dateOfBirth || '',
      district: historyData.district || '',
      phoneNumber: historyData.phoneNumber || '',
    };
    
    this.searchHistory.set(id, history);
    return history;
  }
  
  async getSearchHistory(): Promise<SearchHistory[]> {
    const history = Array.from(this.searchHistory.values());
    // Sort by recent first
    return history.sort((a, b) => {
      const dateA = a.searchTime ? new Date(a.searchTime).getTime() : 0;
      const dateB = b.searchTime ? new Date(b.searchTime).getTime() : 0;
      return dateB - dateA;
    });
  }
  
  async clearSearchHistory(): Promise<void> {
    this.searchHistory.clear();
    this.currentHistoryId = 1;
  }
}

export const storage = new MemStorage();
