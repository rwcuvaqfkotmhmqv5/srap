import { readFile } from 'fs/promises';
import { storage } from './storage';
import * as XLSX from 'xlsx';
import { InsertUser } from '@shared/schema';

/**
 * Loads user data from Excel file and stores it in memory
 * @param filePath Path to the Excel file
 * @returns Number of users loaded
 */
export async function loadExcelData(filePath: string): Promise<number> {
  try {
    // Read the Excel file
    const fileData = await readFile(filePath);
    const workbook = XLSX.read(fileData);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    
    // Clear existing users
    await storage.clearUsers();
    
    // Map Excel data to our schema and add to storage
    for (const row of data) {
      try {
        // Map Excel columns to our schema
        // Ensure these match the actual Excel column headers
        const userData: InsertUser = {
          citizenId: String(row['Citizen ID/CCCD'] || ''),
          fullName: String(row['Full Name'] || ''),
          dateOfBirth: String(row['Date of Birth'] || ''),
          phoneNumber: String(row['Phone Number'] || ''),
          email: String(row['Email'] || ''),
          address: String(row['Address'] || ''),
          status: String(row['Current Status'] || 'Active'),
          provinceCode: String(row['Province Code'] || ''),
          districtCode: String(row['District Code'] || ''),
          checkCode: String(row['Check Code'] || ''),
          departmentName: String(row['Department Name'] || ''),
          position: String(row['Position'] || ''),
          promotionUnit: String(row['Promotion Unit'] || ''),
          workplace: String(row['Workplace'] || ''),
          notes: row['Notes'] ? String(row['Notes']) : undefined,
          profileStatus: String(row['Profile Status (HSL)'] || ''),
        };
        
        // Add the user to storage
        await storage.addUser(userData);
      } catch (error) {
        console.error(`Error processing row: ${JSON.stringify(row)}`, error);
      }
    }
    
    console.log(`Loaded ${data.length} users from Excel file`);
    return data.length;
    
  } catch (error) {
    console.error('Error loading Excel data:', error);
    throw new Error(`Failed to load Excel data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
