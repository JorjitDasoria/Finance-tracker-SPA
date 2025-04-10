// Router class for handling SPA navigation
class Router {
    constructor(routes) {
        this.routes = routes;
        this.mainElement = document.querySelector('main');
        
        // Initialize event listeners for navigation
        this.initializeEventListeners();
        
        // Process initial route
        this.processURL();
    }
    
    // Initialize event listeners for browser navigation
    initializeEventListeners() {
        // Handle browser navigation events (back/forward)
        window.addEventListener('popstate', () => {
            this.processURL();
        });
        
        // Handle link clicks for navigation
        document.addEventListener('click', (e) => {
            // Check if the clicked element is a navigation link
            const link = e.target.closest('a[href^="#/"]');
            if (link) {
                e.preventDefault();
                
                // Get path from href attribute
                const path = link.getAttribute('href').substring(1); // Remove # from href
                
                // Navigate to the path
                this.navigateTo(path);
                
                // Update active navigation state
                this.updateActiveNavigation(path);
            }
        });
    }
    
    // Process current URL and render the appropriate route
    processURL() {
        // Get the path from URL hash
        const path = window.location.hash.substring(1) || '/dashboard';
        
        // Find matching route
        const route = this.findRoute(path);
        
        // Render route content
        if (route) {
            this.renderRoute(route);
            this.updateActiveNavigation(path);
        } else {
            // If no route found, redirect to dashboard
            this.navigateTo('/dashboard');
        }
    }
    
    // Find route object that matches the given path
    findRoute(path) {
        return this.routes.find(route => route.path === path);
    }
    
    // Render route content
    renderRoute(route) {
        // Clear main content area
        this.mainElement.innerHTML = '';
        
        // Add container for route content
        const container = document.createElement('div');
        container.className = 'container';
        container.innerHTML = route.template();
        
        // Append container to main element
        this.mainElement.appendChild(container);
        
        // Call route controller to initialize functionality
        if (route.controller) {
            route.controller();
        }
    }
    
    // Navigate to a specific path
    navigateTo(path) {
        // Update URL
        window.location.hash = path;
        
        // Process URL change
        this.processURL();
    }
    
    // Update active navigation link in UI
    updateActiveNavigation(path) {
        // Remove active class from all navigation items
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current navigation item
        const activeLink = document.querySelector(`nav a[href="#${path}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

// Templates for different views
function dashboardTemplate() {
    return `
        <div class="dashboard-page">
            <h2 class="mb-4">Dashboard</h2>
            <div class="dashboard-summary row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="summary-card income-card p-3 h-100">
                        <h3 class="fs-5"><i class="fas fa-arrow-down me-2"></i>Income</h3>
                        <p class="value fs-2 fw-bold mb-1" id="income-value">$0.00</p>
                        <p class="label text-white-50">this month</p>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="summary-card expense-card p-3 h-100">
                        <h3 class="fs-5"><i class="fas fa-arrow-up me-2"></i>Expenses</h3>
                        <p class="value fs-2 fw-bold mb-1" id="expenses-value">$0.00</p>
                        <p class="label text-white-50">this month</p>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="summary-card balance-card p-3 h-100">
                        <h3 class="fs-5"><i class="fas fa-wallet me-2"></i>Balance</h3>
                        <p class="value fs-2 fw-bold mb-1" id="balance-value">$0.00</p>
                        <p class="label text-white-50">this month</p>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-light">
                            <h3 class="card-title mb-0"><i class="fas fa-exchange-alt me-2"></i>Recent Transactions</h3>
                        </div>
                        <div class="card-body" id="recent-transactions">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-light">
                            <h3 class="card-title mb-0"><i class="fas fa-chart-pie me-2"></i>Budget Overview</h3>
                        </div>
                        <div class="card-body" id="budget-overview">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-12 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-light">
                            <h3 class="card-title mb-0"><i class="fas fa-piggy-bank me-2"></i>Savings Goals</h3>
                        </div>
                        <div class="card-body" id="savings-overview">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function transactionsTemplate() {
    return `
        <div class="transactions-page">
            <h2 class="mb-4">Transactions</h2>
            
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-light">
                            <h3 class="card-title mb-0"><i class="fas fa-plus-circle me-2"></i>Add Transaction</h3>
                        </div>
                        <div class="card-body">
                            <form id="transaction-form">
                                <div class="mb-3">
                                    <label for="transaction-type" class="form-label">Type</label>
                                    <select id="transaction-type" class="form-select" required>
                                        <option value="" disabled selected>Select type</option>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="transaction-category" class="form-label">Category</label>
                                    <select id="transaction-category" class="form-select" required>
                                        <option value="" disabled selected>Select a category</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="transaction-amount" class="form-label">Amount</label>
                                    <div class="input-group">
                                        <span class="input-group-text">$</span>
                                        <input type="number" id="transaction-amount" class="form-control" min="0.01" step="0.01" placeholder="0.00" required>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="transaction-date" class="form-label">Date</label>
                                    <input type="date" id="transaction-date" class="form-control" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="transaction-description" class="form-label">Description (Optional)</label>
                                    <input type="text" id="transaction-description" class="form-control" placeholder="Description">
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-plus-circle me-1"></i> Add Transaction
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-8 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-light">
                            <h3 class="card-title mb-0"><i class="fas fa-list me-2"></i>Transaction List</h3>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6 mb-2">
                                    <label for="filter-type" class="form-label">Filter by Type</label>
                                    <select id="filter-type" class="form-select">
                                        <option value="all">All</option>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                                
                                <div class="col-md-6 mb-2">
                                    <label for="filter-month" class="form-label">Filter by Month</label>
                                    <input type="month" id="filter-month" class="form-control">
                                </div>
                            </div>
                            
                            <div class="table-responsive">
                                <table class="table table-hover" id="transactions-list">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Category</th>
                                            <th>Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="5" class="text-center py-3">
                                                <div class="spinner-border text-primary" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function budgetTemplate() {
    return `
        <div class="budget-page">
            <h2>Budget</h2>
            
            <div class="page-columns">
                <div class="form-column">
                    <div class="content-card">
                        <h3>Budget Settings</h3>
                        <form id="budget-form">
                            <div class="form-group">
                                <label for="budget-category">Category</label>
                                <select id="budget-category" required>
                                    <option value="" disabled selected>Select a category</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="budget-amount">Monthly Budget</label>
                                <input type="number" id="budget-amount" min="0.01" step="0.01" placeholder="0.00" required>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Save Budget</button>
                        </form>
                    </div>
                </div>
                
                <div class="data-column">
                    <div class="content-card">
                        <h3>Current Month Budget Progress</h3>
                        <div id="budget-progress">
                            <p>Loading budget progress...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function savingsTemplate() {
    return `
        <div class="savings-page">
            <h2>Savings Goals</h2>
            
            <div class="page-columns">
                <div class="form-column">
                    <div class="content-card">
                        <h3>Create Savings Goal</h3>
                        <form id="savings-goal-form">
                            <div class="form-group">
                                <label for="goal-name">Goal Name</label>
                                <input type="text" id="goal-name" placeholder="e.g., Vacation, New Car" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="goal-target-amount">Target Amount</label>
                                <input type="number" id="goal-target-amount" min="0.01" step="0.01" placeholder="0.00" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="goal-target-date">Target Date</label>
                                <input type="date" id="goal-target-date" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="goal-initial-amount">Initial Amount (Optional)</label>
                                <input type="number" id="goal-initial-amount" min="0" step="0.01" placeholder="0.00">
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Create Goal</button>
                        </form>
                    </div>
                </div>
                
                <div class="data-column">
                    <div class="content-card">
                        <h3>Your Savings Goals</h3>
                        <div id="savings-goals-list">
                            <p>Loading savings goals...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function reportsTemplate() {
    return `
        <div class="reports-page">
            <h2>Financial Reports</h2>
            
            <div class="content-card">
                <h3>Generate Report</h3>
                
                <div class="report-controls">
                    <div class="form-group">
                        <label for="report-type">Report Type</label>
                        <select id="report-type">
                            <option value="income-expense">Income vs. Expenses</option>
                            <option value="category-spending">Spending by Category</option>
                            <option value="monthly-trend">Monthly Trend</option>
                        </select>
                    </div>
                    
                    <div class="date-range">
                        <div class="form-group">
                            <label for="report-start-date">Start Date</label>
                            <input type="date" id="report-start-date">
                        </div>
                        
                        <div class="form-group">
                            <label for="report-end-date">End Date</label>
                            <input type="date" id="report-end-date">
                        </div>
                    </div>
                    
                    <button id="generate-report-btn" class="btn btn-primary">Generate Report</button>
                </div>
                
                <div id="report-results">
                    <p>Select report type and date range above to generate a report.</p>
                </div>
            </div>
        </div>
    `;
}

function settingsTemplate() {
    return `
        <div class="settings-page">
            <h2>Settings</h2>
            
            <div class="content-card">
                <h3>Application Settings</h3>
                
                <form id="settings-form">
                    <div class="form-group">
                        <label for="currency-setting">Currency</label>
                        <select id="currency-setting">
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">British Pound (GBP)</option>
                            <option value="JPY">Japanese Yen (JPY)</option>
                            <option value="CNY">Chinese Yuan (CNY)</option>
                            <option value="INR">Indian Rupee (INR)</option>
                            <option value="CAD">Canadian Dollar (CAD)</option>
                            <option value="AUD">Australian Dollar (AUD)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="theme-setting">Theme</label>
                        <select id="theme-setting">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="date-format-setting">Date Format</label>
                        <select id="date-format-setting">
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </form>
            </div>
            
            <div class="content-card">
                <h3>Data Management</h3>
                
                <div class="data-management-controls">
                    <button id="export-data-btn" class="btn btn-secondary">Export Data</button>
                    <div class="import-container">
                        <label for="import-data-file" class="btn btn-secondary">Import Data</label>
                        <input type="file" id="import-data-file" accept=".json" style="display: none;">
                    </div>
                    <button id="clear-data-btn" class="btn btn-danger">Clear All Data</button>
                </div>
                
                <div class="demo-data-section" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                    <h4>Demo Data</h4>
                    <p>Load sample data to test the application functionality.</p>
                    <button id="load-demo-data-btn" class="btn btn-primary">Load Demo Data</button>
                </div>
            </div>
        </div>
    `;
}

// Note: The router instance is created in app.js when the application initializes 