// assets/script.js - Core functionality (Fixed)

// Language translations
const translations = {
    en: {
        analyzing: 'Analyzing code quality, please wait...',
        inputRequired: 'Please enter your code!',
        overallScore: 'Overall Score',
        functionality: 'Functionality',
        performance: 'Performance',
        maintainability: 'Maintainability',
        robustness: 'Robustness',
        functionalityDetails: 'Functionality Details',
        performanceDetails: 'Performance Details',
        maintainabilityDetails: 'Maintainability Details',
        robustnessDetails: 'Robustness Details'
    },
    zh: {
        analyzing: '正在分析代码质量，请稍候...',
        inputRequired: '请输入代码！',
        overallScore: '综合评分',
        functionality: '功能正确性',
        performance: '性能效率',
        maintainability: '可维护性',
        robustness: '健壮性',
        functionalityDetails: '功能正确性详情',
        performanceDetails: '性能效率详情',
        maintainabilityDetails: '可维护性详情',
        robustnessDetails: '健壮性详情'
    }
};

// Detect current language from URL
function getCurrentLanguage() {
    return window.location.pathname.includes('/zh_cn/') ? 'zh' : 'en';
}

const currentLang = getCurrentLanguage();
const t = translations[currentLang];

// Main analysis function
function analyzeCode() {
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('language');

    if (!codeInput || !languageSelect) {
        console.error('Required elements not found');
        return;
    }

    const code = codeInput.value.trim();
    const language = languageSelect.value;

    if (!code) {
        alert(t.inputRequired);
        return;
    }

    // Show loading state
    const loadingEl = document.getElementById('loading');
    const resultsEl = document.getElementById('results');

    if (loadingEl) loadingEl.classList.add('show');
    if (resultsEl) resultsEl.classList.remove('show');

    // Simulate analysis process (replace with actual API call if needed)
    setTimeout(() => {
        try {
            const analysis = performAnalysis(code, language);
            displayResults(analysis);

            if (loadingEl) loadingEl.classList.remove('show');
            if (resultsEl) {
                resultsEl.classList.add('show');
                // Smooth scroll to results
                resultsEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } catch (error) {
            console.error('Analysis error:', error);
            if (loadingEl) loadingEl.classList.remove('show');
            alert('An error occurred during analysis. Please try again.');
        }
    }, 2000);
}

// Core analysis logic
function performAnalysis(code, language) {
    const lines = code.split('\n').filter(line => line.trim());

    // Run all analysis modules
    const correctness = analyzeCorrectness(code, language);
    const performance = analyzePerformance(code, language);
    const maintainability = analyzeMaintainability(code, language);
    const robustness = analyzeRobustness(code, language);

    // Calculate overall score
    const overall = Math.round(
        (correctness.score + performance.score +
            maintainability.score + robustness.score) / 4
    );

    return {
        overall,
        correctness,
        performance,
        maintainability,
        robustness
    };
}

// Functionality Analysis
function analyzeCorrectness(code, language) {
    let score = 85;
    const issues = [];

    const patterns = {
        javascript: {
            function: /function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>|class\s+\w+/,
            return: /return\s+/,
            conditional: /if\s*\(|switch\s*\(|\?\s*.*\s*:/
        },
        python: {
            function: /def\s+\w+|class\s+\w+/,
            return: /return\s+/,
            conditional: /if\s+|elif\s+|match\s+/
        },
        java: {
            function: /(?:public|private|protected)?\s*(?:static\s+)?[\w<>[\]]+\s+\w+\s*\(|class\s+\w+/,
            return: /return\s+/,
            conditional: /if\s*\(|switch\s*\(/
        },
        cpp: {
            function: /(?:[\w:]+\s+)+\w+\s*\([^)]*\)\s*(?:const)?\s*{|class\s+\w+/,
            return: /return\s+/,
            conditional: /if\s*\(|switch\s*\(/
        },
        go: {
            function: /func\s+\w+/,
            return: /return\s+/,
            conditional: /if\s+|switch\s+/
        },
        rust: {
            function: /fn\s+\w+|impl\s+/,
            return: /return\s+/,
            conditional: /if\s+|match\s+/
        }
    };

    const langPatterns = patterns[language] || patterns.javascript;

    // Check function definitions
    if (langPatterns.function.test(code)) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ? '代码包含函数或类定义' : 'Code contains function or class definitions'
        });
    } else {
        score -= 10;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ? '未检测到函数或类定义' : 'No function or class definitions detected'
        });
    }

    // Check return statements
    if (langPatterns.return.test(code)) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ? '包含返回语句' : 'Contains return statements'
        });
    } else {
        score -= 5;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ? '未检测到返回语句' : 'No return statements detected'
        });
    }

    // Check conditional logic
    if (langPatterns.conditional.test(code)) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ? '包含条件判断逻辑' : 'Contains conditional logic'
        });
    } else {
        score -= 5;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ? '缺少条件判断可能影响功能完整性' : 'Missing conditionals may affect functionality'
        });
    }

    // Check for edge case handling
    if (/<=|>=|===|!==|==|!=/.test(code)) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ? '包含边界条件检查' : 'Contains boundary condition checks'
        });
    } else {
        score -= 5;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ? '建议添加边界条件检查' : 'Consider adding boundary checks'
        });
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
}

// Performance Analysis
function analyzePerformance(code, language) {
    let score = 80;
    const metrics = [];

    // Analyze nested loops
    const forLoopMatches = code.match(/for\s*\(/g);
    const whileLoopMatches = code.match(/while\s*\(/g);
    const forLoops = forLoopMatches ? forLoopMatches.length : 0;
    const whileLoops = whileLoopMatches ? whileLoopMatches.length : 0;

    // Detect nested loops
    const nestedLoopPattern = /for[^{]*\{[^}]*for|while[^{]*\{[^}]*while|for[^{]*\{[^}]*while|while[^{]*\{[^}]*for/gs;
    const nestedLoopMatches = code.match(nestedLoopPattern);
    const nestedLoops = nestedLoopMatches ? nestedLoopMatches.length : 0;

    if (nestedLoops > 0) {
        score -= nestedLoops * 10;
        metrics.push({
            label: currentLang === 'zh' ? '嵌套循环' : 'Nested Loops',
            value: `${nestedLoops}`,
            warning: currentLang === 'zh' ?
                '可能存在 O(n²) 或更高复杂度' :
                'Possible O(n²) or higher complexity'
        });
    } else if (forLoops > 0 || whileLoops > 0) {
        metrics.push({
            label: currentLang === 'zh' ? '循环结构' : 'Loop Structure',
            value: currentLang === 'zh' ? '良好' : 'Good'
        });
    }

    // Detect recursion
    const functionMatches = code.match(/(?:function|def|fn)\s+(\w+)/g);
    if (functionMatches && functionMatches.length > 0) {
        functionMatches.forEach(fn => {
            const nameMatch = fn.match(/(?:function|def|fn)\s+(\w+)/);
            if (nameMatch && nameMatch[1]) {
                const name = nameMatch[1];
                const pattern = new RegExp(`\\b${name}\\s*\\(`, 'g');
                const callMatches = code.match(pattern);
                const calls = callMatches ? callMatches.length - 1 : 0;
                if (calls > 0) {
                    metrics.push({
                        label: currentLang === 'zh' ? '递归调用' : 'Recursive Calls',
                        value: currentLang === 'zh' ? '检测到' : 'Detected',
                        warning: currentLang === 'zh' ?
                            '注意栈溢出风险和性能影响' :
                            'Watch for stack overflow and performance'
                    });
                    score -= 5;
                }
            }
        });
    }

    // Code complexity assessment
    const lines = code.split('\n').filter(l => l.trim());
    const linesCount = lines.length;
    const complexityMatches = code.match(/if|for|while|case|catch|\|\||&&/g);
    const cyclomaticComplexity = complexityMatches ? complexityMatches.length + 1 : 1;

    metrics.push({
        label: currentLang === 'zh' ? '代码行数' : 'Lines of Code',
        value: linesCount.toString()
    });

    metrics.push({
        label: currentLang === 'zh' ? '圈复杂度' : 'Cyclomatic Complexity',
        value: cyclomaticComplexity.toString()
    });

    if (cyclomaticComplexity > 10) {
        score -= 10;
        metrics.push({
            label: currentLang === 'zh' ? '复杂度评估' : 'Complexity Rating',
            value: currentLang === 'zh' ? '高' : 'High',
            warning: currentLang === 'zh' ?
                '建议重构以降低复杂度' :
                'Consider refactoring to reduce complexity'
        });
    } else if (cyclomaticComplexity > 5) {
        metrics.push({
            label: currentLang === 'zh' ? '复杂度评估' : 'Complexity Rating',
            value: currentLang === 'zh' ? '中等' : 'Moderate'
        });
        score -= 5;
    } else {
        metrics.push({
            label: currentLang === 'zh' ? '复杂度评估' : 'Complexity Rating',
            value: currentLang === 'zh' ? '低' : 'Low'
        });
    }

    // Check for performance anti-patterns
    if (/\.push\(.*\).*\.push\(/s.test(code) && forLoops > 0) {
        metrics.push({
            label: currentLang === 'zh' ? '数组操作' : 'Array Operations',
            value: currentLang === 'zh' ? '检测到' : 'Detected',
            warning: currentLang === 'zh' ?
                '循环中多次push可能影响性能' :
                'Multiple pushes in loop may affect performance'
        });
        score -= 5;
    }

    return { score: Math.max(0, Math.min(100, score)), metrics };
}

// Maintainability Analysis
function analyzeMaintainability(code, language) {
    let score = 75;
    const issues = [];

    const commentPatterns = {
        javascript: /\/\/|\/\*|\*\//g,
        python: /#|'''|"""/g,
        java: /\/\/|\/\*|\*\//g,
        cpp: /\/\/|\/\*|\*\//g,
        go: /\/\/|\/\*|\*\//g,
        rust: /\/\/|\/\*|\*\//g
    };

    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim()).length;
    const commentPattern = commentPatterns[language] || commentPatterns.javascript;
    const commentMatches = code.match(commentPattern);
    const commentCount = commentMatches ? commentMatches.length : 0;
    const commentRatio = nonEmptyLines > 0 ? commentCount / nonEmptyLines : 0;

    // Comment quality
    if (commentRatio > 0.15) {
        score += 10;
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                `注释率: ${(commentRatio * 100).toFixed(1)}% - 优秀` :
                `Comment ratio: ${(commentRatio * 100).toFixed(1)}% - Excellent`
        });
    } else if (commentRatio > 0.05) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                `注释率: ${(commentRatio * 100).toFixed(1)}% - 良好` :
                `Comment ratio: ${(commentRatio * 100).toFixed(1)}% - Good`
        });
    } else {
        score -= 10;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '注释不足，建议增加代码说明' :
                'Insufficient comments, consider adding documentation'
        });
    }

    // Naming conventions
    const camelCaseMatches = code.match(/[a-z][A-Za-z0-9]+/g);
    const snakeCaseMatches = code.match(/[a-z]+_[a-z0-9_]+/g);
    const camelCaseCount = camelCaseMatches ? camelCaseMatches.length : 0;
    const snakeCaseCount = snakeCaseMatches ? snakeCaseMatches.length : 0;

    if (camelCaseCount > 5 || snakeCaseCount > 5) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '遵循命名规范' :
                'Follows naming conventions'
        });
    } else {
        score -= 5;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '建议使用一致的命名规范' :
                'Consider using consistent naming conventions'
        });
    }

    // Function length
    const avgLineLength = nonEmptyLines > 0 ? code.length / nonEmptyLines : 0;
    if (avgLineLength < 50) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '代码行长度适中' :
                'Line length is appropriate'
        });
    } else {
        score -= 5;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '部分代码行过长，建议分行' :
                'Some lines are too long, consider breaking them'
        });
    }

    // Code duplication check
    const trimmedLines = lines.map(l => l.trim()).filter(l => l);
    const uniqueLines = new Set(trimmedLines);
    const duplicationRatio = trimmedLines.length > 0 ? 1 - (uniqueLines.size / trimmedLines.length) : 0;

    if (duplicationRatio < 0.1) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '代码重复率低' :
                'Low code duplication'
        });
    } else if (duplicationRatio < 0.3) {
        score -= 5;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '存在一定代码重复' :
                'Some code duplication detected'
        });
    } else {
        score -= 15;
        issues.push({
            type: 'fail',
            text: currentLang === 'zh' ?
                '代码重复率较高，建议提取公共函数' :
                'High duplication, consider extracting common functions'
        });
    }

    // Modular structure
    if (nonEmptyLines < 100) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '代码结构简洁' :
                'Code structure is concise'
        });
    } else if (nonEmptyLines > 300) {
        score -= 10;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '代码较长，建议模块化拆分' :
                'Code is lengthy, consider modularization'
        });
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
}

// Robustness Analysis
function analyzeRobustness(code, language) {
    let score = 70;
    const issues = [];

    const errorHandling = {
        javascript: /try|catch|finally|throw/,
        python: /try|except|finally|raise/,
        java: /try|catch|finally|throw|throws/,
        cpp: /try|catch|throw/,
        go: /if\s+err\s*!=\s*nil|errors\./,
        rust: /Result|Option|unwrap|expect|\?/
    };

    const pattern = errorHandling[language] || errorHandling.javascript;

    // Exception handling
    if (pattern.test(code)) {
        score += 15;
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '包含异常处理机制' :
                'Contains exception handling'
        });
    } else {
        issues.push({
            type: 'fail',
            text: currentLang === 'zh' ?
                '缺少异常处理，建议添加错误处理逻辑' :
                'Missing exception handling, consider adding error handling'
        });
    }

    // Input validation
    const validationPatterns = /typeof|instanceof|isNaN|null|undefined|None|nil|isEmpty/;
    if (validationPatterns.test(code)) {
        score += 10;
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '包含输入验证' :
                'Contains input validation'
        });
    } else {
        score -= 5;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '建议添加输入参数验证' :
                'Consider adding input parameter validation'
        });
    }

    // Boundary checks
    if (/<=|>=|<|>/.test(code)) {
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '包含边界条件检查' :
                'Contains boundary condition checks'
        });
    } else {
        score -= 10;
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '注意检查边界条件' :
                'Pay attention to boundary conditions'
        });
    }

    // Resource cleanup
    if (/finally|close|dispose|defer|drop/.test(code)) {
        score += 5;
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '包含资源清理代码' :
                'Contains resource cleanup code'
        });
    } else {
        issues.push({
            type: 'warning',
            text: currentLang === 'zh' ?
                '如有资源使用，建议添加清理逻辑' :
                'If using resources, consider adding cleanup logic'
        });
    }

    // Defensive programming
    if (/assert|require|ensure|invariant/.test(code)) {
        score += 5;
        issues.push({
            type: 'pass',
            text: currentLang === 'zh' ?
                '使用了防御性编程技术' :
                'Uses defensive programming techniques'
        });
    }

    return { score: Math.max(0, Math.min(100, score)), issues };
}

// Display results
function displayResults(analysis) {
    const overallScoreEl = document.getElementById('overallScore');
    if (overallScoreEl) {
        overallScoreEl.textContent = analysis.overall;
    }

    // Update score displays with animation
    displayScore('correctness', analysis.correctness.score);
    displayScore('performance', analysis.performance.score);
    displayScore('maintainability', analysis.maintainability.score);
    displayScore('robustness', analysis.robustness.score);

    // Update detail sections
    displayDetails('correctnessDetails', analysis.correctness.issues);
    displayPerformanceDetails('performanceDetails', analysis.performance.metrics);
    displayDetails('maintainabilityDetails', analysis.maintainability.issues);
    displayDetails('robustnessDetails', analysis.robustness.issues);
}

function displayScore(category, score) {
    const scoreEl = document.getElementById(`${category}Score`);
    const barEl = document.getElementById(`${category}Bar`);

    if (scoreEl) {
        scoreEl.textContent = score;
    }

    if (barEl) {
        // Delay for animation effect
        setTimeout(() => {
            barEl.style.width = score + '%';
        }, 100);
    }
}

function displayDetails(elementId, items) {
    const container = document.getElementById(elementId);
    if (!container || !items) return;

    const itemsHTML = items.map(item => {
        const icon = item.type === 'pass' ? '✓' : item.type === 'fail' ? '✗' : '⚠';
        return `
            <div class="test-item ${item.type}">
                <strong>${icon}</strong>
                ${escapeHtml(item.text)}
            </div>
        `;
    }).join('');

    container.innerHTML = itemsHTML;
}

function displayPerformanceDetails(elementId, metrics) {
    const container = document.getElementById(elementId);
    if (!container || !metrics) return;

    const metricsHTML = metrics.map(metric => {
        const warningHTML = metric.warning ?
            `<div class="test-item warning">⚠ ${escapeHtml(metric.warning)}</div>` : '';

        return `
            <div class="metric">
                <span>${escapeHtml(metric.label)}:</span>
                <span class="metric-value">${escapeHtml(metric.value)}</span>
            </div>
            ${warningHTML}
        `;
    }).join('');

    container.innerHTML = metricsHTML;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard shortcut for analysis (Ctrl+Enter or Cmd+Enter)
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                analyzeCode();
            }
        });
    }

    // Update loading text based on language
    const loadingText = document.querySelector('.loading p');
    if (loadingText && t && t.analyzing) {
        loadingText.textContent = t.analyzing;
    }

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    console.log('Code Quality Testing Platform initialized');
    console.log('Language:', currentLang);
    console.log('Press Ctrl+Enter (or Cmd+Enter) in code editor to analyze');
});