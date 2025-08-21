// generation.js

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

const generationData = {
  1: { name: 'Kanto', region: 'Kanto', startId: 1, endId: 151 },
  2: { name: 'Johto', region: 'Johto', startId: 152, endId: 251 },
  3: { name: 'Hoenn', region: 'Hoenn', startId: 252, endId: 386 },
  4: { name: 'Sinnoh', region: 'Sinnoh', startId: 387, endId: 493 },
  5: { name: 'Unova', region: 'Unova', startId: 494, endId: 649 },
  6: { name: 'Kalos', region: 'Kalos', startId: 650, endId: 721 },
  7: { name: 'Alola', region: 'Alola', startId: 722, endId: 809 },
  8: { name: 'Galar', region: 'Galar', startId: 810, endId: 905 },
  9: { name: 'Paldea', region: 'Paldea', startId: 906, endId: 1025 }
};

async function fetchPokemonById(id) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error('Pokemon not found');
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Pokemon ${id}:`, error);
    return null;
  }
}

function createPokemonCard(pokemon) {
  if (!pokemon) return '';
  
  const name = capitalize(pokemon.name);
  const typesHTML = pokemon.types
    .map(t => `<span class="type ${t.type.name}">${capitalize(t.type.name)}</span>`)
    .join(' ');
  
  const imageUrl = pokemon.sprites.front_default || 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  
  return `
    <div class="pokemon-card" data-pokemon-name="${pokemon.name.toLowerCase()}">
      <div class="pokemon-card-inner">
        <img src="${imageUrl}" alt="${name}" class="pokemon-img">
        <div class="pokemon-info">
          <h3 class="pokemon-name">${name}</h3>
          <div class="pokemon-types">${typesHTML}</div>
          <p class="pokemon-id">#${pokemon.id}</p>
        </div>
      </div>
    </div>
  `;
}

async function loadGenerationPokemon() {
  const selectedGeneration = localStorage.getItem('selectedGeneration');
  
  if (!selectedGeneration || !generationData[selectedGeneration]) {
    document.getElementById('generationHeader').innerHTML = `
      <h2 style="color: white; text-align: center;">Generation not found</h2>
      <p style="color: white; text-align: center;">Please select a generation from the home page.</p>
    `;
    document.getElementById('loadingMessage').style.display = 'none';
    return;
  }

  const genData = generationData[selectedGeneration];
  
  // Add header
  document.getElementById('generationHeader').innerHTML = `
    <h2 style="color: white; text-align: center; margin-bottom: 10px;">Generation ${selectedGeneration}</h2>
    <h3 style="color: white; text-align: center; margin-bottom: 30px;">${genData.region} Region</h3>
  `;

  // ✅ Insert navigation buttons
  const navButtonsHtml = `
    <div class="nav-buttons">
      <button type="button" id="prevGen" class="nav-button">Previous Generation</button>
      <button type="button" id="nextGen" class="nav-button">Next Generation</button>
    </div>
  `;
  document.getElementById("generationHeader").insertAdjacentHTML("afterend", navButtonsHtml);

  const prevBtn = document.getElementById("prevGen");
  const nextBtn = document.getElementById("nextGen");

  // Disable at ends
  if (parseInt(selectedGeneration) <= 1) prevBtn.disabled = true;
  if (parseInt(selectedGeneration) >= Object.keys(generationData).length) nextBtn.disabled = true;

  prevBtn.addEventListener("click", () => navigateGeneration(parseInt(selectedGeneration) - 1));
  nextBtn.addEventListener("click", () => navigateGeneration(parseInt(selectedGeneration) + 1));

  // Load Pokemon
  const batchSize = 20;
  const totalPokemon = genData.endId - genData.startId + 1;
  const pokemonGrid = document.getElementById('generationPokemon');
  
  for (let i = genData.startId; i <= genData.endId; i += batchSize) {
    const endBatch = Math.min(i + batchSize - 1, genData.endId);
    const promises = [];
    
    for (let j = i; j <= endBatch; j++) {
      promises.push(fetchPokemonById(j));
    }
    
    try {
      const pokemonBatch = await Promise.all(promises);
      const cardsHTML = pokemonBatch
        .filter(pokemon => pokemon !== null)
        .map(pokemon => createPokemonCard(pokemon))
        .join('');
      
      pokemonGrid.innerHTML += cardsHTML;
      
      const loadedCount = Math.min(endBatch - genData.startId + 1, totalPokemon);
      document.getElementById('loadingMessage').innerHTML = `
        <p style="color: white; text-align: center; font-size: 1.2rem;">
          Loaded ${loadedCount} of ${totalPokemon} Pokémon...
        </p>
      `;
      
    } catch (error) {
      console.error('Error loading Pokemon batch:', error);
    }
  }
  
  document.getElementById('loadingMessage').style.display = 'none';
  
  // Card click handler
  document.querySelectorAll('.pokemon-card').forEach(card => {
    card.addEventListener('click', () => {
      const pokemonName = card.getAttribute('data-pokemon-name');
      handlePokemonClick(pokemonName);
    });
  });

  // ✅ keep selectedGeneration in localStorage for nav
}

function navigateGeneration(genId) {
  if (!generationData[genId]) return;
  localStorage.setItem("selectedGeneration", genId);
  window.location.href = "generation.html";
}

async function handlePokemonClick(pokemonName) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!response.ok) throw new Error('Pokemon not found');
    const pokemonData = await response.json();
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    window.location.href = 'results.html';
  } catch {
    window.location.href = '404.html';
  }
}

async function handleSearch(query) {
  if (!query) return;
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const pokemonData = await response.json();
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    window.location.href = 'results.html';
  } catch {
    window.location.href = '404.html';
  }
}

document.addEventListener('DOMContentLoaded', loadGenerationPokemon);

const headerSearchInput = document.querySelector('.search-input');
const headerSearchBtn = document.querySelector('.search-btn');

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
