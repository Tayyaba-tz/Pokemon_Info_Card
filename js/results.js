// results.js

/**
 * Helper to capitalize the first letter of a string
 */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/**
 * Fetch Pokémon data for evolution chain
 */
async function fetchPokemonData(query) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    if (!response.ok) throw new Error('Pokémon not found');
    return await response.json();
  } catch {
    throw new Error('Pokémon not found');
  }
}

/**
 * Render evolution chain
 */
async function renderEvolutionChain(evolutionNames) {
  if (!evolutionNames || evolutionNames.length <= 1) {
    return '<p style="color: white; margin-top: 20px;">No evolution chain available</p>';
  }

  try {
    // Fetch data for each Pokémon in evolution chain to get sprites
    const evoCards = await Promise.all(evolutionNames.map(async (name) => {
      try {
        const evoData = await fetchPokemonData(name);
        const evoImg = evoData.sprites.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoData.id}.png`;
        return `
          <div class="evo-stage" style="text-align:center; margin: 0 10px;">
            <img class="pokemon-img" src="${evoImg}" alt="${capitalize(name)}" style="width: 80px; height: 80px;" />
            <div style="color: white; font-weight: 600; margin-top: 10px;">${capitalize(name)}</div>
          </div>
        `;
      } catch {
        return `<div class="evo-stage" style="color: white; margin: 0 10px; text-align: center;">${capitalize(name)}</div>`;
      }
    }));

    // Join the evolution chain stages with right arrow
    return `
      <div style="margin-top: 30px;">
        <h3 style="color: white; text-align: center; margin-bottom: 20px;">Evolution Chain</h3>
        <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap;">
          ${evoCards.join('<span style="color: white; font-size: 2rem; margin: 0 10px;">→</span>')}
        </div>
      </div>
    `;
  } catch {
    return '<p style="color: white; margin-top: 20px;">Evolution chain unavailable</p>';
  }
}

/**
 * Load and display Pokemon data from localStorage
 */
async function loadPokemonData() {
  const pokemonDataStr = localStorage.getItem('pokemonData');
  const evolutionChainStr = localStorage.getItem('evolutionChain');
  
  if (!pokemonDataStr) {
    document.getElementById('pokemonResult').innerHTML = `
      <div style="text-align: center; color: white; padding: 50px;">
        <h2>No Pokémon data found</h2>
        <p>Please search for a Pokémon from the home page.</p>
        <a href="index.html" style="color: #4CAF50;">Go back to home</a>
      </div>
    `;
    return;
  }

  const data = JSON.parse(pokemonDataStr);
  const evolutionNames = evolutionChainStr ? JSON.parse(evolutionChainStr) : [];
  
  const name = capitalize(data.name);
  const typesHTML = data.types
    .map(t => `<span class="type ${t.type.name}">${capitalize(t.type.name)}</span>`)
    .join(' ');
  
  // Use front_default sprite or official artwork fallback
  const imageUrl = data.sprites.front_default || 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
  
  // Get evolution chain HTML
  const evolutionHTML = await renderEvolutionChain(evolutionNames);
  
  document.getElementById('pokemonResult').innerHTML = `
    <div class="pokemon-card" style="max-width: 600px; margin: 0 auto;">
      <div class="pokemon-card-inner" style="padding: 30px; text-align: center;">
        <img class="pokemon-img" src="${imageUrl}" alt="${name}" style="width: 200px; height: 200px; margin-bottom: 20px;" />
        <h2 class="pokemon-name" style="color: white; margin-bottom: 15px; font-size: 2.5rem;">${name}</h2>
        <div class="pokemon-types" style="margin-bottom: 15px;">${typesHTML}</div>
        <p class="pokemon-id" style="color: white; font-size: 1.5rem; margin-bottom: 20px;">#${data.id}</p>
        
        <div class="pokemon-stats" style="margin-top: 30px;">
          <h3 style="color: white; margin-bottom: 15px;">Base Stats</h3>
          <div style="text-align: left; max-width: 400px; margin: 0 auto;">
            ${data.stats.map(stat => `
              <div style="display: flex; justify-content: space-between; color: white; margin-bottom: 8px;">
                <span>${capitalize(stat.stat.name.replace('-', ' '))}</span>
                <span>${stat.base_stat}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="pokemon-details" style="margin-top: 30px;">
          <h3 style="color: white; margin-bottom: 15px;">Details</h3>
          <div style="text-align: left; max-width: 400px; margin: 0 auto; color: white;">
            <p><strong>Height:</strong> ${data.height / 10} m</p>
            <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
            <p><strong>Base Experience:</strong> ${data.base_experience}</p>
          </div>
        </div>
        
        ${evolutionHTML}
      </div>
    </div>
  `;
  
  // Clear localStorage after displaying
  localStorage.removeItem('pokemonData');
  localStorage.removeItem('evolutionChain');
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadPokemonData);

// Add search functionality to header
const headerSearchInput = document.querySelector('.search-input');
const headerSearchBtn = document.querySelector('.search-btn');

async function handleSearch(query) {
  if (!query) return;
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const pokemonData = await response.json();
    
    // Store data and reload page
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    location.reload();
  } catch (error) {
    window.location.href = '404.html';
  }
}

headerSearchBtn.addEventListener('click', () => {
  const query = headerSearchInput.value.trim();
  handleSearch(query);
});

headerSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = headerSearchInput.value.trim();
    handleSearch(query);
  }
});

