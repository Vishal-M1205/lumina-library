import {
  search,
  restoreSearchState,
  allSearchResults,
  updatePaginationUI,
} from './searchFunction.js';
import {
  auth,
  signOut,
  db,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from './index.js';

export const savedBooks = new Set();
let currentUser = null;

$(document).ready(function () {
  restoreSearchState();
  $('.search-suggest').on('click', 'a', function (e) {
    e.preventDefault();
    $('.search-bar').val($(this).text());
    search();
  });

  function debounce() {
    let timerId;
    return function () {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        search();
      }, 1000);
    };
  }

  const debounceSearch = debounce();

  $('.search-bar').on('input', function () {
    if ($(this).val() == '') {
      $('#results-container')
        .html(`<img src="../assets/images/image.png" class="book-search-image" alt="" />
        <p class="text-center text-muted">
          <i class="bi bi-search"></i> Seek a Book, Find a Journey.
        </p>`);
      allSearchResults.length = 0;
      updatePaginationUI();
      sessionStorage.removeItem('savedSearchQuery');
      sessionStorage.removeItem('savedSearchResults ');
      sessionStorage.removeItem('savedSearchPage');
    } else {
      debounceSearch();
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;

      const q = query(collection(db, 'library'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      savedBooks.clear();
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        savedBooks.add(data.bookId);
      });
    } else {
      currentUser = null;
      savedBooks.clear();
      await Swal.fire({
        icon: 'info',
        title: 'A Library Awaits',
        text: 'Sign in to begin collecting stories that will stay with you.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      window.location.replace('../index.html');
    }
  });

  $('#logoutBtn').on('click', async function (e) {
    e.preventDefault();

    try {
      // Tell Firebase to log the user out
      await signOut(auth);

      alert('You have been successfully logged out.');

      window.location.replace('../index.html');
    } catch (error) {
      console.error('Logout Error:', error);
      alert('An error occurred while logging out.');
    }
  });

  $('#myLibrary').on('click', () => {
    window.location.replace('./myLibraryPage.html');
  });

  $('#results-container').on('click', '.save-btn', async function () {
    const btn = $(this);
    const bookData = {
      bookId: String(btn.data('id')),
      title: btn.data('title'),
      author: btn.data('author'),
      cover: btn.data('cover'),

      // 1. Decode the description back to normal text/HTML
      description: decodeURIComponent(btn.data('desc')),

      // 2. Convert pages to a strict number
      totalPages: parseInt(btn.data('pages')) || 0,
      pagesRead: 0,

      status: 'want',
      userId: currentUser.uid,

      // 3. Add your new timestamp fields
      savedAt: new Date(),
      startedAt: null,
      completedAt: null,
    };
    try {
      btn.text('Saving...').prop('disabled', true);

      // Save to Firestore
      await addDoc(collection(db, 'library'), bookData);

      // Update local cache with the new ID
      savedBooks.add(bookData.bookId);

      // Update UI
      btn
        .removeClass('btn-save save-btn')
        .addClass('btn-saved')
        .html('<i class="bi bi-check-circle-fill me-2"></i>Saved');
    } catch (error) {
      console.error('Error saving book: ', error);
      alert('Failed to save book. Please try again.');
      btn.html('<i class="bi bi-bookmark-plus me-2"></i>Save to Library').prop('disabled', false);
    }
  });
});
