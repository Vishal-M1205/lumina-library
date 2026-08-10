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
  deleteDoc,
  doc,
  orderBy,
} from './index.js';

const urlParams = new URLSearchParams(window.location.search);
const currentBookId = urlParams.get('id');

let currentUser = null;
let firestoreBookDocId = null; // We need this to save into the subcollection!

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: 'toast-top-right',
  preventDuplicates: false,
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
};

$(document).ready(function () {
  // Navigation
  $('#discoverBooks').on('click', () => {
    window.location.replace('./discoverBooksPage.html');
  });

  // Back button
  $('#backBtn').on('click', () => {
    window.history.back();
  });

  // Logout Logic
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
      alert('An error occurred while logging out.');
    }
  });

  if (!currentBookId) {
    $('#journalBookHeader').html('<p class="text-danger">No book selected.</p>');
    return;
  }

  // Check Auth & Initialize
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await initJournalPage();
    } else {
      window.location.replace('../index.html');
    }
  });
});

async function initJournalPage() {
  try {
    // 1. We MUST find this book in the user's Firestore library first
    const q = query(
      collection(db, 'library'),
      where('userId', '==', currentUser.uid),
      where('bookId', '==', currentBookId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      Swal.fire(
        'Error',
        'Book not found in your library. You can only journal saved books.',
        'error'
      );
      $('#entriesContainer').html('<p class="text-center text-muted">No book found.</p>');
      return;
    }

    // Save the actual Firestore Document ID
    const bookDoc = snapshot.docs[0];
    firestoreBookDocId = bookDoc.id;
    const savedBookData = bookDoc.data();

    // 2. Populate Header Data directly from Firestore (Works for BOTH iTunes and Manual books!)
    $('#headerTitle').text(savedBookData.title);
    $('#headerAuthor').html(`<i class="bi bi-person-fill me-2"></i>${savedBookData.author}`);
    $('#headerCover').attr('src', savedBookData.cover);

    // 3. Load the past journal entries
    await loadJournalEntries();
  } catch (error) {
    console.error('Error initializing journal:', error);
  }
}

// --- ADD NEW ENTRY ---
$('#addEntryForm').on('submit', async function (e) {
  e.preventDefault();

  if (!firestoreBookDocId) return;

  const entryText = $('#entryText').val().trim();
  if (!entryText) return;

  const submitBtn = $(this).find('button[type="submit"]');
  const originalText = submitBtn.text();

  try {
    submitBtn.html('<span class="spinner-border spinner-border-sm"></span>').prop('disabled', true);

    // Create reference to the SUBCOLLECTION: library -> [docId] -> journal
    const journalRef = collection(db, 'library', firestoreBookDocId, 'journal');

    await addDoc(journalRef, {
      text: entryText,
      createdAt: new Date(),
    });

    // Reset UI
    $('#entryText').val('');
    toastr.success('Journal entry saved!');

    // Reload feed
    await loadJournalEntries();
  } catch (error) {
    console.error('Error saving entry:', error);
    toastr.error('Failed to save entry.');
  } finally {
    submitBtn.text(originalText).prop('disabled', false);
  }
});

// --- LOAD ENTRIES ---
async function loadJournalEntries() {
  const container = $('#entriesContainer');

  try {
    // Query the subcollection, ordered by newest first
    const journalRef = collection(db, 'library', firestoreBookDocId, 'journal');
    const q = query(journalRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    container.empty();

    if (snapshot.empty) {
      container.html(`
        <div class="text-center text-muted py-5">
          <i class="bi bi-journal-text fs-1 mb-3 d-block opacity-50"></i>
          <p>Your journal is empty. Write your first thought above!</p>
        </div>
      `);
      return;
    }

    // Render each entry
    snapshot.forEach((docSnap) => {
      const entry = docSnap.data();
      const entryId = docSnap.id;

      // Format Date
      let dateString = 'Unknown Date';
      if (entry.createdAt) {
        const d = entry.createdAt.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt);
        dateString = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }

      // We use standard Bootstrap grid/flexbox combined with your custom CSS
      const entryHtml = `
        <div class="entry-card p-4 rounded-4 shadow-sm mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="entry-date"><i class="bi bi-calendar2-heart me-2"></i>${dateString}</span>
            <button class="delete-entry-btn" data-id="${entryId}" title="Delete Entry">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          <div class="entry-text">${entry.text}</div>
        </div>
      `;

      container.append(entryHtml);
    });
  } catch (error) {
    console.error('Error loading entries:', error);
    container.html('<p class="text-danger text-center">Could not load journal entries.</p>');
  }
}

// --- DELETE ENTRY ---
$(document).on('click', '.delete-entry-btn', async function () {
  const entryId = $(this).data('id');

  const result = await Swal.fire({
    title: 'Delete Entry?',
    text: 'This thought will be permanently removed.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#5d737e',
    confirmButtonText: 'Yes, delete it',
  });

  if (result.isConfirmed) {
    try {
      // Point to the specific entry inside the subcollection
      await deleteDoc(doc(db, 'library', firestoreBookDocId, 'journal', entryId));

      toastr.success('Entry deleted');
      await loadJournalEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toastr.error('Failed to delete entry');
    }
  }
});
