// Settings management functions

// Get current settings
function getSettings() {
    const defaultSettings = {
        currency: 'USD',
        theme: 'light',
        dateFormat: 'MM/DD/YYYY'
    };
    
    // Get settings from local storage or use defaults
    const settings = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SETTINGS)) || defaultSettings;
    
    return settings;
}

// Save settings
function saveSettings(newSettings) {
    // Get current settings
    const settings = getSettings();
    
    // Update with new settings
    const updatedSettings = {
        ...settings,
        ...newSettings
    };
    
    // Save to local storage
    localStorage.setItem(APP_STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    
    // Apply settings
    applySettings(updatedSettings);
    
    showNotification('Settings saved successfully', 'success');
    return true;
}

/**
 * Apply settings to the application
 * @param {Object} settings - The settings to apply
 */
function applySettings(settings) {
    if (!settings) return;
    
    console.log('Applying settings:', settings);
    
    // Apply theme
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${settings.theme}`);
    
    // If Chart.js is loaded and theme has changed, update charts
    if (window.Chart) {
        const isDarkTheme = settings.theme === 'dark';
        
        // Update Chart.js defaults based on theme
        Chart.defaults.color = isDarkTheme ? '#f5f5f5' : '#333';
        Chart.defaults.scale.grid.color = isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        Chart.defaults.scale.ticks.color = isDarkTheme ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
        
        // Force any existing charts to update
        const charts = Object.values(Chart.instances || {});
        charts.forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
    }
    
    // Apply currency and date format if needed
    // These would be used in formatting functions
}

// Export data to JSON file
function exportData() {
    // Gather all data
    const data = {
        transactions: JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.TRANSACTIONS)) || [],
        categories: JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [],
        budgets: JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.BUDGETS)) || [],
        savingsGoals: JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SAVINGS_GOALS)) || [],
        settings: JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.SETTINGS)) || {}
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a Blob containing the data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a download link and click it
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `finance-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
}

// Import data from JSON file
function importData(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            showNotification('No file selected', 'error');
            reject('No file selected');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validate data structure
                if (!data.transactions || !data.categories || !data.budgets || !data.savingsGoals || !data.settings) {
                    showNotification('Invalid backup file format', 'error');
                    reject('Invalid backup file format');
                    return;
                }
                
                // Confirm before importing
                if (confirm('Importing will replace all your current data. Are you sure you want to continue?')) {
                    // Save data to local storage
                    localStorage.setItem(APP_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
                    localStorage.setItem(APP_STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
                    localStorage.setItem(APP_STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
                    localStorage.setItem(APP_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(data.savingsGoals));
                    localStorage.setItem(APP_STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
                    
                    // Apply settings
                    applySettings(data.settings);
                    
                    showNotification('Data imported successfully. Refreshing page...', 'success');
                    
                    // Refresh the page after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    
                    resolve();
                } else {
                    reject('Import canceled by user');
                }
            } catch (error) {
                showNotification('Error parsing backup file', 'error');
                reject('Error parsing backup file: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            showNotification('Error reading file', 'error');
            reject('Error reading file');
        };
        
        reader.readAsText(file);
    });
}

// Clear all application data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        if (confirm('This will delete ALL your financial data. Type "DELETE" to confirm.')) {
            // Remove all data from local storage
            localStorage.removeItem(APP_STORAGE_KEYS.TRANSACTIONS);
            localStorage.removeItem(APP_STORAGE_KEYS.CATEGORIES);
            localStorage.removeItem(APP_STORAGE_KEYS.BUDGETS);
            localStorage.removeItem(APP_STORAGE_KEYS.SAVINGS_GOALS);
            
            // Keep settings
            const settings = getSettings();
            
            // Reinitialize with default data
            initializeAppData();
            
            // Restore settings
            localStorage.setItem(APP_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            
            showNotification('All data has been cleared. Refreshing page...', 'success');
            
            // Refresh the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
}

// Initialize settings form
function initSettingsForm() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    
    const currencySelect = document.getElementById('currency-setting');
    const themeSelect = document.getElementById('theme-setting');
    const dateFormatSelect = document.getElementById('date-format-setting');
    
    // Get current settings
    const settings = getSettings();
    console.log('Current settings in form:', settings);
    
    // Set form values
    if (currencySelect) currencySelect.value = settings.currency;
    if (themeSelect) themeSelect.value = settings.theme;
    if (dateFormatSelect) dateFormatSelect.value = settings.dateFormat;
    
    // Immediately reflect the current theme in UI
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${settings.theme}`);
    
    // Add submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newSettings = {
            currency: currencySelect ? currencySelect.value : settings.currency,
            theme: themeSelect ? themeSelect.value : settings.theme,
            dateFormat: dateFormatSelect ? dateFormatSelect.value : settings.dateFormat
        };
        
        console.log('Saving new settings:', newSettings);
        saveSettings(newSettings);
        
        // Show visual feedback for current theme
        document.querySelectorAll('.theme-indicator').forEach(el => el.remove());
        const indicator = document.createElement('div');
        indicator.className = 'theme-indicator';
        indicator.innerHTML = `<p>Theme: ${newSettings.theme} is now active!</p>`;
        indicator.style.padding = '10px';
        indicator.style.margin = '10px 0';
        indicator.style.backgroundColor = newSettings.theme === 'dark' ? '#3d566e' : '#ecf0f1';
        indicator.style.color = newSettings.theme === 'dark' ? '#f5f5f5' : '#333';
        indicator.style.borderRadius = '5px';
        form.appendChild(indicator);
    });
    
    // Set up data management buttons
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const clearBtn = document.getElementById('clear-data-btn');
    const demoDataBtn = document.getElementById('load-demo-data-btn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            // Create and trigger file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'application/json';
            fileInput.style.display = 'none';
            
            fileInput.addEventListener('change', function() {
                if (fileInput.files.length > 0) {
                    importData(fileInput.files[0]);
                }
            });
            
            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
    
    // Set up demo data button
    if (demoDataBtn) {
        demoDataBtn.addEventListener('click', function() {
            if (confirm('Loading demo data will replace any existing data. Are you sure you want to continue?')) {
                loadDemoData();
            }
        });
    }
} 