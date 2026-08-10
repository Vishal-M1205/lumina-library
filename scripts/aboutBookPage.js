import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from './index.js';

// 1. Get the book ID from the URL (e.g., aboutBookPage.html?id=1425660447)
const urlParams = new URLSearchParams(window.location.search);
const currentBookId = urlParams.get('id');

let currentUser = null;
let itunesBookData = null; // Store iTunes data in case they click "Save"

$(document).ready(function () {
  // Back button - returns to discover page (sessionStorage will automatically restore the search!)
  $('#backBtn').on('click', () => {
    window.history.back();
  });

  $('#logoutBtn').on('click', async function (e) {
    e.preventDefault();
    try {
      const result = await Swal.fire({
        title: 'Leaving So Soon?',
        text: 'Your library will be waiting when you return.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Logout',
        cancelButtonText: 'Stay',
        confirmButtonColor: '#5d737e',
        cancelButtonColor: '#d4a373',
        reverseButtons: true,
      });
      if (result.isConfirmed) {
        await signOut(auth);
        sessionStorage.removeItem('savedSearchQuery');
        sessionStorage.removeItem('savedSearchResults ');
        sessionStorage.removeItem('savedSearchPage');
        window.location.replace('../index.html');
      }
    } catch (error) {
      console.error('Logout Error:', error);
    }
  });

  // Verify ID exists in URL
  if (!currentBookId) {
    $('#dynamic-book-content').html('<p class="text-center text-danger">No book selected.</p>');
    return;
  }

  // Check Auth and Load Data
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await loadBookData();
    } else {
      window.location.replace('../index.html');
    }
  });
});

async function loadBookData() {
  try {
    if (currentBookId.startsWith('manual_')) {
      const q = query(
        collection(db, 'library'),
        where('userId', '==', currentUser.uid),
        where('bookId', '==', currentBookId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        $('#dynamic-book-content').html(
          '<p class="text-center text-danger mt-5">Manual book not found in your library.</p>'
        );
        return;
      }

      const savedData = snapshot.docs[0].data();

      itunesBookData = {
        trackName: savedData.title,
        artistName: savedData.author,
        artworkUrl100: savedData.cover, // We already set the cover URL
        releaseDate: savedData.publishYear ? String(savedData.publishYear) : 'Unknown',
        description: decodeURIComponent(savedData.description), // Decode it for display!
      };

      // Always pass true for isSaved, because manual books are ALWAYS saved
      renderBookDetails(true, savedData);
    } else {
      // 1. Fetch book details directly from iTunes
      const response = await fetch(`https://itunes.apple.com/lookup?id=${currentBookId}`);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        $('#dynamic-book-content').html(
          '<p class="text-center text-danger mt-5">Book not found.</p>'
        );
        return;
      }

      itunesBookData = data.results[0];

      // 2. Check if this book is already saved in Firestore
      const q = query(
        collection(db, 'library'),
        where('userId', '==', currentUser.uid),
        where('bookId', '==', currentBookId)
      );
      const snapshot = await getDocs(q);

      const isSaved = !snapshot.empty;
      let savedData = null;

      if (isSaved) {
        savedData = snapshot.docs[0].data();
      }

      // 3. Render the UI
      renderBookDetails(isSaved, savedData);
    }
  } catch (error) {
    console.error('Error loading book data:', error);
    $('#dynamic-book-content').html(
      '<p class="text-center text-danger mt-5">Failed to load book details.</p>'
    );
  }
}

function renderBookDetails(isSaved, savedData) {
  // Extract standard iTunes data
  const title = itunesBookData.trackName || 'Unknown Title';
  const author = itunesBookData.artistName || 'Unknown Author';
  let coverUrl = 'https://via.placeholder.com/150x200?text=No+Cover';
  if (itunesBookData.artworkUrl100) {
    if (itunesBookData.artworkUrl100.includes('100x100')) {
      coverUrl = itunesBookData.artworkUrl100.replace('100x100', '300x300');
    } else {
      coverUrl = itunesBookData.artworkUrl100; // Manual cover URL
    }
  }
  const publishYear = itunesBookData.releaseDate
    ? itunesBookData.releaseDate.substring(0, 4)
    : 'Unknown';

  // Safely decode the description for display
  const rawDesc = itunesBookData.description || 'No description available.';

  // HTML chunks that change based on save status
  let statusBadgeHtml = '';
  let buttonHtml = '';
  let progressCardHtml = '';

  if (isSaved) {
    // ---- BOOK IS SAVED: Setup Progress and Badges ----
    let statusText = savedData.status;
    let statusIcon = 'bi-bookmark';
    if (statusText === 'want') {
      statusText = 'Want to Read';
      statusIcon = 'bi-bookmark';
    }
    if (statusText === 'reading') {
      statusText = 'Reading';
      statusIcon = 'bi-book-half';
    }
    if (statusText === 'completed') {
      statusText = 'Completed';
      statusIcon = 'bi-check-circle';
    }
    if (statusText === 'dropped') {
      statusText = 'Dropped';
      statusIcon = 'bi-x-circle';
    }

    statusBadgeHtml = `
      <span class="status-badge ${savedData.status}">
        <i class="bi ${statusIcon}"></i> ${statusText}
      </span>`;

    buttonHtml = `
      <button class="btn btn-success mt-3" disabled>
        <i class="bi bi-check-circle-fill me-2"></i>Saved in Library
      </button>`;

    const pagesRead = savedData.pagesRead || 0;
    const totalPages = savedData.totalPages || 0;
    const progressPercent = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;
    const pagesRemaining = totalPages > 0 ? totalPages - pagesRead : '?';

    // Format Dates
    const formatDate = (dateVal) => {
      if (!dateVal) return '--';
      const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    progressCardHtml = `
      <div class="progress-card mt-4">
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="mb-0">Reading Progress</h4>
          <span class="progress-percent">${progressPercent}%</span>
        </div>
        <div class="progress mt-4">
          <div class="progress-bar" style="width: ${progressPercent}%"></div>
        </div>
        <div class="text-center mt-3 pages-read">
          ${pagesRead} of ${totalPages} Pages Completed<br />
          <small>${pagesRemaining} Pages Remaining</small>
        </div>
        <div class="row g-3 mt-3">
          <div class="col-lg-4 col-md-4">
            <div class="info-box">
              <i class="bi bi-calendar-event"></i>
              <small>Started Reading</small>
              <h6>${formatDate(savedData.startedAt)}</h6>
            </div>
          </div>
          <div class="col-lg-4 col-md-4">
            <div class="info-box">
              <i class="bi bi-calendar-check"></i>
              <small>Completed</small>
              <h6>${formatDate(savedData.completedAt)}</h6>
            </div>
          </div>
          <div class="col-lg-4 col-md-4">
            <div class="info-box">
              <i class="bi bi-book"></i>
              <small>Total Pages</small>
              <h6>${totalPages}</h6>
            </div>
          </div>
        </div>
      </div>`;
  } else {
    // ---- BOOK IS NOT SAVED: Show Save Button ----
    buttonHtml = `
      <button class="btn btn-save  mt-3 save-btn" id="saveBookBtn">
        <i class="bi bi-bookmark-plus me-2"></i>Save to Library
      </button>`;
  }

  // Combine everything into the final layout
  const finalHtml = `
    <div class="book-details-card">
      <div class="book-cover">
        <img src="${coverUrl}" alt="${title}" />
      </div>
      <div class="book-info">
        ${statusBadgeHtml}
        <h2>${title}</h2>
        <h6><i class="bi bi-person-fill me-2"></i> ${author}</h6>
        <p class="publish-year">Published • ${publishYear}</p>
        ${buttonHtml}
      </div>
    </div>
    
    <div class="description-card mt-4">
      <h4>About this Book</h4>
      <p class="mt-3">${rawDesc}</p>
    </div>

    ${progressCardHtml}
  `;

  $('#dynamic-book-content').html(finalHtml);
}

// 4. Handle "Save to Library" click on the About Page
$(document).on('click', '#saveBookBtn', async function () {
  const btn = $(this);

  const bookData = {
    bookId: currentBookId,
    title: itunesBookData.trackName || 'Unknown Title',
    author: itunesBookData.artistName || 'Unknown Author',
    cover: itunesBookData.artworkUrl100
      ? itunesBookData.artworkUrl100.replace('100x100', '300x300')
      : 'https://via.placeholder.com/150x200?text=No+Cover',
    description: itunesBookData.description || 'No description available.',
    totalPages: itunesBookData.pageCount || 0,
    pagesRead: 0,
    status: 'want',
    userId: currentUser.uid,
    savedAt: new Date(),
    startedAt: null,
    completedAt: null,
  };

  try {
    btn
      .html('<span class="spinner-border spinner-border-sm me-2"></span>Saving...')
      .prop('disabled', true);

    // Save to database
    await addDoc(collection(db, 'library'), bookData);

    // Reload the page data instantly to show the progress card!
    await loadBookData();
  } catch (error) {
    console.error('Error saving book: ', error);
    alert('Failed to save book.');
    btn.html('<i class="bi bi-bookmark-plus me-2"></i>Save to Library').prop('disabled', false);
  }
});
