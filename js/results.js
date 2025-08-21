// results.js

const MAX_POKEMON_ID = 1025; // adjust if needed

function capitalize(str) {
  return str ? String(str).charAt(0).toUpperCase() + String(str).slice(1) : '';
}

async function fetchPokemonData(query) {
  try {
    const q = String(query).trim().toLowerCase(); // ✅ handle numbers or names
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
    if (!response.ok) throw new Error('Pokémon not found');
    return await response.json();
  } catch {
    throw new Error('Pokémon not found');
  }
}

async function fetchEvolutionChain(pokemonId) {
  try {
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
    if (!speciesResponse.ok) throw new Error('Species not found');
    const speciesData = await speciesResponse.json();

    const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
    if (!evolutionChainResponse.ok) throw new Error('Evolution chain not found');
    const evolutionChainData = await evolutionChainResponse.json();

    const evolutionNames = [];
    let currentEvolution = evolutionChainData.chain;

    while (currentEvolution) {
      evolutionNames.push(currentEvolution.species.name);
      currentEvolution = currentEvolution.evolves_to.length > 0 ? currentEvolution.evolves_to[0] : null;
    }
    return evolutionNames;
  } catch (error) {
    console.error("Error fetching evolution chain:", error);
    return [];
  }
}

async function renderEvolutionChain(evolutionNames) {
  if (!evolutionNames || evolutionNames.length <= 1) {
    return '<p class="no-evolution">No evolution chain available</p>';
  }

  try {
    const evoCards = await Promise.all(evolutionNames.map(async (name) => {
      try {
        const evoData = await fetchPokemonData(name);
        const evoImg = evoData.sprites.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoData.id}.png`;
        return `
          <div class="evo-stage">
            <img class="pokemon-img" src="${evoImg}" alt="${capitalize(name)}" />
            <div>${capitalize(name)}</div>
          </div>
        `;
      } catch {
        return `<div class="evo-stage">${capitalize(name)}</div>`;
      }
    }));

    return `
      <div class="evolution-chain">
        <h3>Evolution Chain</h3>
        <div class="evolution-stages">
          ${evoCards.join('<span class="arrow">→</span>')}
        </div>
      </div>
    `;
  } catch {
    return '<p class="no-evolution">Evolution chain unavailable</p>';
  }
}

async function loadPokemonData() {
  const pokemonDataStr = localStorage.getItem('pokemonData');

  if (!pokemonDataStr) {
    document.getElementById('pokemonResult').innerHTML = `
      <div style="text-align: center; color: #333; padding: 50px;">
        <h2>No Pokémon data found</h2>
        <p>Please search for a Pokémon from the home page.</p>
        <a href="index.html" style="color: #4CAF50;">Go back to home</a>
      </div>
    `;
    return;
  }

  const data = JSON.parse(pokemonDataStr);
  const evolutionNames = await fetchEvolutionChain(data.id);

  const name = capitalize(data.name);
  const typesHTML = data.types.map(t =>
    `<span class="type ${t.type.name}">${capitalize(t.type.name)}</span>`
  ).join(' ');

  const imageUrl = data.sprites.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;

  const evolutionHTML = await renderEvolutionChain(evolutionNames);

  document.getElementById('pokemonResult').innerHTML = `
    <div class="pokemon-card">
      <div class="pokemon-card-inner">
        <img class="pokemon-img" src="${imageUrl}" alt="${name}" />
        <h2 class="pokemon-name">${name}</h2>
        <div class="pokemon-types">${typesHTML}</div>
        <p class="pokemon-id">#${data.id}</p>

        <div class="pokemon-stats">
          <h3>Base Stats</h3>
          ${data.stats.map(stat => `
            <div class="stat-row">
              <span class="stat-name">${capitalize(stat.stat.name.replace('-', ' '))}</span>
              <span class="stat-value">${stat.base_stat}</span>
            </div>
          `).join('')}
        </div>

        <div class="pokemon-details">
          <h3>Details</h3>
          <div>
            <p><strong>Height:</strong> ${data.height / 10} m</p>
            <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
            <p><strong>Base Experience:</strong> ${data.base_experience}</p>
          </div>
        </div>

        ${evolutionHTML}
      </div>
    </div>
  `

  // Add navigation buttons above card
  const navButtonsHtml = `
    <div class="nav-buttons">
      <button type="button" id="prevPokemon" class="nav-button">Previous</button>
      <button type="button" id="nextPokemon" class="nav-button">Next</button>
    </div>
  `;
  document.getElementById("pokemonResult").insertAdjacentHTML("beforebegin", navButtonsHtml);

  const prevButton = document.getElementById('prevPokemon');
  const nextButton = document.getElementById('nextPokemon');

  prevButton.addEventListener('click', () => navigatePokemon(data.id - 1));
  nextButton.addEventListener('click', () => navigatePokemon(data.id + 1));

  // Disable ends
  if (data.id <= 1) prevButton.disabled = true;
  if (data.id >= MAX_POKEMON_ID) nextButton.disabled = true;
}

async function navigatePokemon(id) {
  if (id < 1 || id > MAX_POKEMON_ID) return; // guard
  try {
    const pokemonData = await fetchPokemonData(id);  // ✅ id can be number now
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    window.location.href = "results.html"; // safer reload
  } catch (error) {
    alert('Could not load Pokémon. Please try a different ID.');
    console.error("Navigation error:", error);
  }
}

document.addEventListener('DOMContentLoaded', loadPokemonData);

// Header search
const headerSearchInput = document.querySelector('.search-input');
const headerSearchBtn = document.querySelector('.search-btn');

async function handleSearch(query) {
  if (!query) return;
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(query).trim().toLowerCase()}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const pokemonData = await response.json();
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    window.location.href = 'results.html';
  } catch {
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
