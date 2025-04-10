// Reports and visualization functions

// Generate income vs expense report
function generateIncomeExpenseReport(startDate, endDate) {
    // Get filtered transactions
    const transactions = getTransactions({
        startDate,
        endDate
    });
    
    // Calculate total income and expenses
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Calculate balance
    const balance = income - expenses;
    
    // Group expenses by month
    const monthlyData = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                income: 0,
                expense: 0,
                balance: 0
            };
        }
        
        if (transaction.type === 'income') {
            monthlyData[monthKey].income += parseFloat(transaction.amount);
        } else {
            monthlyData[monthKey].expense += parseFloat(transaction.amount);
        }
        
        monthlyData[monthKey].balance = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });
    
    // Convert to array and sort by month
    const monthlyArray = Object.keys(monthlyData).map(month => ({
        month,
        ...monthlyData[month]
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    return {
        summary: {
            income,
            expenses,
            balance
        },
        monthly: monthlyArray
    };
}

// Generate category spending report
function generateCategorySpendingReport(startDate, endDate) {
    // Get filtered expenses
    const expenses = getTransactions({
        type: 'expense',
        startDate,
        endDate
    });
    
    // Get categories
    const categories = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    
    // Group expenses by category
    const categorySpending = {};
    let totalSpending = 0;
    
    expenses.forEach(expense => {
        if (!categorySpending[expense.category]) {
            categorySpending[expense.category] = 0;
        }
        
        categorySpending[expense.category] += parseFloat(expense.amount);
        totalSpending += parseFloat(expense.amount);
    });
    
    // Convert to array and add category details
    const categoryArray = Object.keys(categorySpending).map(categoryId => {
        const category = categories.find(c => c.id === categoryId) || { name: 'Unknown', color: '#ccc' };
        const amount = categorySpending[categoryId];
        const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
        
        return {
            id: categoryId,
            name: category.name,
            color: category.color,
            amount,
            percentage
        };
    });
    
    // Sort by amount (highest first)
    categoryArray.sort((a, b) => b.amount - a.amount);
    
    return {
        total: totalSpending,
        categories: categoryArray
    };
}

// Generate monthly trend report
function generateMonthlyTrendReport(startDate, endDate) {
    // Get filtered transactions
    const transactions = getTransactions({
        startDate,
        endDate
    });
    
    // Group by month and category
    const monthlyTrend = {};
    const categories = {};
    
    transactions.forEach(transaction => {
        // Only include expenses for trends
        if (transaction.type !== 'expense') return;
        
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyTrend[monthKey]) {
            monthlyTrend[monthKey] = {};
        }
        
        if (!monthlyTrend[monthKey][transaction.category]) {
            monthlyTrend[monthKey][transaction.category] = 0;
        }
        
        // Track category for later reference
        categories[transaction.category] = true;
        
        // Add amount to month/category
        monthlyTrend[monthKey][transaction.category] += parseFloat(transaction.amount);
    });
    
    // Get category details
    const categoryDetails = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.CATEGORIES)) || [];
    const categoryList = Object.keys(categories).map(catId => {
        const category = categoryDetails.find(c => c.id === catId) || { name: 'Unknown', color: '#ccc' };
        return {
            id: catId,
            name: category.name,
            color: category.color
        };
    });
    
    // Convert to sorted array for charting
    const months = Object.keys(monthlyTrend).sort();
    
    return {
        months,
        categories: categoryList,
        data: monthlyTrend
    };
}

// Render income vs expense chart using Chart.js
function renderIncomeExpenseChart(report, container) {
    // Check if container exists
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Create summary section
    const summary = document.createElement('div');
    summary.className = 'report-summary';
    summary.innerHTML = `
        <div class="summary-item income">
            <h4>Total Income</h4>
            <div class="amount">${formatCurrency(report.summary.income)}</div>
        </div>
        <div class="summary-item expenses">
            <h4>Total Expenses</h4>
            <div class="amount">${formatCurrency(report.summary.expenses)}</div>
        </div>
        <div class="summary-item balance ${report.summary.balance >= 0 ? 'positive' : 'negative'}">
            <h4>Balance</h4>
            <div class="amount">${formatCurrency(report.summary.balance)}</div>
        </div>
    `;
    
    container.appendChild(summary);
    
    // If no monthly data, show message
    if (report.monthly.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-data-message';
        message.textContent = 'No data available for the selected period.';
        container.appendChild(message);
        return;
    }
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.height = '400px';
    container.appendChild(chartContainer);
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    canvas.id = 'income-expense-chart';
    chartContainer.appendChild(canvas);

    // Format labels for months
    const labels = report.monthly.map(data => {
        const [year, month] = data.month.split('-');
        return new Date(year, month - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' });
    });
    
    // Get data arrays
    const incomeData = report.monthly.map(data => data.income);
    const expenseData = report.monthly.map(data => data.expense);
    const balanceData = report.monthly.map(data => data.balance);
    
    // Create Chart.js chart
    const incomeExpenseChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Balance',
                    data: balanceData,
                    type: 'line',
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                    tension: 0.1,
                    yAxisID: 'y1',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, true);
                        }
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Balance'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, true);
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                },
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Income vs Expenses by Month',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
    
    // Add monthly data table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'report-table-container';
    
    const table = document.createElement('table');
    table.className = 'report-table';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expenses</th>
            <th>Balance</th>
        </tr>
    `;
    
    // Table body
    const tbody = document.createElement('tbody');
    
    report.monthly.forEach(monthData => {
        const [year, month] = monthData.month.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${monthName} ${year}</td>
            <td>${formatCurrency(monthData.income)}</td>
            <td>${formatCurrency(monthData.expense)}</td>
            <td class="${monthData.balance >= 0 ? 'positive-amount' : 'negative-amount'}">
                ${formatCurrency(monthData.balance)}
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
}

// Render category spending chart using Chart.js
function renderCategorySpendingChart(report, container) {
    // Check if container exists
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Create summary section
    const summary = document.createElement('div');
    summary.className = 'report-summary';
    summary.innerHTML = `
        <div class="summary-item expenses">
            <h4>Total Expenses</h4>
            <div class="amount">${formatCurrency(report.total)}</div>
        </div>
    `;
    
    container.appendChild(summary);
    
    // If no categories, show message
    if (report.categories.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-data-message';
        message.textContent = 'No data available for the selected period.';
        container.appendChild(message);
        return;
    }
    
    // Create chart container with flexbox layout
    const chartRow = document.createElement('div');
    chartRow.className = 'chart-row';
    chartRow.style.display = 'flex';
    chartRow.style.flexWrap = 'wrap';
    chartRow.style.justifyContent = 'space-between';
    chartRow.style.marginBottom = '2rem';
    container.appendChild(chartRow);

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.flexBasis = '60%';
    chartContainer.style.minWidth = '300px';
    chartContainer.style.height = '400px';
    chartRow.appendChild(chartContainer);
    
    // Create legend container
    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-container';
    legendContainer.style.flexBasis = '35%';
    legendContainer.style.minWidth = '250px';
    legendContainer.style.padding = '1rem';
    chartRow.appendChild(legendContainer);
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    canvas.id = 'category-spending-chart';
    chartContainer.appendChild(canvas);
    
    // Prepare data for Chart.js
    const labels = report.categories.map(category => category.name);
    const data = report.categories.map(category => category.amount);
    const backgroundColor = report.categories.map(category => category.color);
    
    // Create Chart.js chart
    const categoryChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: false // We'll create a custom legend
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / report.total) * 100).toFixed(1);
                            return context.label + ': ' + formatCurrency(value) + ' (' + percentage + '%)';
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Spending by Category',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
    
    // Create custom legend
    const legend = document.createElement('div');
    legend.className = 'custom-chart-legend';
    legend.innerHTML = '<h4>Categories</h4>';
    
    report.categories.forEach(category => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <span class="legend-color" style="background-color: ${category.color}"></span>
            <span class="legend-label">${category.name}</span>
            <span class="legend-value">${formatCurrency(category.amount)} (${category.percentage.toFixed(1)}%)</span>
        `;
        legend.appendChild(legendItem);
    });
    
    legendContainer.appendChild(legend);
    
    // Add category data table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'report-table-container';
    
    const table = document.createElement('table');
    table.className = 'report-table';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Percentage</th>
        </tr>
    `;
    
    // Table body
    const tbody = document.createElement('tbody');
    
    report.categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="category-color" style="background-color: ${category.color}"></span>
                ${category.name}
            </td>
            <td>${formatCurrency(category.amount)}</td>
            <td>${category.percentage.toFixed(1)}%</td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
}

// Render monthly trend chart using Chart.js
function renderMonthlyTrendChart(report, container) {
    // Check if container exists
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // If no months, show message
    if (report.months.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-data-message';
        message.textContent = 'No data available for the selected period.';
        container.appendChild(message);
        return;
    }
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.height = '400px';
    chartContainer.style.marginBottom = '2rem';
    container.appendChild(chartContainer);
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    canvas.id = 'monthly-trend-chart';
    chartContainer.appendChild(canvas);

    // Prepare data for Chart.js
    const labels = report.months.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    // Prepare datasets for stacked bar chart
    const datasets = [];
    
    // First, calculate the total for each month to create a line chart
    const totalData = report.months.map(month => {
        return Object.values(report.data[month]).reduce((sum, value) => sum + value, 0);
    });
    
    // Add line chart for total
    datasets.push({
        label: 'Total',
        data: totalData,
        type: 'line',
        borderColor: 'rgba(52, 73, 94, 1)',
        backgroundColor: 'rgba(52, 73, 94, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: 'rgba(52, 73, 94, 1)',
        pointRadius: 4,
        yAxisID: 'y1'
    });
    
    // Add bar charts for each category
    report.categories.forEach(category => {
        const categoryData = report.months.map(month => {
            return report.data[month][category.id] || 0;
        });
        
        datasets.push({
            label: category.name,
            data: categoryData,
            backgroundColor: category.color,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 1,
            categoryPercentage: 0.8,
            barPercentage: 1
        });
    });
    
    // Create Chart.js chart
    const trendChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, true);
                        }
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, true);
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                },
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Monthly Spending by Category',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });

    // Add monthly breakdown table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'report-table-container';
    tableContainer.style.overflowX = 'auto';
    
    const table = document.createElement('table');
    table.className = 'report-table trend-table';
    
    // Table header
    let headerHtml = '<thead><tr><th>Category</th>';
    report.months.forEach(month => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
        headerHtml += `<th>${monthName}</th>`;
    });
    headerHtml += '</tr></thead>';
    
    // Table body
    let bodyHtml = '<tbody>';
    
    // Add a row for each category
    report.categories.forEach(category => {
        bodyHtml += `<tr>
            <td><span class="category-color" style="background-color: ${category.color}"></span>${category.name}</td>`;
        
        report.months.forEach(month => {
            const amount = report.data[month][category.id] || 0;
            bodyHtml += `<td>${formatCurrency(amount)}</td>`;
        });
        
        bodyHtml += '</tr>';
    });
    
    // Add total row
    bodyHtml += '<tr class="total-row"><td><strong>Total</strong></td>';
    
    report.months.forEach(month => {
        const total = Object.values(report.data[month]).reduce((sum, value) => sum + value, 0);
        bodyHtml += `<td><strong>${formatCurrency(total)}</strong></td>`;
    });
    
    bodyHtml += '</tr></tbody>';
    
    table.innerHTML = headerHtml + bodyHtml;
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
}

// Generate and render a report
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const resultsContainer = document.getElementById('report-results');
    
    if (!resultsContainer) return;
    
    // Validate dates
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showNotification('Start date cannot be after end date', 'error');
        return;
    }
    
    // Show loading message
    resultsContainer.innerHTML = '<div class="loading-indicator">Generating report...</div>';
    
    // Get current theme
    const settings = getSettings();
    const isDarkTheme = settings.theme === 'dark';
    
    // Create chart theme options based on current theme
    const chartTheme = {
        color: isDarkTheme ? '#f5f5f5' : '#333',
        gridColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        tickColor: isDarkTheme ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
    };
    
    // Apply theme to Chart.js defaults
    Chart.defaults.color = chartTheme.color;
    Chart.defaults.scale.grid.color = chartTheme.gridColor;
    Chart.defaults.scale.ticks.color = chartTheme.tickColor;
    
    // Generate the appropriate report with a slight delay to show loading
    setTimeout(() => {
        let report;
        switch (reportType) {
            case 'income-expense':
                report = generateIncomeExpenseReport(startDate, endDate);
                renderIncomeExpenseChart(report, resultsContainer);
                break;
                
            case 'category-spending':
                report = generateCategorySpendingReport(startDate, endDate);
                renderCategorySpendingChart(report, resultsContainer);
                break;
                
            case 'monthly-trend':
                report = generateMonthlyTrendReport(startDate, endDate);
                renderMonthlyTrendChart(report, resultsContainer);
                break;
                
            default:
                resultsContainer.innerHTML = '<p class="error-message">Unknown report type selected.</p>';
        }
    }, 100);
} 