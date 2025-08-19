// script.js

// Select existing DOM elements based on your current HTML structure
const headerSearchInput = document.querySelector('.search-input');
const headerSearchBtn = document.querySelector('.search-btn');
const heroSearchInput = document.querySelector('.hero-search-input');
const heroSearchBtn = document.querySelector('.hero-search-btn');

/**
 * Helper to capitalize the first letter of a string
 */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/**
 * Show a loading message
 */
function showLoading() {
  // Redirect to a results page or show loading in current page
  console.log('Loading...');
}

/**
 * Show an error message and redirect to 404 page
 */
function showError(message) {
  console.error(message);
  // Redirect to 404 page for exceptional errors
  window.location.href = '404.html';
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
 * Build and display the Pokémon info card dynamically and redirect to results page
 */
function renderPokemonCard(data) {
  // Store pokemon data in localStorage to pass to results page
  localStorage.setItem('pokemonData', JSON.stringify(data));
  // Redirect to results page
  window.location.href = 'results.html';
}

/**
 * Handle search functionality
 */
async function handleSearch(query) {
  if (!query) {
    showError("Please enter a Pokémon name or ID.");
    return;
  }

  showLoading();

  try {
    const pokemonData = await fetchPokemonData(query);
    // Store evolution chain data as well
    const speciesData = await fetchSpeciesData(pokemonData.species.url);
    const evoChainData = await fetchEvolutionChain(speciesData.evolution_chain.url);
    const evolutionNames = parseEvolutionChain(evoChainData.chain);
    
    // Store all data for results page
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    localStorage.setItem('evolutionChain', JSON.stringify(evolutionNames));
    
    // Redirect to results page
    window.location.href = 'results.html';
  } catch (error) {
    showError(error.message);
  }
}

// Event listeners for search functionality
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

heroSearchBtn.addEventListener('click', () => {
  const query = heroSearchInput.value.trim();
  handleSearch(query);
});

heroSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = heroSearchInput.value.trim();
    handleSearch(query);
  }
});

// Featured Pokemon click handlers
document.addEventListener('DOMContentLoaded', () => {
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  pokemonCards.forEach(card => {
    card.addEventListener('click', () => {
      const pokemonName = card.querySelector('.pokemon-name').textContent.toLowerCase();
      handleSearch(pokemonName);
    });
  });

  // Generation click handlers
  const genCards = document.querySelectorAll('.gen-card');
  genCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      // Store generation info and redirect to generation page
      localStorage.setItem('selectedGeneration', index + 1);
      window.location.href = 'generation.html';
    });
  });
});
