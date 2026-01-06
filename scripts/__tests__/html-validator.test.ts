/**
 * HTML Validator Tests
 * Unit tests cho HTML validation logic
 */

import { HTMLValidator, ValidationRule } from '../html-validator';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('HTMLValidator', () => {
  let validator: HTMLValidator;
  
  beforeEach(() => {
    validator = new HTMLValidator({
      verbose: false,
      exitOnError: false
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should return error when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = await validator.validateFile('nonexistent.html');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].rule).toBe('file-not-found');
    });

    it('should validate HTML with unquoted attributes', async () => {
      const htmlContent = `
        <div class=container>
          <img src=image.jpg alt="test">
        </div>
      `;
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(htmlContent);
      
      const result = await validator.validateFile('test.html');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.rule === 'unquoted-attributes')).toBe(true);
    });

    it('should validate HTML with malformed viewport', async () => {
      const htmlContent = `
        <meta name="viewport" content=width=device-width>
      `;
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(htmlContent);
      
      const result = await validator.validateFile('test.html');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.rule === 'malformed-viewport')).toBe(true);
    });

    it('should pass validation for valid HTML', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Page</title>
        </head>
        <body>
          <div class="container">
            <img src="image.jpg" alt="test image">
          </div>
        </body>
        </html>
      `;
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(htmlContent);
      
      const result = await validator.validateFile('test.html');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('custom rules', () => {
    it('should apply custom validation rules', async () => {
      const customRule: ValidationRule = {
        name: 'custom-test',
        pattern: /test-pattern/,
        message: 'Custom test pattern found',
        severity: 'error'
      };
      
      const customValidator = new HTMLValidator({
        rules: [customRule],
        verbose: false
      });
      
      const htmlContent = '<div>test-pattern</div>';
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(htmlContent);
      
      const result = await customValidator.validateFile('test.html');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.rule === 'custom-test')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle file read errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockRejectedValue(new Error('Read error'));
      
      const result = await validator.validateFile('test.html');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].rule).toBe('validation-error');
    });
  });
});

describe('Integration Tests', () => {
  it('should validate real HTML files', async () => {
    // Create temporary test file
    const testHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test</title>
      </head>
      <body>
        <div class="test">Valid HTML</div>
      </body>
      </html>
    `;
    
    const testFile = path.join(__dirname, 'temp-test.html');
    
    try {
      await fs.promises.writeFile(testFile, testHtml);
      
      const validator = new HTMLValidator({
        files: [testFile],
        verbose: false
      });
      
      const results = await validator.validateAll();
      
      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(true);
    } finally {
      // Cleanup
      try {
        await fs.promises.unlink(testFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});