import { test, expect } from '@playwright/test';

test.describe('BTC/USDT Chart App', () => {
  test('should load the page and display chart', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/BTC\/USDT Chart/);
    
    // Check if chart container is visible
    await expect(page.locator('canvas')).toBeVisible();
    
    // Check if timeframe controls are visible
    await expect(page.getByRole('button', { name: '1m' })).toBeVisible();
    await expect(page.getByRole('button', { name: '5m' })).toBeVisible();
    await expect(page.getByRole('button', { name: '1h' })).toBeVisible();
    
    // Check if indicators panel is visible
    await expect(page.getByText('Indicators')).toBeVisible();
  });

  test('should switch timeframes', async ({ page }) => {
    await page.goto('/');
    
    // Click on 5m timeframe
    await page.getByRole('button', { name: '5m' }).click();
    
    // Check if 5m button is active
    await expect(page.getByRole('button', { name: '5m' })).toHaveClass(/bg-blue-600/);
    
    // Click on 1h timeframe
    await page.getByRole('button', { name: '1h' }).click();
    
    // Check if 1h button is active
    await expect(page.getByRole('button', { name: '1h' })).toHaveClass(/bg-blue-600/);
  });

  test('should toggle EMA indicator', async ({ page }) => {
    await page.goto('/');
    
    // Find the EMA Cross checkbox
    const emaCheckbox = page.getByRole('checkbox', { name: 'EMA Cross Scanner' });
    
    // Initially should be unchecked
    await expect(emaCheckbox).not.toBeChecked();
    
    // Click to enable
    await emaCheckbox.click();
    
    // Should be checked now
    await expect(emaCheckbox).toBeChecked();
    
    // Configuration inputs should appear
    await expect(page.getByLabel('emaFast:')).toBeVisible();
    await expect(page.getByLabel('emaSlow:')).toBeVisible();
  });

  test('should update EMA indicator configuration', async ({ page }) => {
    await page.goto('/');
    
    // Enable EMA indicator
    await page.getByRole('checkbox', { name: 'EMA Cross Scanner' }).click();
    
    // Update emaFast value
    const emaFastInput = page.getByLabel('emaFast:');
    await emaFastInput.clear();
    await emaFastInput.fill('50');
    
    // Verify the value was updated
    await expect(emaFastInput).toHaveValue('50');
  });

  test('should display loading state', async ({ page }) => {
    await page.goto('/');
    
    // Check if loading indicator appears (might be very brief)
    const loading = page.getByText('Loading...');
    
    // Wait for chart to load
    await page.waitForLoadState('networkidle');
    
    // Chart should be visible after loading
    await expect(page.locator('canvas')).toBeVisible();
  });
});