import { ELIXIR_TROOPS, DARK_TROOPS, HEROES, HERO_PETS, ALL_SPELLS, TOWN_HALL_DATA, TROOP_SYNERGY } from './data.js';

let currentUser = null;
let chatHistory = [];
let authMode = 'signin';
const SESSION_KEY = 'clashAttackSession';
const MIN_PASSWORD_LEN = 8;
const USERNAME_RE = /^[a-zA-Z0-9_]{2,32}$/;

// Storage wrapper to use localStorage instead of window.storage
const storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value ? { key, value } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
  async list(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return { keys };
  }
};

function randomSaltHex() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function derivePasswordHash(password, saltHex) {
  if (!saltHex || saltHex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(saltHex)) {
    throw new Error('Invalid password data');
  }
  const enc = new TextEncoder();
  const pairs = saltHex.match(/.{1,2}/g);
  if (!pairs) throw new Error('Invalid password data');
  const salt = Uint8Array.from(pairs.map((b) => parseInt(b, 16)));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeUsername(raw) {
  return raw.trim();
}

function validateUsername(username) {
  if (!USERNAME_RE.test(username)) {
    return 'Use 2–32 characters: letters, numbers, or underscore only.';
  }
  return null;
}

/** Sign-in must accept older accounts (hyphens, etc.); signup stays strict. */
function validateUsernameSignIn(username) {
  const t = username.trim();
  if (!t) return 'Please enter your username.';
  if (t.length > 32) return 'Username must be 32 characters or fewer.';
  return null;
}

function validatePasswordForSignup(password) {
  if (password.length < MIN_PASSWORD_LEN) {
    return `Password must be at least ${MIN_PASSWORD_LEN} characters.`;
  }
  return null;
}

async function verifyStoredPassword(user, password) {
  if (user.passwordHash && user.salt) {
    try {
      const hash = await derivePasswordHash(password, user.salt);
      return hash === user.passwordHash;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  if (user.password != null) {
    return user.password === password;
  }
  return false;
}

async function persistUserHashed(userKey, user, password) {
  const { username, strategies } = user;
  const salt = randomSaltHex();
  const passwordHash = await derivePasswordHash(password, salt);
  await storage.set(
    userKey,
    JSON.stringify({
      username,
      salt,
      passwordHash,
      strategies: strategies || []
    })
  );
}

// Auth functions
window.handleAuth = async function (event) {
  if (event && event.preventDefault) event.preventDefault();
  const username = normalizeUsername(document.getElementById('username').value);
  const password = document.getElementById('password').value;
  const confirmEl = document.getElementById('confirmPassword');
  const msgDiv = document.getElementById('authMessage');

  const nameErr =
    authMode === 'signup' ? validateUsername(username) : validateUsernameSignIn(username);
  if (nameErr) {
    msgDiv.innerHTML = `<div class="error-message">${nameErr}</div>`;
    return;
  }
  if (!password) {
    msgDiv.innerHTML = '<div class="error-message">Please enter your password.</div>';
    return;
  }

  try {
    const rawUsername = document.getElementById('username').value;
    const trimmedKey = `user:${username}`;
    let userData = await storage.get(trimmedKey);
    let resolvedKey = trimmedKey;
    if (!userData && rawUsername !== username) {
      const rawKey = `user:${rawUsername}`;
      const rawData = await storage.get(rawKey);
      if (rawData) {
        userData = rawData;
        resolvedKey = rawKey;
      }
    }

    if (authMode === 'signup') {
      if (!window.crypto?.subtle) {
        msgDiv.innerHTML =
          '<div class="error-message">Creating an account needs Web Crypto. Use <strong>http://localhost</strong> or HTTPS (not <code>file://</code> or some LAN URLs).</div>';
        return;
      }
      const pwErr = validatePasswordForSignup(password);
      if (pwErr) {
        msgDiv.innerHTML = `<div class="error-message">${pwErr}</div>`;
        return;
      }
      if (password !== confirmEl.value) {
        msgDiv.innerHTML = '<div class="error-message">Passwords do not match.</div>';
        return;
      }
      if (userData) {
        msgDiv.innerHTML =
          '<div class="error-message">That username is already taken. Sign in instead or pick another name.</div>';
        return;
      }
      await persistUserHashed(trimmedKey, { username, strategies: [] }, password);
      currentUser = username;
      saveSession(username);
      msgDiv.innerHTML = '<div class="success-message">Account created. Opening the app…</div>';
      setTimeout(() => {
        showApp();
        loadUserData();
      }, 400);
      return;
    }

    // Sign in
    if (!userData) {
      msgDiv.innerHTML =
        '<div class="error-message">No account found for that username. Use “Create account” to register.</div>';
      return;
    }
    const user = JSON.parse(userData.value);
    if (user.passwordHash && user.salt && !window.crypto?.subtle) {
      msgDiv.innerHTML =
        '<div class="error-message">This account uses an encrypted password. Open the app via <strong>http://localhost</strong> or HTTPS so your browser can verify it.</div>';
      return;
    }
    const ok = await verifyStoredPassword(user, password);
    if (!ok) {
      msgDiv.innerHTML = '<div class="error-message">Incorrect password.</div>';
      return;
    }
    if (user.password != null && !user.passwordHash && window.crypto?.subtle) {
      try {
        await persistUserHashed(resolvedKey, user, password);
      } catch (e) {
        console.error('Could not upgrade stored password', e);
      }
    }
    currentUser = typeof user.username === 'string' ? user.username : username;
    saveSession(currentUser);
    showApp();
    loadUserData();
  } catch (error) {
    msgDiv.innerHTML = '<div class="error-message">Something went wrong. Please try again.</div>';
    console.error(error);
  }
};

function saveSession(username) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, at: Date.now() }));
  } catch (e) {
    console.warn('Could not save session', e);
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    /* ignore */
  }
}

function showApp() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('appContent').classList.remove('hidden');
  document.getElementById('userInfo').innerHTML = `👤 ${escapeHtml(currentUser)} | <a href="#" id="logoutLink" style="color: white; text-decoration: none;">Log out</a>`;
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  updateTroopsForTH();
  loadSavedStrategies();
  loadMetaGuide();
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

window.logout = function () {
  currentUser = null;
  chatHistory = [];
  clearSession();
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('appContent').classList.add('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  const c = document.getElementById('confirmPassword');
  if (c) c.value = '';
  document.getElementById('authMessage').innerHTML = '';
  document.getElementById('chatMessages').innerHTML = `
    <div class="message assistant">
      Hello! I'm your Clash of Clans AI assistant. Ask me anything about attack strategies, troop compositions, base layouts, or general gameplay tips for any Town Hall level!
    </div>
  `;
};

async function loadUserData() {
  try {
    const chatKey = `chat:${currentUser}`;
    const chatData = await storage.get(chatKey);
    if (chatData) {
      chatHistory = JSON.parse(chatData.value);
      renderChatHistory();
    }
  } catch (error) {
    console.log('No previous chat history');
  }
}

// Troop selection
window.updateTroopsForTH = function() {
  const th = parseInt(document.getElementById('townHall').value);
  
  const elixirContainer = document.getElementById('elixirTroops');
  const darkContainer = document.getElementById('darkTroops');
  const spellsContainer = document.getElementById('spells');
  const heroesContainer = document.getElementById('heroes');
  const petsContainer = document.getElementById('pets');
  
  // Elixir troops
  elixirContainer.innerHTML = ELIXIR_TROOPS.slice(0, Math.min(th + 2, ELIXIR_TROOPS.length)).map(troop => 
    `<label class="troop-option">
      <input type="checkbox" value="${troop}" class="troop-checkbox">
      <span>${troop}</span>
    </label>`
  ).join('');
  
  // Dark troops (TH7+)
  if (th >= 7) {
    darkContainer.innerHTML = DARK_TROOPS.slice(0, Math.min(th - 5, DARK_TROOPS.length)).map(troop => 
      `<label class="troop-option">
        <input type="checkbox" value="${troop}" class="troop-checkbox">
        <span>${troop}</span>
      </label>`
    ).join('');
  } else {
    darkContainer.innerHTML = '<p style="color: #999;">Unlocks at TH7</p>';
  }
  
  // Spells
  spellsContainer.innerHTML = ALL_SPELLS.slice(0, Math.min(th + 1, ALL_SPELLS.length)).map(spell => 
    `<label class="troop-option">
      <input type="checkbox" value="${spell}" class="spell-checkbox">
      <span>${spell}</span>
    </label>`
  ).join('');
  
  // Heroes
  const heroCount = th >= 17 ? 5 : th >= 13 ? 4 : th >= 11 ? 3 : th >= 9 ? 2 : th >= 7 ? 1 : 0;
  if (heroCount > 0) {
    heroesContainer.innerHTML = HEROES.slice(0, heroCount).map(hero => 
      `<label class="troop-option">
        <input type="checkbox" value="${hero}" class="hero-checkbox">
        <span>${hero}</span>
      </label>`
    ).join('');
  } else {
    heroesContainer.innerHTML = '<p style="color: #999;">Unlocks at TH7</p>';
  }
  
  // Pets (TH14+)
  if (th >= 14) {
    document.getElementById('petSection').classList.remove('hidden');
    petsContainer.innerHTML = HERO_PETS.slice(0, Math.min(th - 12, HERO_PETS.length)).map(pet => 
      `<label class="troop-option">
        <input type="checkbox" value="${pet}" class="pet-checkbox">
        <span>${pet}</span>
      </label>`
    ).join('');
  } else {
    document.getElementById('petSection').classList.add('hidden');
  }
  
  // Add selection handlers
  document.querySelectorAll('.troop-option').forEach(option => {
    const input = option.querySelector('input');
    if (input) {
      input.addEventListener('change', function() {
        option.classList.toggle('selected', this.checked);
      });
    }
  });
};

// Analyze attack
window.analyzeAttack = async function() {
  const th = document.getElementById('townHall').value;
  const troops = [...document.querySelectorAll('.troop-checkbox:checked')].map(el => el.value);
  const spells = [...document.querySelectorAll('.spell-checkbox:checked')].map(el => el.value);
  const heroes = [...document.querySelectorAll('.hero-checkbox:checked')].map(el => el.value);
  const pets = [...document.querySelectorAll('.pet-checkbox:checked')].map(el => el.value);
  
  if (troops.length === 0) {
    alert('Please select at least one troop!');
    return;
  }
  
  const resultsDiv = document.getElementById('analysisResults');
  resultsDiv.classList.remove('hidden');
  resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing your army composition...</p></div>';
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const score = Math.min(100, 50 + troops.length * 5 + spells.length * 3 + heroes.length * 8);
  const stars = (score / 100 * 3).toFixed(2);
  const confidence = stars > 2.5 ? 'High' : stars > 1.8 ? 'Medium' : 'Low';
  
  const thData = TOWN_HALL_DATA[th];
  
  resultsDiv.innerHTML = `
    <div class="result-section">
      <h4>📊 Attack Analysis</h4>
      <div class="stars">
        ${getStarHTML(parseFloat(stars))}
      </div>
      <p style="text-align: center;">
        Expected Stars: <strong>${stars}</strong>
        <span class="confidence ${confidence.toLowerCase()}">${confidence} Confidence</span>
      </p>
    </div>
    
    <div class="result-section">
      <h4>🎯 Your Army Composition</h4>
      <p><strong>Troops:</strong> ${troops.join(', ') || 'None'}</p>
      <p><strong>Spells:</strong> ${spells.join(', ') || 'None'}</p>
      <p><strong>Heroes:</strong> ${heroes.join(', ') || 'None'}</p>
      ${pets.length > 0 ? `<p><strong>Pets:</strong> ${pets.join(', ')}</p>` : ''}
    </div>
    
    <div class="result-section">
      <h4>💡 Recommended Strategies for TH${th}</h4>
      <p><strong>Meta Attacks:</strong> ${thData.bestAttacks.join(', ')}</p>
      <p><strong>Upgrade Priority:</strong> ${thData.upgradePriority.join(' → ')}</p>
      ${thData.defenseWeaknesses ? `<p><strong>Common Weaknesses:</strong> ${thData.defenseWeaknesses.join(', ')}</p>` : ''}
    </div>
    
    ${getSynergyHTML(troops, spells)}
  `;
};

function getStarHTML(stars) {
  const fullStars = Math.floor(stars);
  const hasHalf = (stars % 1) >= 0.5;
  let html = '';
  for (let i = 0; i < fullStars; i++) html += '<span class="star">★</span>';
  if (hasHalf) html += '<span class="star">⯨</span>';
  for (let i = fullStars + (hasHalf ? 1 : 0); i < 3; i++) html += '<span style="color: #ddd;">☆</span>';
  return html;
}

function getSynergyHTML(troops, spells) {
  const strongPoints = [];
  const weakPoints = [];
  
  troops.forEach(troop => {
    const troopData = TROOP_SYNERGY[troop];
    if (troopData) {
      troopData.strongAgainst.forEach(s => {
        if (!strongPoints.includes(s)) strongPoints.push(s);
      });
      troopData.weakAgainst.forEach(w => {
        if (!weakPoints.includes(w)) weakPoints.push(w);
      });
    }
  });
  
  let html = '';
  if (strongPoints.length > 0) {
    html += `<div class="synergy-info">
      <strong>✅ Strong Against:</strong> ${strongPoints.join(', ')}
    </div>`;
  }
  
  if (weakPoints.length > 0) {
    html += `<div class="synergy-info warning">
      <strong>⚠️ Weak Against:</strong> ${weakPoints.join(', ')}
    </div>`;
  }
  
  return html ? `<div class="result-section"><h4>⚡ Army Synergy</h4>${html}</div>` : '';
}

// Save strategy
window.saveStrategy = async function() {
  if (!currentUser) {
    alert('Please log in to save strategies');
    return;
  }
  
  const th = document.getElementById('townHall').value;
  const troops = [...document.querySelectorAll('.troop-checkbox:checked')].map(el => el.value);
  const spells = [...document.querySelectorAll('.spell-checkbox:checked')].map(el => el.value);
  const heroes = [...document.querySelectorAll('.hero-checkbox:checked')].map(el => el.value);
  const pets = [...document.querySelectorAll('.pet-checkbox:checked')].map(el => el.value);
  const notes = document.getElementById('userNotes').value;
  
  if (troops.length === 0) {
    alert('Please select at least one troop before saving!');
    return;
  }
  
  const strategyName = prompt('Name this strategy:', `TH${th} Strategy`);
  if (!strategyName) return;
  
  const strategy = {
    id: Date.now(),
    name: strategyName,
    th,
    troops,
    spells,
    heroes,
    pets,
    notes,
    date: new Date().toLocaleDateString()
  };
  
  try {
    const strategyKey = `strategy:${currentUser}:${strategy.id}`;
    await storage.set(strategyKey, JSON.stringify(strategy));
    alert('Strategy saved successfully!');
    loadSavedStrategies();
  } catch (error) {
    alert('Error saving strategy: ' + error.message);
  }
};

// Load saved strategies
async function loadSavedStrategies() {
  if (!currentUser) return;
  
  try {
    const keys = await storage.list(`strategy:${currentUser}:`);
    const strategies = [];
    
    if (keys && keys.keys) {
      for (const key of keys.keys) {
        try {
          const data = await storage.get(key);
          if (data) strategies.push(JSON.parse(data.value));
        } catch (e) {
          console.log('Error loading strategy:', e);
        }
      }
    }
    
    const container = document.getElementById('strategiesList');
    if (strategies.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No saved strategies yet. Create one in the Army Builder!</p>';
    } else {
      strategies.sort((a, b) => b.id - a.id);
      container.innerHTML = strategies.map(s => `
        <div class="strategy-card" onclick="loadStrategy(${s.id})">
          <h4>${s.name}</h4>
          <p><strong>TH${s.th}</strong> • ${s.date}</p>
          <p style="color: #666;">${s.troops.length} troops, ${s.spells.length} spells${s.heroes.length > 0 ? ', ' + s.heroes.length + ' heroes' : ''}</p>
          ${s.notes ? `<p style="font-size: 0.9em; color: #999; margin-top: 8px;">${s.notes.substring(0, 80)}${s.notes.length > 80 ? '...' : ''}</p>` : ''}
        </div>
      `).join('');
    }
  } catch (error) {
    document.getElementById('strategiesList').innerHTML = '<p style="color: red;">Error loading strategies</p>';
  }
}

window.loadStrategy = async function(id) {
  try {
    const data = await storage.get(`strategy:${currentUser}:${id}`);
    if (!data) return;
    
    const strategy = JSON.parse(data.value);
    
    // Switch to army builder tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.tab:first-child').classList.add('active');
    document.getElementById('army-builder').classList.add('active');
    
    // Load strategy
    document.getElementById('townHall').value = strategy.th;
    updateTroopsForTH();
    
    setTimeout(() => {
      strategy.troops.forEach(troop => {
        const checkbox = [...document.querySelectorAll('.troop-checkbox')].find(cb => cb.value === troop);
        if (checkbox) {
          checkbox.checked = true;
          checkbox.closest('.troop-option').classList.add('selected');
        }
      });
      
      strategy.spells.forEach(spell => {
        const checkbox = [...document.querySelectorAll('.spell-checkbox')].find(cb => cb.value === spell);
        if (checkbox) {
          checkbox.checked = true;
          checkbox.closest('.troop-option').classList.add('selected');
        }
      });
      
      strategy.heroes.forEach(hero => {
        const checkbox = [...document.querySelectorAll('.hero-checkbox')].find(cb => cb.value === hero);
        if (checkbox) {
          checkbox.checked = true;
          checkbox.closest('.troop-option').classList.add('selected');
        }
      });
      
      if (strategy.pets) {
        strategy.pets.forEach(pet => {
          const checkbox = [...document.querySelectorAll('.pet-checkbox')].find(cb => cb.value === pet);
          if (checkbox) {
            checkbox.checked = true;
            checkbox.closest('.troop-option').classList.add('selected');
          }
        });
      }
      
      document.getElementById('userNotes').value = strategy.notes || '';
    }, 100);
  } catch (error) {
    alert('Error loading strategy: ' + error.message);
  }
};

// AI Chat functions
window.sendMessage = async function() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  
  addMessage('user', message);
  input.value = '';
  
  const loadingId = addMessage('assistant', '<div class="loading"><div class="spinner"></div></div>');
  
  try {
    chatHistory.push({ role: 'user', content: message });
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY_HERE', // You'll need to add your API key
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are an expert Clash of Clans strategist. Help users with attack strategies, army compositions, base layouts, and gameplay tips. Be concise, practical, and friendly. Provide specific advice based on Town Hall levels when relevant.',
        messages: chatHistory
      })
    });
    
    const data = await response.json();
    const aiResponse = data.content[0].text;
    
    chatHistory.push({ role: 'assistant', content: aiResponse });
    
    // Save chat history
    if (currentUser) {
      await storage.set(`chat:${currentUser}`, JSON.stringify(chatHistory));
    }
    
    // Replace loading with response
    document.getElementById(loadingId).innerHTML = aiResponse;
  } catch (error) {
    document.getElementById(loadingId).innerHTML = 'Sorry, AI chat is not configured. The API key needs to be set up. You can still use all other features!';
    console.error('Chat error:', error);
  }
};

window.handleChatEnter = function(e) {
  if (e.key === 'Enter') sendMessage();
};

function addMessage(role, content) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  const id = 'msg-' + Date.now();
  div.id = id;
  div.className = `message ${role}`;
  div.innerHTML = content;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return id;
}

function renderChatHistory() {
  const messages = document.getElementById('chatMessages');
  messages.innerHTML = '<div class="message assistant">Welcome back! Continue our conversation...</div>';
  chatHistory.forEach(msg => {
    if (msg.role !== 'system') {
      addMessage(msg.role === 'user' ? 'user' : 'assistant', msg.content);
    }
  });
}

// Meta guide
function loadMetaGuide() {
  const metaData = [
    { th: 18, attacks: ['Fireball Meteor Golem', 'Hydra', 'RC Walk Dragons'], priority: 'Meteor Golems, Heroes, Army Camps' },
    { th: 17, attacks: ['Root Rider Smash', 'Queen Charge Hydra'], priority: 'Minion Prince, Root Riders, Heroes' },
    { th: 16, attacks: ['Warden Charge Rocket Balloons', 'Mass E-Drags'], priority: 'Monolith, Heroes, Eagle Artillery' },
    { th: 15, attacks: ['RC Charge Mass Dragons', 'Super Yeti Smash', 'Hybrid'], priority: 'Royal Champion, Heroes, Pets' },
    { th: 14, attacks: ['Hybrid', 'Super Witch Smash'], priority: 'Pet House, Heroes, Army Camps' },
    { th: 13, attacks: ['Hybrid', 'Yeti Smash', 'Queen Charge'], priority: 'Royal Champion, Scattershot, Heroes' },
    { th: 12, attacks: ['Yeti Smash', 'Hybrid'], priority: 'Siege Workshop, Heroes, E-Drags' },
    { th: 11, attacks: ['Hybrid', 'E-Drags', 'Queen Charge Lalo'], priority: 'Eagle Artillery, Grand Warden, Heroes' },
    { th: 10, attacks: ['Queen Walk Hybrid', 'Bowler Witch'], priority: 'Inferno Towers, Heroes, Army Camps' },
    { th: 9, attacks: ['GoHo', 'LavaLoon'], priority: 'Heroes, Army Camps, Spell Factory' }
  ];
  
  const guide = document.getElementById('metaGuide');
  guide.innerHTML = metaData.map(th => `
    <div class="result-section">
      <h4>🏰 Town Hall ${th.th}</h4>
      <p><strong>Best Attacks:</strong> ${th.attacks.join(', ')}</p>
      <p><strong>Upgrade Priority:</strong> ${th.priority}</p>
    </div>
  `).join('');
}

// Tab switching
window.switchTab = function(tabName) {
  const clickedTab = event.target;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  clickedTab.classList.add('active');
  document.getElementById(tabName).classList.add('active');
  
  if (tabName === 'saved-strategies') {
    loadSavedStrategies();
  }
};

function setAuthMode(mode) {
  authMode = mode;
  const signInBtn = document.getElementById('authModeSignIn');
  const signUpBtn = document.getElementById('authModeSignUp');
  const wrap = document.getElementById('confirmPasswordWrap');
  const hint = document.getElementById('authHint');
  const submit = document.getElementById('authSubmitBtn');
  const pass = document.getElementById('password');
  if (mode === 'signup') {
    signInBtn?.classList.remove('active');
    signUpBtn?.classList.add('active');
    signInBtn?.setAttribute('aria-selected', 'false');
    signUpBtn?.setAttribute('aria-selected', 'true');
    wrap?.classList.remove('hidden');
    if (hint) hint.textContent = `Choose a password of at least ${MIN_PASSWORD_LEN} characters.`;
    if (submit) submit.textContent = 'Create account';
    pass?.setAttribute('autocomplete', 'new-password');
  } else {
    signUpBtn?.classList.remove('active');
    signInBtn?.classList.add('active');
    signUpBtn?.setAttribute('aria-selected', 'false');
    signInBtn?.setAttribute('aria-selected', 'true');
    wrap?.classList.add('hidden');
    if (hint) hint.textContent = 'Use your existing username and password.';
    if (submit) submit.textContent = 'Sign in';
    pass?.setAttribute('autocomplete', 'current-password');
  }
  document.getElementById('authMessage').innerHTML = '';
}

async function tryRestoreSession() {
  let raw;
  try {
    raw = localStorage.getItem(SESSION_KEY);
  } catch (e) {
    return;
  }
  if (!raw) return;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    clearSession();
    return;
  }
  const username = typeof parsed.username === 'string' ? normalizeUsername(parsed.username) : '';
  if (!username || validateUsernameSignIn(username)) {
    clearSession();
    return;
  }
  const userKey = `user:${username}`;
  const userData = await storage.get(userKey);
  if (!userData) {
    clearSession();
    return;
  }
  try {
    const u = JSON.parse(userData.value);
    currentUser = typeof u.username === 'string' ? u.username : username;
  } catch {
    currentUser = username;
  }
  showApp();
  loadUserData();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('authForm')?.addEventListener('submit', (e) => handleAuth(e));
  document.getElementById('authModeSignIn')?.addEventListener('click', () => setAuthMode('signin'));
  document.getElementById('authModeSignUp')?.addEventListener('click', () => setAuthMode('signup'));

  const toggleBtn = document.getElementById('togglePassword');
  const passInput = document.getElementById('password');
  toggleBtn?.addEventListener('click', () => {
    if (!passInput) return;
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    toggleBtn.textContent = show ? 'Hide' : 'Show';
    toggleBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  ['username', 'password', 'confirmPassword'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => {
      const msg = document.getElementById('authMessage');
      if (msg && !msg.innerHTML.includes('success-message')) msg.innerHTML = '';
    });
  });

  tryRestoreSession();
});