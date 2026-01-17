import { ELIXIR_TROOPS, DARK_TROOPS, HEROES, HERO_PETS, ALL_SPELLS, TOWN_HALL_DATA, TROOP_SYNERGY } from './data.js';

let currentUser = null;
let chatHistory = [];

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

// Auth functions
window.handleAuth = async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const msgDiv = document.getElementById('authMessage');
  
  if (!username || !password) {
    msgDiv.innerHTML = '<div class="error-message">Please enter username and password</div>';
    return;
  }
  
  try {
    const userKey = `user:${username}`;
    const userData = await storage.get(userKey);
    
    if (userData) {
      // Login
      const user = JSON.parse(userData.value);
      if (user.password === password) {
        currentUser = username;
        showApp();
        loadUserData();
      } else {
        msgDiv.innerHTML = '<div class="error-message">Invalid password</div>';
      }
    } else {
      // Sign up
      await storage.set(userKey, JSON.stringify({ username, password, strategies: [] }));
      currentUser = username;
      msgDiv.innerHTML = '<div class="success-message">Account created! Logging in...</div>';
      setTimeout(() => {
        showApp();
        loadUserData();
      }, 1000);
    }
  } catch (error) {
    msgDiv.innerHTML = '<div class="error-message">Error: ' + error.message + '</div>';
  }
};

function showApp() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('appContent').classList.remove('hidden');
  document.getElementById('userInfo').innerHTML = `👤 ${currentUser} | <a href="#" onclick="logout()" style="color: white; text-decoration: none;">Logout</a>`;
  updateTroopsForTH();
  loadSavedStrategies();
  loadMetaGuide();
}

window.logout = function() {
  currentUser = null;
  chatHistory = [];
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('appContent').classList.add('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
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

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  // Nothing needed here yet, everything initializes when user logs in
});