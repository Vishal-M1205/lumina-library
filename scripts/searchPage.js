function search() {
  // 1. Fetch from iTunes API (Generous rate limits, no key needed)
  const query = $('.search-bar').val().trim();
  if (!query) return;

  $('#results-container').html('<p class="text-center">Searching Books...</p>');

  fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=ebook&limit=8`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      $('#results-container').empty();

      // iTunes returns the array inside 'results'
      const books = data.results;

      if (!books || books.length === 0) {
        $('#results-container').html('<p class="text-center">No books found.</p>');
        return;
      }

      books.forEach((book) => {
        // Extract details safely from iTunes object
        const title = book.trackName || 'Unknown Title';
        const author = book.artistName || 'Unknown Author';

        // iTunes provides artworkUrl100, we can replace '100x100' to get a higher quality image
        let coverUrl = book.artworkUrl100
          ? book.artworkUrl100.replace('100x100', '300x300')
          : 'https://via.placeholder.com/150x200?text=No+Cover';

        const publishYear = book.releaseDate ? book.releaseDate.substring(0, 4) : 'Unknown';

        // Build the Bootstrap Card
        const cardHtml = `
                            <div class="col-md-3 col-sm-6 col-12 mb-4">
                                <div class="card h-100 shadow-sm">
                                    <img src="${coverUrl}" class="card-img-top" alt="${title}" style="height: 250px; object-fit: cover;">
                                    <div class="card-body d-flex flex-column">
                                        <h6 class="card-title">${title}</h6>
                                        <p class="card-text text-muted small mb-3">${author} <br> Published: ${publishYear}</p>
                                        
                                        <button class="btn btn-outline-primary mt-auto save-btn" 
                                            data-title="${title}" 
                                            data-author="${author}" 
                                            data-cover="${coverUrl}">
                                            Save to Library
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;

        $('#results-container').append(cardHtml);
      });
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      $('#results-container').html(
        '<p class="text-danger text-center">Failed to load results.</p>'
      );
    });
}

$('.search-suggest').on('click', 'a', function (e) {
  e.preventDefault();
  $('.search-bar').val($(this).text());
  search();
});

$('.search-bar').on('input', function () {});
