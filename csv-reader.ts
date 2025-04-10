import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { InsertUser } from '@shared/schema';
import { storage } from './storage';

/**
 * Loads user data from CSV file and stores it in memory
 * @param filePath Path to the CSV file
 * @returns Number of users loaded
 */
export async function loadCsvData(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let count = 0;

    // Clear the existing users
    storage.clearUsers().catch(console.error);

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Extract province and district from address if possible
        let provinceCode = '';
        let districtCode = '';
        
        const address = data['Địa chỉ'] || '';
        const addressParts = address.split('-').map((part: string) => part.trim());
        
        if (addressParts.length >= 2) {
          // Last part is usually the province/city
          provinceCode = addressParts[addressParts.length - 1] || '';
          // Second to last part is usually the district
          districtCode = addressParts[addressParts.length - 2] || '';
        }
        
        // Create a unique ID from CCCD or use a placeholder
        const citizenId = data.CCCD || data['CCCD'] || `TEMP-${Math.floor(Math.random() * 1000000)}`;
        
        // Generate a simple email based on the name if absent
        let email = '';
        if (data['Họ tên']) {
          // Convert Vietnamese name to simple email format
          const nameParts = data['Họ tên'].toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
          email = `${nameParts}@example.com`;
        }
        
        // Extract workplace address
        const workplaceAddress = data['Địa chỉ làm việc'] || '';
        
        // Map the CSV column names to our schema
        const userData: InsertUser = {
          citizenId: citizenId,
          fullName: data['Họ tên'] || '',
          dateOfBirth: data['Ngày sinh'] || '',
          phoneNumber: data['Số điện thoại'] || '',
          email: email,
          address: address,
          status: 'active', // Default status
          provinceCode: provinceCode,
          districtCode: districtCode,
          checkCode: citizenId.slice(-6) || '', // Use last 6 digits of CCCD as check code
          departmentName: data['Nơi làm việc'] || '', // Department name / Workplace
          position: data['Chức vụ'] || '',
          promotionUnit: data['Nơi làm việc'] || '', // For management unit, use workplace
          workplace: data['Địa chỉ làm việc'] || '', // Use workplace address field
        };

        // Add to storage
        storage.addUser(userData)
          .then(() => {
            count++;
          })
          .catch(console.error);

        results.push(data);
      })
      .on('end', () => {
        console.log(`Loaded ${count} users from CSV file`);
        resolve(count);
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        reject(err);
      });
  });
}