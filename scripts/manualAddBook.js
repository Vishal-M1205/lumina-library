// scripts/manualAddBook.js
import { auth, db, collection, addDoc } from './index.js';

$(document).ready(function () {
  $('#manualAddForm').on('submit', async function (e) {
    e.preventDefault();

    if (!auth.currentUser) {
      alert('You must be logged in to add a book.');
      return;
    }

    const submitBtn = $(this).find('button[type="submit"]');
    const originalText = submitBtn.html();

    // 1. Gather all data
    const title = $('#manualTitle').val().trim();
    const author = $('#manualAuthor').val().trim();
    let coverUrl = $('#manualCover').val().trim();
    const totalPages = parseInt($('#manualPages').val()) || 0;
    const publishYear = $('#manualYear').val().trim() || 'Unknown';
    const rawDesc = $('#manualDesc').val().trim() || 'No description available.';

    // 2. Set Fallback Cover if left empty
    if (!coverUrl) {
      coverUrl = 'https://placehold.co/150x200?text=No+Cover';
    }

    // 3. Generate a fake ID for our cache and routing
    const manualBookId = 'manual_' + Date.now();

    // 4. Build the exact same object structure you already use
    const bookData = {
      bookId: manualBookId,
      title: title,
      author: author,
      cover: coverUrl,
      description: encodeURIComponent(rawDesc), // Safe encoding
      publishYear: publishYear,
      totalPages: totalPages,
      pagesRead: 0,
      status: 'want',
      userId: auth.currentUser.uid,
      savedAt: new Date(),
      startedAt: null,
      completedAt: null,
      isManual: true, // Helps you identify it in the database later!
    };

    try {
      submitBtn
        .html('<span class="spinner-border spinner-border-sm me-2"></span>Adding...')
        .prop('disabled', true);

      // Save to Firestore
      await addDoc(collection(db, 'library'), bookData);

      // Success UI
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Book added manually!',
        showConfirmButton: false,
        timer: 2000,
      });

      // Reset form and close modal
      $('#manualAddForm')[0].reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById('manualAddModal'));
      modal.hide();

      // IMPORTANT: If they are on the Library page, refresh to show the new book
      if (window.location.pathname.includes('myLibraryPage')) {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Error manually adding book:', error);
      Swal.fire('Error', 'Could not add the book. Please try again.', 'error');
    } finally {
      submitBtn.html(originalText).prop('disabled', false);
    }
  });
});
