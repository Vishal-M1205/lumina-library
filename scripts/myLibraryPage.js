import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  collection,
  getDocs,
  query,
  where,
} from './index.js';

// Store all fetched books here so filtering is instant (no extra database calls)
let allSavedBooks = [];

$(document).ready(function () {
  // Navigation
  $('#discoverBooks').on('click', () => {
    window.location.replace('./discoverBooksPage.html');
  });

  // Logout Logic
  $('#logoutBtn').on('click', async function (e) {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.replace('../index.html');
    } catch (error) {
      console.error('Logout Error:', error);
      alert('An error occurred while logging out.');
    }
  });

  // 1. Check Authentication & Fetch Library
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await fetchLibrary(user.uid);
    } else {
      // Not logged in? Redirect to index.
      window.location.replace('../index.html');
    }
  });

  // 2. Filter Button Logic
  $('.filter-btn').on('click', function () {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    const selectedFilter = $(this).data('filter');
    renderLibrary(selectedFilter);
  });
});

async function fetchLibrary(userId) {
  try {
    const q = query(collection(db, 'library'), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    allSavedBooks = [];
    snapshot.forEach((doc) => {
      // Save the Firestore Document ID along with the data so we can edit it later
      allSavedBooks.push({ id: doc.id, ...doc.data() });
    });

    // Render all books initially
    renderLibrary('all');
  } catch (error) {
    console.error('Error fetching library: ', error);
    $('#library-container').html('<p class="text-danger text-center">Failed to load library.</p>');
  }
}

function renderLibrary(filterType) {
  const container = $('#library-container');
  container.empty();

  // 3. Filter the local array
  const filteredBooks = allSavedBooks.filter((book) => {
    if (filterType === 'all') return true;

    return book.status.toLowerCase() === filterType;
  });

  // Handle empty state
  if (filteredBooks.length === 0) {
    container.html(
      '<div class="col-12"><p class="text-muted text-center mt-5">No books found in this category.</p></div>'
    );
    return;
  }

  // 4. Render the filtered books
  filteredBooks.forEach((book) => {
    // Map status to your UI styles
    let statusClass = '';
    let statusIcon = '';
    let statusText = book.status;
    let totalPages = book.totalPages;
    let pagesRead = book.pagesRead;

    if (book.status === 'want') {
      statusClass = 'want'; // Assuming you have CSS for .status.want
      statusIcon = 'bi-bookmark';
      statusText = 'Want to Read';
    } else if (book.status === 'reading') {
      statusClass = 'reading';
      statusIcon = 'bi-book-half';
      statusText = 'Reading';
    } else if (book.status === 'completed') {
      statusClass = 'completed';
      statusIcon = 'bi-check-circle';
      statusText = 'Completed';
    } else if (book.status === 'dropped') {
      statusClass = 'dropped';
      statusIcon = 'bi-x-circle';
      statusText = 'Dropped';
    }

    // Format the saved Date
    let dateStarted = '--';
    if (book.startedAt && book.startedAt.toDate) {
      // Handle Firestore Timestamp object
      dateStarted = book.startedAt
        .toDate()
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } else if (book.startedAt) {
      // Handle standard JS Date object
      dateStarted = new Date(book.startedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    let dateCompleted = '--';
    if (book.completedAt && book.completedAt.toDate) {
      // Handle Firestore Timestamp object
      dateCompleted = book.completedAt
        .toDate()
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } else if (book.completedAt) {
      // Handle standard JS Date object
      dateCompleted = new Date(book.completedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    let progressPercent = 0;

    if (totalPages > 0) {
      progressPercent = (pagesRead * 100) / totalPages;
    }

    const cardHtml = `
      <div class="col-lg-6 mb-4">
        <div class="reading-card">
          <!-- We store the Firestore doc ID here so the edit button knows WHICH book to update later -->
          <button class="edit-book-btn" data-id="${book.id}" title="Edit Book">
            <i class="bi bi-pencil-square"></i>
          </button>

          <div class="reading-cover">
            <img src="${book.cover}" alt="${book.title}" />
          </div>

          <div class="reading-content">
            <span class="status ${statusClass}">
              <i class="bi ${statusIcon}"></i> ${statusText}
            </span>

            <h5 class="book-title">${book.title}</h5>

            <p class="author">
              <i class="bi bi-person-fill"></i> ${book.author}
            </p>

            <div class="progress-section">
              <div class="d-flex justify-content-between mb-1">
                <small>Reading Progress</small>
                <small> ${pagesRead} / ${totalPages} Pages</small>
              </div>
              <div class="progress">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
              </div>
            </div>

            <div class="reading-info">
              <div>
                <small>Started</small>
                <span>${dateStarted}</span>
              </div>
              <div>
                <small>Completed</small>
                <span>${dateCompleted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.append(cardHtml);
  });
}
