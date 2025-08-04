-- Sample SQL queries for explanation testing

-- Basic user query
SELECT id, name, email 
FROM users 
WHERE active = 1;

-- Complex join query
SELECT 
    u.id,
    u.name,
    u.email,
    p.title as position,
    d.name as department,
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN positions p ON u.position_id = p.id
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = 1
    AND u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.name, u.email, p.title, d.name
HAVING order_count > 0
ORDER BY order_count DESC, u.name ASC
LIMIT 50;

-- Update with subquery
UPDATE users 
SET last_login = NOW() 
WHERE id IN (
    SELECT user_id 
    FROM login_sessions 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- Complex analytical query
WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(total_amount) as total_sales,
        COUNT(*) as order_count
    FROM orders
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
),
sales_growth AS (
    SELECT 
        month,
        total_sales,
        order_count,
        LAG(total_sales) OVER (ORDER BY month) as prev_month_sales,
        (total_sales - LAG(total_sales) OVER (ORDER BY month)) / LAG(total_sales) OVER (ORDER BY month) * 100 as growth_rate
    FROM monthly_sales
)
SELECT 
    month,
    total_sales,
    order_count,
    ROUND(growth_rate, 2) as growth_percentage
FROM sales_growth
WHERE growth_rate IS NOT NULL
ORDER BY month DESC;