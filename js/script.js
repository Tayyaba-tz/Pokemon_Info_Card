// script.js

// Select existing DOM elements based on your current HTML structure
const form = document.querySelector('form');  // Your search form element
const input = document.querySelector('#pokemonIdInput');  // The search input box
const card = document.querySelector('#pokemonCard');  // The container for the Pokémon info card

/**
 * Helper to capitalize the first letter of a string
 */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/**
 * Show a loading message inside the card container
 */
function showLoading() {
  card.innerHTML = `<p style="color: white; font-size: 1.2rem;">Loading...</p>`;
}

/**
 * Show an error message inside the card container
 */
function showError(message) {
  card.innerHTML = `<p style="color: #ff6b6b; font-size: 1.2rem; font-weight: 600;">${message}</p>`;
}

/**
 * Fetch Pokémon main data from PokéAPI by name or ID
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
 * Fetch species data to get evolution chain URL
 */
async function fetchSpeciesData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load species data');
  return await response.json();
}

/**
 * Fetch evolution chain data
 */
async function fetchEvolutionChain(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load evolution chain');
  return await response.json();
}

/**
 * Parse evolution chain recursively and collect species names in order
 */
function parseEvolutionChain(chain) {
  const evolutions = [];
  function traverse(node) {
    evolutions.push(node.species.name);
    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach(traverse);
    }
  }
  traverse(chain);
  return evolutions;
}

/**
 * Build and display the Pokémon info card dynamically in your existing container
 */
function renderPokemonCard(data) {
  const name = capitalize(data.name);
  const typesHTML = data.types
    .map(t => `<span class="type ${t.type.name}">${capitalize(t.type.name)}</span>`)
    .join(' ');
  
  // Use front_default sprite or official artwork fallback
  const imageUrl = data.sprites.front_default || 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
  
  card.innerHTML = `
    <div class="pokemon-card-inner">
      <img class="pokemon-img" src="${imageUrl}" alt="${name}" />
      <h3 class="pokemon-name">${name}</h3>
      <div class="pokemon-types">${typesHTML}</div>
      <p class="pokemon-id">#${data.id}</p>
      <div id="evolutionChain"></div>
    </div>
  `;
}

/**
 * Render the evolution chain inside your card container, matching your style
 */
async function renderEvolutionChain(speciesUrl) {
  try {
    const speciesData = await fetchSpeciesData(speciesUrl);
    const evoChainData = await fetchEvolutionChain(speciesData.evolution_chain.url);
    const evolutionNames = parseEvolutionChain(evoChainData.chain);
    
    const evolutionContainer = document.getElementById('evolutionChain');
    if (!evolutionContainer) return;

    // Fetch data for each Pokémon in evolution chain to get sprites
    const evoCards = await Promise.all(evolutionNames.map(async (name) => {
      try {
        const evoData = await fetchPokemonData(name);
        const evoImg = evoData.sprites.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoData.id}.png`;
        return `
          <div class="evo-stage" style="text-align:center; margin: 0 10px;">
            <img class="pokemon-img" src="${evoImg}" alt="${capitalize(name)}" style="width: 60px;" />
            <div style="color: white; font-weight: 600;">${capitalize(name)}</div>
          </div>
        `;
      } catch {
        return `<div class="evo-stage" style="color: white; margin: 0 10px;">${capitalize(name)}</div>`;
      }
    }));

    // Join the evolution chain stages with right arrow
    evolutionContainer.innerHTML = evoCards.join('<span style="color: white; font-size: 2rem;">→</span>');

  } catch {
    const evoContainer = document.getElementById('evolutionChain');
    if (evoContainer) evoContainer.innerHTML = '';
  }
}

/**
 * Main form submission handler
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();

  if (!query) {
    showError("Please enter a Pokémon name or ID.");
    return;
  }

  showLoading();

  try {
    const pokemonData = await fetchPokemonData(query);
    renderPokemonCard(pokemonData);
    await renderEvolutionChain(pokemonData.species.url);
    input.value = '';
  } catch (error) {
    showError(error.message);
  }
});
