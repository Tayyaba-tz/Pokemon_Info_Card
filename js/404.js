// 404.js

/**
 * Handle search functionality from header
 */
async function handleHeaderSearch(query) {
  if (!query) return;
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const pokemonData = await response.json();
    
    // Store data and redirect to results page
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    window.location.href = 'results.html';
  } catch (error) {
    // Stay on 404 page and show error
    alert('Pokémon not found! Please try a different name or ID.');
  }
}

/**
 * Handle search functionality from error page search
 */
async function handleErrorSearch(query) {
  if (!query) return;
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    if (!response.ok) throw new Error('Pokémon not found');
    const pokemonData = await response.json();
    
    // Store data and redirect to results page
    localStorage.setItem('pokemonData', JSON.stringify(pokemonData));
    window.location.href = 'results.html';
  } catch (error) {
    // Stay on 404 page and show error
    alert('Pokémon not found! Please try a different name or ID.');
  }
}

/**
 * Handle popular Pokemon card clicks
 */
function handlePopularPokemonClick(pokemonName) {
  // Map display names to API names
  const pokemonMap = {
    'balbasaur': 'bulbasaur',
    'pichu': 'pichu',
    'mightyena': 'mightyena',
    'piplup': 'piplup',
    'snivy': 'snivy',
    'vivillon': 'vivillon',
    'rowlet': 'rowlet',
    'orbeetle': 'orbeetle',
    'walking wake': 'walking-wake'
  };
  
  const apiName = pokemonMap[pokemonName.toLowerCase()] || pokemonName.toLowerCase();
  handleErrorSearch(apiName);
}

// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Header search functionality
  const headerSearchInput = document.querySelector('.header .search-input');
  const headerSearchBtn = document.querySelector('.header .search-btn');
  
  if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', () => {
      const query = headerSearchInput.value.trim();
      handleHeaderSearch(query);
    });
  }
  
  if (headerSearchInput) {
    headerSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = headerSearchInput.value.trim();
        handleHeaderSearch(query);
      }
    });
  }
  
  // Error section search functionality
  const errorSearchInput = document.querySelector('.search-section .search-input');
  const errorSearchBtn = document.querySelector('.search-section .search-btn');
  
  if (errorSearchBtn) {
    errorSearchBtn.addEventListener('click', () => {
      const query = errorSearchInput.value.trim();
      handleErrorSearch(query);
    });
  }
  
  if (errorSearchInput) {
    errorSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = errorSearchInput.value.trim();
        handleErrorSearch(query);
      }
    });
  }
  
  // "Search Again" button functionality
  const searchAgainBtn = document.querySelector('.btn-secondary');
  if (searchAgainBtn) {
    searchAgainBtn.addEventListener('click', () => {
      if (errorSearchInput) {
        errorSearchInput.focus();
      }
    });
  }
  
  // Popular Pokemon card click handlers
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  pokemonCards.forEach(card => {
    card.addEventListener('click', () => {
      const pokemonName = card.querySelector('h3').textContent;
      handlePopularPokemonClick(pokemonName);
    });
  });
});

