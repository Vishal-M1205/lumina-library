import { savedBooks } from './discoverBooksPage.js';

// Pagination State
let allSearchResults = [];
let currentPage = 1;
const resultsPerPage = 8; // 8 is perfect for a 4-column grid (2 rows per page)

export function search() {
  const query = $('.search-bar').val().trim();
  if (!query) return;

  $('#results-container').html('<p class="text-center">Searching Books...</p>');
  $('#pagination-controls').addClass('d-none'); // Hide pagination while loading

  // Fetch 40 books at once for instant client-side pagination
  fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=ebook&limit=40`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      // Store all results and reset to page 1
      allSearchResults = data.results || [];
      currentPage = 1;

      if (allSearchResults.length === 0) {
        $('#results-container').html('<p class="text-center">No books found.</p>');
        return;
      }

      // Render the first page
      renderPage(currentPage);
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      $('#results-container').html(
        '<p class="text-danger text-center">Failed to load results.</p>'
      );
    });
}

function renderPage(pageNumber) {
  $('#results-container').empty();

  // Calculate slice indexes
  const startIndex = (pageNumber - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;

  // Grab only the 8 books for this specific page
  const booksToShow = allSearchResults.slice(startIndex, endIndex);

  booksToShow.forEach((book) => {
    const title = book.trackName || 'Unknown Title';
    const author = book.artistName || 'Unknown Author';

    let coverUrl = book.artworkUrl100
      ? book.artworkUrl100.replace('100x100', '300x300')
      : 'https://via.placeholder.com/150x200?text=No+Cover';

    const publishYear = book.releaseDate ? book.releaseDate.substring(0, 4) : 'Unknown';
    const bookId = String(book.trackId);

    const rawDesc = book.description || 'No description available.';
    const safeDesc = encodeURIComponent(rawDesc);

    const totalPages = book.pageCount || 0;

    const isSaved = savedBooks.has(bookId);

    const buttonHtml = isSaved
      ? `<button class="btn btn-saved mt-auto" disabled>
          <i class="bi bi-check-circle-fill me-2"></i>Saved
         </button>`
      : `<button class="btn btn-save mt-auto save-btn"
          data-id="${bookId}"
          data-title="${title}"
          data-author="${author}"
          data-cover="${coverUrl}"
          data-desc="${safeDesc}" 
          data-pages="${totalPages}"
          >
          <i class="bi bi-bookmark-plus me-2"></i>Save to Library
         </button>`;

    const cardHtml = `
      <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
          <div class="book-card h-100">
              <div class="book-cover">
                  <img src="${coverUrl}" alt="${title}">
              </div>
              <div class="book-content">
                  <h5 class="book-title">${title}</h5>
                  <p class="book-author">
                      <i class="bi bi-person-fill"></i> ${author}
                  </p>
                  <p class="book-year">
                      <i class="bi bi-calendar3"></i> ${publishYear}
                  </p>
                  ${buttonHtml}
              </div>
          </div>
      </div>
    `;

    $('#results-container').append(cardHtml);
  });

  updatePaginationUI();
}

function updatePaginationUI() {
  const totalPages = Math.ceil(allSearchResults.length / resultsPerPage);

  if (totalPages <= 1) {
    $('#pagination-controls').addClass('d-none'); // Hide if only 1 page
  } else {
    $('#pagination-controls').removeClass('d-none');
    $('#pageIndicator').text(`Page ${currentPage} of ${totalPages}`);

    // Disable Next/Prev buttons at the ends
    $('#prevBtn').prop('disabled', currentPage === 1);
    $('#nextBtn').prop('disabled', currentPage === totalPages);
  }
}

// Attach Pagination Click Listeners once the DOM is ready
$(document).ready(function () {
  $('#prevBtn').on('click', function () {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
      // Smooth scroll back to the top of the results
      $('html, body').animate({ scrollTop: $('#results-container').offset().top - 30 }, 'fast');
    }
  });

  $('#nextBtn').on('click', function () {
    const totalPages = Math.ceil(allSearchResults.length / resultsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
      // Smooth scroll back to the top of the results
      $('html, body').animate({ scrollTop: $('#results-container').offset().top - 30 }, 'fast');
    }
  });
});
