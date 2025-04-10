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
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  district: string;
  phoneNumber: string;
  searchFilter: string;
  searchQuery: string;
}

export interface SearchResult {
  data: User[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface SearchHistoryResult {
  data: SearchHistory[];
  totalCount: number;
}
