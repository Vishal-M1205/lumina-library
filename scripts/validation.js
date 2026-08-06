import {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from './index.js';

$(document).ready(function () {
  $('#signupForm').validate({
    errorClass: 'text-danger',

    rules: {
      fullname: {
        required: true,
        pattern: /^(?=(?:.*[A-Za-z]){3,})[A-Za-z\s]+$/,
      },
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 8,
        pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#$@!]).*$/,
        maxlength: 15,
      },
    },

    messages: {
      fullname: {
        required: 'Please enter your name.',
        pattern: 'Only letters and spaces are allowed.',
      },
      email: {
        required: 'Please enter your email.',
        email: 'Enter a valid email address.',
      },
      password: {
        required: 'Please enter a password.',
        minlength: 'Password must be at least 8 characters.',
        maxlength: 'Password cannot exceed 15 characters.',
        pattern:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#, $, @, or !).',
      },
    },

    submitHandler: async function (form, event) {
      event.preventDefault(); // Prevent the default form submission
      const name = $(form).find('input[name="fullname"]').val().trim();
      const email = $(form).find('input[name="email"]').val().trim();
      const password = $(form).find('input[name="password"]').val();
      const submitBtn = $(form).find('button');
      const originalText = submitBtn.text();

      try {
        submitBtn.text('Creating Account...').prop('disabled', true);
        // Firebase logic using the imported 'auth'
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Welcome to Lumina Library.',
          confirmButtonColor: '#5d737e',
        });
        form.reset();

        // Close the modal
        const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        if (signupModal) signupModal.hide();
      } catch (error) {
        console.error('Sign Up Error:', error);
        if (error.code === 'auth/email-already-in-use') {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'An account with this email already exists. Please log in.',
            confirmButtonColor: '#f30606',
          });
        } else {
          alert('Error: ' + error.message);
        }
      } finally {
        submitBtn.text(originalText).prop('disabled', false);
      }
    },
  });

  $('#loginForm').validate({
    errorClass: 'text-danger',

    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
    },

    messages: {
      email: {
        required: 'Please enter your email.',
        email: 'Enter a valid email address.',
      },
      password: {
        required: 'Please enter a password.',
      },
    },

    submitHandler: async function (form, event) {
      event.preventDefault();

      const email = $(form).find('input[name="email"]').val().trim();
      const password = $(form).find('input[name="password"]').val();
      const submitBtn = $(form).find('button');
      const originalText = submitBtn.text();

      try {
        // Show loading state
        submitBtn.text('Logging in...').prop('disabled', true);

        // Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        Swal.fire({
          icon: 'success',
          title: 'Login Success!',
          text: `Welcome back ${user.displayName}.`,
          confirmButtonColor: '#5d737e',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        form.reset();

        setTimeout(() => {
          window.location.replace('./pages/discoverBooksPage.html');
        }, 2000);

        // Close the modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) loginModal.hide();
      } catch (error) {
        console.error('Login Error:', error);

        // Firebase recently grouped "user not found" and "wrong password"
        // into a single error code for security purposes
        if (error.code === 'auth/invalid-credential') {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Invalid email or password. Please try again.',
            confirmButtonColor: '#f30606',
          });
        } else {
          alert('Error: ' + error.message);
        }
      } finally {
        // Restore button state
        submitBtn.text(originalText).prop('disabled', false);
      }
    },
  });

  $('#forgotPasswordForm').validate({
    errorClass: 'text-danger',

    rules: {
      email: {
        required: true,
        email: true,
      },
    },

    messages: {
      email: {
        required: 'Please enter your email.',
        email: 'Enter a valid email address.',
      },
    },
    submitHandler: async function (form, event) {
      event.preventDefault();

      const email = $(form).find('input[name="email"]').val().trim();
      const submitBtn = $(form).find('button');
      const originalText = submitBtn.text();

      try {
        // Show loading state
        submitBtn.text('Sending Link...').prop('disabled', true);

        // Tell Firebase to send the reset email
        await sendPasswordResetEmail(auth, email);

        alert('Password reset link sent! Please check your inbox.');
        form.reset();

        // Close the modal
        const forgotModal = bootstrap.Modal.getInstance(
          document.getElementById('forgotPasswordModal')
        );
        if (forgotModal) forgotModal.hide();
      } catch (error) {
        console.error('Forgot Password Error:', error);

        // Handle specific errors
        if (error.code === 'auth/invalid-email') {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Please enter a valid email address.',
            confirmButtonColor: '#f30606',
          });
        } else {
          // Note: For security, modern Firebase defaults to not revealing if an email exists or not,
          // so it usually just succeeds even if the email isn't in the database.
          alert('Error: ' + error.message);
        }
      } finally {
        // Restore button state
        submitBtn.text(originalText).prop('disabled', false);
      }
    },
  });
});
