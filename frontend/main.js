const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.auth-form');
    
    // Auth Forms
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const signinError = document.getElementById('signin-error');
    const signupError = document.getElementById('signup-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Dashboard Elements
    const analyzeForm = document.getElementById('analyze-form');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeBtnText = analyzeBtn.querySelector('.btn-text');
    const loader = analyzeBtn.querySelector('.loader');
    const analyzeError = document.getElementById('analyze-error');
    
    const fileInput = document.getElementById('audio-file');
    const fileDropArea = document.getElementById('file-drop');
    const fileNameDisplay = document.getElementById('file-name-display');
    const resultsPanel = document.getElementById('results-panel');

    // Check auth on load
    checkAuth();

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.target}-form`).classList.add('active');
        });
    });

    // Sign In
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signinError.textContent = '';
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                showDashboard();
            } else {
                signinError.textContent = data.detail || 'Sign in failed';
            }
        } catch (err) {
            signinError.textContent = 'Server connection error';
        }
    });

    // Sign Up
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupError.textContent = '';
        
        const full_name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, email, password })
            });

            const data = await response.json();
            
            if (response.status === 201) {
                // Automatically switch to signin tab
                tabs[0].click();
                document.getElementById('signin-email').value = email;
                signupError.style.color = 'var(--success)';
                signupError.textContent = 'Registration successful! Please sign in.';
                setTimeout(() => { signupError.textContent = ''; signupError.style.color = 'var(--error)'; }, 3000);
            } else {
                signupError.textContent = data.detail || 'Registration failed';
            }
        } catch (err) {
            signupError.textContent = 'Server connection error';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        showAuth();
        // Reset dashboard state
        resultsPanel.classList.add('hidden');
        analyzeForm.reset();
        fileNameDisplay.textContent = '';
        fileNameDisplay.classList.add('hidden');
    });

    // Drag and Drop Logic
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, () => fileDropArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, () => fileDropArea.classList.remove('dragover'), false);
    });

    fileDropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            updateFileName(files[0].name);
        }
    });

    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            updateFileName(this.files[0].name);
        }
    });

    function updateFileName(name) {
        fileNameDisplay.textContent = `Selected: ${name}`;
        fileNameDisplay.classList.remove('hidden');
    }

    // Analyze Audio
    analyzeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        analyzeError.textContent = '';
        
        if (!fileInput.files.length) {
            analyzeError.textContent = 'Please select an audio file.';
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('transaction_value', document.getElementById('transaction-value').value);
        // known_contact needs to be string 'true' or 'false' for FastAPI form parsing boolean
        formData.append('known_contact', document.getElementById('known-contact').checked);

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/analyze-audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                displayResults(data);
            } else {
                if (response.status === 401) {
                    logoutBtn.click(); // Token expired
                } else {
                    analyzeError.textContent = data.detail || 'Analysis failed';
                }
            }
        } catch (err) {
            analyzeError.textContent = 'Server connection error or analysis timeout.';
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            analyzeBtnText.classList.add('hidden');
            loader.classList.remove('hidden');
            analyzeBtn.disabled = true;
        } else {
            analyzeBtnText.classList.remove('hidden');
            loader.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    function displayResults(data) {
        resultsPanel.classList.remove('hidden');
        
        // Update Risk Score
        const scoreCircle = document.getElementById('score-circle');
        const riskScoreValue = document.getElementById('risk-score-value');
        const riskLevel = document.getElementById('risk-level');
        const riskRec = document.getElementById('risk-recommendation');
        
        const score = Math.round(data.risk_score * 100);
        riskScoreValue.textContent = score;
        riskLevel.textContent = data.risk_level;
        riskRec.textContent = data.recommendation;

        // Color coding
        scoreCircle.style.borderColor = 'var(--success)';
        scoreCircle.style.color = 'var(--success)';
        if (data.alert || score > 50) {
            scoreCircle.style.borderColor = 'var(--error)';
            scoreCircle.style.color = 'var(--error)';
        } else if (score > 20) {
            scoreCircle.style.borderColor = 'var(--warning)';
            scoreCircle.style.color = 'var(--warning)';
        }

        // Metrics
        if (data.metrics) {
            document.getElementById('metric-synth').textContent = `${(data.metrics.synthetic_voice_probability || 0).toFixed(1)}%`;
            document.getElementById('metric-snr').textContent = `${(data.metrics.snr_db || 0).toFixed(1)} dB`;
            document.getElementById('metric-clip').textContent = `${(data.metrics.clipping_percent || 0).toFixed(2)}%`;
        }
    }

    function checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            showDashboard();
        } else {
            showAuth();
        }
    }

    function showAuth() {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }

    function showDashboard() {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
    }
});
