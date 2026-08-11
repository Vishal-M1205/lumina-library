# Lumina Library

> A responsive personal book-tracking web application for discovering books, building a private reading library, tracking reading progress, and maintaining a journal for individual books.

## Live Demo

[Visit Lumina Library](https://luminalibrary2026.netlify.app/)


## Overview

**Lumina Library** is a client-side web application built with HTML, CSS, JavaScript, jQuery, Bootstrap, Firebase Authentication, and Cloud Firestore.

The application provides a complete reading workflow:

1. A visitor opens the landing page.
2. The user creates an account or signs in.
3. Authenticated users discover books through the iTunes Search API.
4. Books can be saved to a personal Firestore library.
5. Users can manually add books that are not available through the external search.
6. Saved books can be filtered and searched by title or author.
7. Reading status, page progress, started date, and completion date can be updated.
8. Each saved book has its own journal.
9. Journal entries can be created, edited, and deleted.
10. Authentication state controls access to protected pages.

The project is intentionally implemented as a **frontend-only application**. There is no custom Node.js/Express/ASP.NET backend. Firebase provides the authentication and database services.

---

## Features

### Authentication

- User registration with:
  - Full-name validation
  - Email validation
  - Password validation
  - Firebase Email/Password Authentication
- Login with Firebase Authentication
- "Remember me" support
- Session-only login support
- Password reset through Firebase
- Logout confirmation dialog
- Authentication guards for protected pages

### Book Discovery

- Search books using the iTunes Search API
- Search results displayed in responsive Bootstrap cards
- Client-side pagination
- Eight books per page
- Debounced search requests
- Search-state restoration using `sessionStorage`
- Book detail page
- Save a discovered book directly to the user's library
- Visual indication when a book is already saved

### Personal Library

- View all saved books
- Filter books by:
  - All
  - Want to Read
  - Reading
  - Completed
  - Dropped
- Search saved books by title or author
- Debounced local search
- Reading progress calculation
- Started and completed dates
- Edit saved book information
- Delete saved books
- Manual-book editing support
- Open a book-specific journal

### Manual Book Entry

Users can add books manually when a book is unavailable or unsuitable through the external search API.

Manual entries support:

- Title
- Author
- Cover URL
- Total pages
- Publication year
- Description
- Reading status
- Reading progress
- Started date
- Completed date

### Reading Progress

The library tracks:

- `Want to Read`
- `Reading`
- `Completed`
- `Dropped`
- Pages read
- Total pages
- Progress percentage
- Started date
- Completed date

The application also validates logical combinations of status, page count, and dates before updating a book.

### Book Journal

Each saved book can have a dedicated journal.

Users can:

- Create journal entries
- View entries newest-first
- Edit entries
- Delete entries
- See when an entry was edited
- Preserve line breaks in journal content

Journal entries are stored as a Firestore subcollection under the corresponding library book.

### Responsive UI

The interface uses:

- Bootstrap 5
- Bootstrap Icons
- Custom CSS
- Responsive grid layouts
- Mobile-specific layout adjustments
- Custom color variables
- Modals for authentication and editing
- SweetAlert2 and Toastr notifications

---

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Custom styling and responsive presentation |
| JavaScript ES Modules | Application logic |
| jQuery | DOM manipulation and event handling |
| Bootstrap 5 | Responsive layout, components, and modals |
| Bootstrap Icons | Interface icons |
| Firebase Authentication | User registration, login, persistence, and logout |
| Cloud Firestore | User libraries and journal storage |
| iTunes Search API | Book search and book metadata |
| SweetAlert2 | Confirmation dialogs and alerts |
| Toastr | Lightweight success/error notifications |
| Google Fonts | Typography |
| Netlify / static hosting | Deployment |
| Prettier | Code formatting |

---

# Project Architecture

Lumina Library follows a **modular client-side architecture**.

```text
                    ┌──────────────────────┐
                    │      HTML Pages      │
                    │  index + app pages   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Page Scripts     │
                    │ discover / library   │
                    │ book / journal / auth│
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
       ┌──────────────────┐         ┌──────────────────┐
       │ External APIs    │         │ Firebase Layer   │
       │ iTunes Search    │         │ Auth + Firestore │
       └──────────────────┘         └──────────────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                    ┌──────────────────────┐
                    │      UI Rendering    │
                    │ Cards / Modals /     │
                    │ Progress / Journal   │
                    └──────────────────────┘
```

There is no traditional server-side controller layer. Browser JavaScript communicates directly with Firebase and the iTunes Search API.

---

# Folder Structure

```text
Lumina Library/
│
├── index.html
├── .prettierrc
│
├── assets/
│   └── images/
│       ├── bookshelf.png
│       ├── favicon.png
│       └── image.png
│
├── pages/
│   ├── aboutBookPage.html
│   ├── discoverBooksPage.html
│   ├── journalPage.html
│   └── myLibraryPage.html
│
├── scripts/
│   ├── index.js
│   ├── validation.js
│   ├── discoverBooksPage.js
│   ├── searchFunction.js
│   ├── aboutBookPage.js
│   ├── myLibraryPage.js
│   ├── journalPage.js
│   └── manualAddBook.js
│
└── styles/
    ├── index.css
    ├── discoverBooksPage.css
    ├── aboutBookPage.css
    ├── myLibraryPage.css
    └── journalPage.css
```

> The uploaded project also contains Git metadata (`.git/`). It is intentionally omitted from the application structure above because it is repository metadata rather than application source code.

---

# Directory and File Responsibilities

## `index.html`

The main landing page.

Responsibilities:

- Displays the Lumina Library landing interface.
- Provides navigation.
- Contains the login modal.
- Contains the registration modal.
- Contains the forgot-password modal.
- Loads global frontend dependencies.
- Loads Firebase initialization through `scripts/index.js`.
- Loads authentication validation through `scripts/validation.js`.

Main forms:

```text
loginForm
signupForm
forgotPasswordForm
```

The page is the entry point for unauthenticated users.

---

# `pages/`

The `pages` directory contains the application's authenticated feature pages.

## `pages/discoverBooksPage.html`

Book discovery interface.

Responsibilities:

- Search bar
- Search suggestions
- Search result container
- Pagination controls
- Manual book modal
- Navigation to My Library
- Logout functionality

Loaded scripts:

```text
scripts/discoverBooksPage.js
scripts/manualAddBook.js
```

Primary UI elements:

```text
.search-bar
.search-suggest
#results-container
#pagination-controls
#prevBtn
#pageIndicator
#nextBtn
#manualAddModal
#manualAddForm
```

---

## `pages/aboutBookPage.html`

Displays detailed information about a selected book.

The selected book is passed through the URL:

```text
aboutBookPage.html?id=<bookId>
```

Responsibilities:

- Fetch selected book information.
- Determine whether the book is already saved.
- Display title, author, cover, description, and publication year.
- Display reading progress for saved books.
- Allow unsaved books to be added to the library.
- Support manually created books.

---

## `pages/myLibraryPage.html`

The user's personal reading library.

Responsibilities:

- Load the authenticated user's books from Firestore.
- Search saved books.
- Filter books by reading status.
- Display progress.
- Edit books.
- Delete books.
- Open individual book journals.
- Add books manually.

Main UI elements:

```text
#searchMyLibrary
#library-container
.filter-btn
#editBookModal
#editBookForm
#deleteBookBtn
#manualAddModal
```

---

## `pages/journalPage.html`

Book-specific journal interface.

The book is selected through:

```text
journalPage.html?id=<bookId>
```

Responsibilities:

- Verify the user is authenticated.
- Verify that the selected book belongs to the user's library.
- Display book information.
- Create journal entries.
- Display journal entries.
- Edit journal entries.
- Delete journal entries.

Main UI elements:

```text
#journalBookHeader
#headerCover
#headerTitle
#headerAuthor
#addEntryForm
#entryText
#entriesContainer
#editEntryModal
#editEntryForm
```

---

# `scripts/`

The `scripts` directory contains application logic.

## `scripts/index.js`

### Purpose

This is the **Firebase service/configuration module** and shared dependency layer.

It initializes Firebase and exports the services and Firebase functions required by other modules.

### External Firebase modules

The project imports Firebase version `12.17.1` directly from Google's CDN.

The module imports:

- Firebase App
- Firebase Analytics
- Firebase Authentication
- Firebase Firestore

### Authentication functions exported

```text
createUserWithEmailAndPassword()
updateProfile()
signInWithEmailAndPassword()
sendPasswordResetEmail()
onAuthStateChanged()
signOut()
setPersistence()
browserLocalPersistence
browserSessionPersistence
```

### Firestore functions exported

```text
collection()
addDoc()
getDocs()
query()
where()
doc()
updateDoc()
deleteDoc()
orderBy()
```

### Firebase services

```javascript
const auth = getAuth(app);
const db = getFirestore(app);
```

These are shared by all other modules.

### Architectural role

Instead of initializing Firebase separately in every file:

```text
index.js
   │
   ├── Authentication
   └── Firestore
        │
        ├── validation.js
        ├── discoverBooksPage.js
        ├── aboutBookPage.js
        ├── myLibraryPage.js
        ├── journalPage.js
        └── manualAddBook.js
```

This prevents duplicated Firebase initialization and creates a common service layer.

---

# `scripts/validation.js`

### Purpose

Handles authentication forms and client-side validation.

It contains three main authentication workflows:

```text
Registration
Login
Password Reset
```

## Registration workflow

```text
Signup Form
     │
     ▼
jQuery Validate
     │
     ├── Validate name
     ├── Validate email
     └── Validate password
     │
     ▼
Firebase createUserWithEmailAndPassword()
     │
     ▼
Firebase updateProfile()
     │
     ▼
Store display name
     │
     ▼
Success notification
```

### Name validation

The application requires at least three alphabetic characters and permits spaces.

### Password validation

The password must contain:

- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character from `# $ @ !`
- Maximum 15 characters

---

## Login workflow

```text
Login Form
    │
    ▼
Validate Email + Password
    │
    ▼
Check "Remember Me"
    │
    ├── Checked
    │      └── browserLocalPersistence
    │
    └── Unchecked
           └── browserSessionPersistence
    │
    ▼
signInWithEmailAndPassword()
    │
    ▼
Success Alert
    │
    ▼
discoverBooksPage.html
```

### Persistence behavior

The application uses Firebase Auth persistence:

```text
Remember me checked
        ↓
Local browser persistence

Remember me unchecked
        ↓
Session persistence
```

---

## Password reset workflow

The forgot-password form sends a password reset email using:

```javascript
sendPasswordResetEmail()
```

Firebase handles the actual email delivery and password-reset process.

---

# `scripts/discoverBooksPage.js`

### Purpose

Controls the book discovery page and coordinates:

- Authentication
- Search
- Saved-book state
- Saving books
- Logout
- Navigation

### Saved book cache

The module maintains:

```javascript
export const savedBooks = new Set();
```

The set contains book IDs already saved by the current user.

This allows the search results to immediately determine whether a book should show:

```text
Save to Library
```

or:

```text
Saved
```

without querying Firestore for every result card.

---

## Initialization workflow

```text
Page loads
    │
    ▼
onAuthStateChanged()
    │
    ├── User authenticated
    │      │
    │      ▼
    │   Fetch user's library
    │      │
    │      ▼
    │   Populate savedBooks Set
    │      │
    │      ▼
    │   Restore previous search
    │
    └── User not authenticated
           │
           ▼
       Show login message
           │
           ▼
       Redirect to index.html
```

---

## Search workflow

The actual API search is implemented in:

```text
searchFunction.js
```

`discoverBooksPage.js` listens to the search field and invokes `search()` after a debounce delay.

This prevents an API request from being made for every individual keystroke.

---

## Save-book workflow

When the user clicks **Save to Library**:

```text
Search result
     │
     ▼
Extract book metadata
     │
     ├── bookId
     ├── title
     ├── author
     ├── cover
     ├── description
     └── totalPages
     │
     ▼
Create library document
     │
     ▼
Firestore collection("library")
     │
     ▼
Add book ID to savedBooks
     │
     ▼
Change button to "Saved"
```

Initial reading state:

```text
status      = want
pagesRead   = 0
startedAt   = null
completedAt = null
```

---

# `scripts/searchFunction.js`

### Purpose

Responsible for:

- Calling the iTunes Search API
- Storing search results
- Rendering search cards
- Pagination
- Search-state persistence
- Search-state restoration

### API

The project uses the iTunes Search API:

```text
https://itunes.apple.com/search
```

The request searches for:

```text
entity=ebook
```

and retrieves up to:

```text
40 results
```

---

## Search workflow

```text
User enters search term
        │
        ▼
Debounce
        │
        ▼
iTunes Search API
        │
        ▼
JSON response
        │
        ▼
allSearchResults[]
        │
        ▼
sessionStorage
        │
        ▼
Render page 1
```

---

## Pagination

The project fetches up to 40 results but displays:

```text
8 books per page
```

Pagination is client-side.

For example:

```text
40 results
    ↓
Page 1 → 1-8
Page 2 → 9-16
Page 3 → 17-24
Page 4 → 25-32
Page 5 → 33-40
```

This avoids making another API request when the user clicks Next or Previous.

---

## Search-state persistence

The following values are stored in `sessionStorage`:

```text
savedSearchQuery
savedSearchResults
savedSearchPage
```

This allows the user to navigate from the discovery page to another page and return without immediately losing the previous search results.

---

# `scripts/aboutBookPage.js`

### Purpose

Handles the detailed book page.

It supports two types of books:

```text
1. API-discovered books
2. Manually added books
```

---

## API book workflow

```text
aboutBookPage.html?id=<bookId>
        │
        ▼
Read ID from URL
        │
        ▼
Check Firebase authentication
        │
        ▼
Request book details from iTunes
        │
        ▼
Check Firestore library
        │
        ├── Saved
        │     └── Show progress/status
        │
        └── Not saved
              └── Show Save to Library
```

---

## Manual book workflow

Manual books use IDs beginning with:

```text
manual_
```

For example:

```text
manual_1750000000000
```

If the ID starts with `manual_`, the application retrieves the book directly from the user's Firestore library rather than calling the iTunes API.

This is necessary because a manually created book does not have an iTunes `trackId`.

---

## Reading progress calculation

The progress percentage is calculated as:

```text
progress = (pagesRead / totalPages) × 100
```

For example:

```text
pagesRead  = 150
totalPages = 300

progress = 50%
```

The page also displays:

- Pages completed
- Pages remaining
- Started reading date
- Completed date
- Total pages

---

## Save workflow

When an unsaved API book is saved:

```text
Book Details
    │
    ▼
Create library object
    │
    ▼
Firestore library collection
    │
    ▼
Reload book details
    │
    ▼
Display "Saved in Library"
    │
    ▼
Display reading progress
```

---

# `scripts/myLibraryPage.js`

### Purpose

This is the primary reading-library management module.

It handles:

- Loading books
- Rendering cards
- Filtering
- Searching
- Editing
- Updating progress
- Deleting books
- Date formatting
- Manual-book editing

---

## Fetching the library

The module queries Firestore using the authenticated user's UID:

```text
library
   │
   └── where userId == currentUser.uid
```

This ensures that the library displayed belongs to the currently authenticated user.

The results are stored locally in:

```javascript
allSavedBooks
```

This local array is then used for filtering and searching.

---

## Library rendering workflow

```text
Firestore
   │
   ▼
allSavedBooks[]
   │
   ├── Status filter
   │
   └── Search filter
          │
          ▼
      renderLibrary()
          │
          ▼
       Book cards
```

---

## Status filters

Supported statuses:

| Internal value | Display value |
|---|---|
| `want` | Want to Read |
| `reading` | Reading |
| `completed` | Completed |
| `dropped` | Dropped |

---

## Search workflow

The library search is local rather than API-based.

It compares the search term against:

```text
book.title
book.author
```

The search is debounced to avoid unnecessary rendering during rapid typing.

---

## Edit workflow

```text
Edit button
    │
    ▼
Read Firestore document ID
    │
    ▼
Load book data into modal
    │
    ▼
User edits fields
    │
    ▼
Validate values
    │
    ▼
updateDoc()
    │
    ▼
Update allSavedBooks[]
    │
    ▼
Re-render current filter
```

---

## Reading validation rules

The edit workflow checks several consistency rules.

### Completed books

If status is `completed`:

```text
pagesRead == totalPages
startedDate must exist
completedDate must exist
```

### Non-completed books

If:

```text
pagesRead == totalPages
```

but status is not `completed`, the user is asked to change the status.

### Partially read books

If:

```text
0 < pagesRead < totalPages
```

the status must normally be:

```text
reading
```

unless the status is:

```text
dropped
```

### Page validation

The application prevents:

```text
pagesRead > totalPages
```

### Date validation

The application prevents:

```text
startedDate > completedDate
```

---

## Manual-book editing

If the book ID begins with:

```text
manual
```

the edit modal additionally allows:

- Title
- Author
- Description
- Cover URL

The changes are persisted to the same Firestore document.

---

# `scripts/manualAddBook.js`

### Purpose

Provides a reusable manual-book creation workflow.

It is loaded on both:

```text
discoverBooksPage.html
myLibraryPage.html
```

### Validation

Publication year is validated using:

```text
1 <= year <= 9999
```

### Workflow

```text
Manual Add Form
      │
      ▼
Check authentication
      │
      ▼
Validate publication year
      │
      ▼
Collect form fields
      │
      ▼
Generate manual book ID
      │
      ▼
Create library document
      │
      ▼
Firestore
      │
      ▼
Show success notification
```

Manual IDs use:

```text
manual_<timestamp>
```

The document is marked with:

```javascript
isManual: true
```

---

# `scripts/journalPage.js`

### Purpose

Provides the complete book-journal system.

The journal is intentionally associated with the Firestore document representing the saved book.

---

## Journal data model

The structure is:

```text
library
└── <book-document-id>
    └── journal
        ├── <journal-document-id>
        ├── <journal-document-id>
        └── <journal-document-id>
```

This means each saved book owns its own journal entries.

---

## Journal initialization workflow

```text
journalPage.html?id=<bookId>
        │
        ▼
Authenticate user
        │
        ▼
Find book in user's library
        │
        ▼
Get Firestore document ID
        │
        ▼
Load book header
        │
        ▼
Load journal subcollection
```

The module does not allow a journal to be opened for a book that is not in the user's library.

---

## Create entry workflow

```text
Journal text
     │
     ▼
Validate non-empty input
     │
     ▼
library/<bookDocId>/journal
     │
     ▼
addDoc()
     │
     ▼
createdAt timestamp
     │
     ▼
Reload journal feed
```

---

## Read entries workflow

Journal entries are queried using:

```text
orderBy("createdAt", "desc")
```

Therefore, the newest journal entries appear first.

---

## Edit entry workflow

```text
Edit button
    │
    ▼
Load entry ID + text
    │
    ▼
Open modal
    │
    ▼
Submit new text
    │
    ▼
updateDoc()
    │
    ├── text
    └── isEdited = true
    │
    ▼
Reload feed
```

Edited entries display:

```text
(edited)
```

---

## Delete entry workflow

```text
Delete button
     │
     ▼
SweetAlert confirmation
     │
     ├── Cancel → Nothing happens
     │
     └── Confirm
            │
            ▼
         deleteDoc()
            │
            ▼
        Reload feed
```

---

# `styles/`

## `styles/index.css`

Global stylesheet.

Responsibilities:

- Global font
- CSS variables
- Navbar styling
- Common buttons
- Authentication modals
- Form inputs
- Links
- Footer
- Floating add button
- Shared application styles

### Main design variables

```css
:root {
  --primary: #5d737e;
  --secondary: #f4f1ea;
  --tertiary: #d4a373;
  --neutral: #333333;
  --section-bg: #f6f6f6;
}
```

These variables establish the main visual identity of Lumina Library.

---

## `styles/discoverBooksPage.css`

Styles:

- Search bar
- Search suggestions
- Book cards
- Book covers
- Save buttons
- Search illustration
- Responsive search layout

The book discovery page uses a responsive Bootstrap-style grid.

---

## `styles/aboutBookPage.css`

Styles:

- Book details card
- Book cover
- Book metadata
- Status badge
- Description card
- Reading progress
- Progress bar
- Date information boxes
- Responsive book-detail layout

---

## `styles/myLibraryPage.css`

Styles:

- Library filter buttons
- Reading cards
- Status badges
- Progress bars
- Reading metadata
- Edit-book button
- Edit modal
- Delete button
- Library search
- Responsive library cards

---

## `styles/journalPage.css`

Styles:

- Book journal header
- Journal input card
- Textarea
- Journal timeline/feed
- Journal entries
- Edit/delete buttons
- Entry timestamps
- Responsive presentation

---

# `assets/images/`

## `assets/images/bookshelf.png`

Used as a visual asset for the application.

## `assets/images/favicon.png`

Browser favicon.

## `assets/images/image.png`

Used as the discovery/search empty-state illustration.

---

# Data Model

The main Firestore collection is:

```text
library
```

A typical library document has the following logical structure:

```javascript
{
  bookId: "123456789",
  title: "Book Title",
  author: "Author Name",
  cover: "https://...",
  description: "Book description",
  totalPages: 300,
  pagesRead: 120,
  status: "reading",
  userId: "firebase-user-uid",
  savedAt: Timestamp,
  startedAt: Timestamp,
  completedAt: null
}
```

Manual books additionally use fields such as:

```javascript
{
  publishYear: "2025",
  isManual: true
}
```

---

# Journal Data Model

Journal entries are stored under the relevant library document:

```text
library/{bookDocumentId}/journal/{journalDocumentId}
```

A journal entry has the logical structure:

```javascript
{
  text: "My thoughts about this chapter...",
  createdAt: Timestamp,
  isEdited: true
}
```

`isEdited` is added when an existing journal entry is modified.

---

# Complete Application Workflow

## 1. First Visit

```text
index.html
    │
    ├── Login
    ├── Sign Up
    └── Forgot Password
```

The visitor can browse the landing interface but protected application pages require authentication.

---

## 2. Registration

```text
User
 ↓
Sign Up modal
 ↓
Client-side validation
 ↓
Firebase Authentication
 ↓
Create account
 ↓
Set displayName
 ↓
Success notification
```

---

## 3. Login

```text
User
 ↓
Login modal
 ↓
Validate credentials
 ↓
Firebase Authentication
 ↓
Set persistence
 ↓
Discover Books
```

---

## 4. Discover Books

```text
Search term
 ↓
Debounced input
 ↓
iTunes Search API
 ↓
40 results
 ↓
allSearchResults[]
 ↓
8-result pages
 ↓
Book cards
```

---

## 5. Save Book

```text
Book card
 ↓
Save to Library
 ↓
Create Firestore document
 ↓
status = want
 ↓
pagesRead = 0
 ↓
Book appears as Saved
```

---

## 6. View Book Details

```text
Book card
 ↓
aboutBookPage.html?id=...
 ↓
Fetch book details
 ↓
Check Firestore
 ↓
Render:
  title
  author
  cover
  description
  publication year
  status
  progress
```

---

## 7. Manage Library

```text
My Library
 ↓
Fetch user's library
 ↓
allSavedBooks[]
 ↓
Search / Filter
 ↓
Render cards
 ↓
Edit / Delete / Journal
```

---

## 8. Update Reading Progress

```text
Edit Book
 ↓
Select status
 ↓
Update pages
 ↓
Set dates
 ↓
Validate consistency
 ↓
Firestore update
 ↓
Refresh UI
```

---

## 9. Journal

```text
Open Journal
 ↓
Verify book belongs to user
 ↓
Load journal subcollection
 ↓
Create / Edit / Delete entries
 ↓
Reload journal feed
```

---

## 10. Logout

```text
Logout
 ↓
Confirmation dialog
 ↓
Firebase signOut()
 ↓
Clear search session state
 ↓
Redirect to index.html
```

---

# Authentication and Authorization Model

Authentication is handled by Firebase Authentication.

The application uses:

```javascript
onAuthStateChanged(auth, callback)
```

on protected pages.

The general rule is:

```text
Authenticated
    ↓
Allow application access

Not authenticated
    ↓
Redirect to index.html
```

Firestore queries also associate records with:

```text
userId = currentUser.uid
```

This provides application-level user ownership when retrieving library documents.

### Important

Client-side checks are not a substitute for Firestore Security Rules.

A production deployment should enforce ownership through Firestore rules, for example conceptually:

```text
A user may read/write a library document only when
the document's userId matches request.auth.uid.
```

Journal subcollections should have equivalent ownership restrictions through their parent library document.

---

# API and Service Flow

## iTunes Search API

Used for:

- Book discovery
- Book metadata
- Book details

The application makes requests directly from the browser.

### Search

```text
https://itunes.apple.com/search
```

### Details

```text
https://itunes.apple.com/lookup
```

The application converts iTunes cover URLs from approximately:

```text
100x100
```

to:

```text
300x300
```

when possible.

---

# Client-Side State Management

The project does not use Redux, Zustand, Vuex, or another dedicated state-management library.

Instead, state is maintained through:

### Module variables

Examples:

```javascript
currentUser
allSearchResults
allSavedBooks
itunesBookData
firestoreBookDocId
```

### Set

Used for fast saved-book lookup:

```javascript
savedBooks
```

### sessionStorage

Used for preserving discovery-page search state:

```text
savedSearchQuery
savedSearchResults
savedSearchPage
```

### Firestore

Acts as the persistent application data store.

---

# Third-Party Libraries

The application currently loads frontend dependencies from CDNs.

### Bootstrap

Used for:

- Grid system
- Responsive design
- Modals
- Buttons
- Forms
- Utility classes

### Bootstrap Icons

Used for:

- Book icons
- User icons
- Calendar icons
- Edit/delete icons
- Navigation icons

### jQuery

Used for:

- DOM selection
- Event handling
- AJAX-style UI workflows
- Dynamic rendering
- Form interaction

### jQuery Validation

Used for login and registration validation.

### SweetAlert2

Used for:

- Logout confirmation
- Success messages
- Error messages
- Delete confirmations

### Toastr

Used for lightweight notifications on library and journal operations.

---

# Local Development

Lumina Library is a static frontend application and does not require:

```text
Node.js
npm
Express
ASP.NET
Python
```

for its current runtime architecture.

A local development server is still recommended because ES modules and browser security policies can behave differently when files are opened directly using `file://`.

Examples of suitable development servers:

- VS Code Live Server
- VS Code Live Preview
- Any static HTTP server

---

# Setup

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd Lumina-Library
```

## 2. Serve the project

Open the project through a local HTTP server.

For example, with VS Code:

```text
Install Live Server
→ Right-click index.html
→ Open with Live Server
```

## 3. Configure Firebase

Open:

```text
scripts/index.js
```

and configure:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

The Firebase project should have:

- Authentication enabled
- Email/Password sign-in enabled
- Cloud Firestore enabled
- Appropriate Firestore Security Rules configured

## 4. Run the application

Start the static server and open:

```text
index.html
```

---

# Firebase Configuration

The project currently uses Firebase directly from the browser.

This means Firebase configuration is included in frontend JavaScript.

A Firebase web API key is **not equivalent to a server-side secret**. Firebase web applications normally expose their configuration to the client.

However, security must be enforced through:

- Firebase Authentication
- Firestore Security Rules
- Firebase App Check where appropriate
- Proper project restrictions and monitoring

Do not place actual server-side secrets, service-account credentials, or private API keys in this repository.

---

# Firestore Security Recommendation

For production, the `library` collection should enforce ownership.

Conceptually:

```text
request.auth != null
AND
request.auth.uid == resource.data.userId
```

For journal entries, authorization should be based on the parent library document's ownership.

Do not rely solely on JavaScript conditions such as:

```javascript
where('userId', '==', user.uid)
```

for security. Those conditions control what the application requests, but Firestore Security Rules must independently enforce what a user is allowed to read or modify.

---

# Validation Rules

## Account

### Name

- Minimum three alphabetic characters
- Letters and spaces only

### Email

- Valid email format

### Password

- 8–15 characters
- Uppercase
- Lowercase
- Number
- Special character

---

## Reading Progress

The application enforces:

```text
pagesRead <= totalPages
```

and:

```text
startedDate <= completedDate
```

For completed books:

```text
pagesRead == totalPages
startedDate exists
completedDate exists
```

For partially read books:

```text
0 < pagesRead < totalPages
status = reading
```

unless the user has explicitly marked the book as dropped.

---

# Error Handling

The application uses several layers of error handling.

## Firebase operations

Operations use:

```javascript
try {
    ...
} catch (error) {
    ...
}
```

Examples:

- Login failures
- Registration failures
- Firestore read failures
- Firestore write failures
- Delete failures

## API operations

Search and book-detail requests check for failed network/API responses.

## User feedback

The UI communicates operation results through:

- SweetAlert2
- Toastr
- Inline error messages
- Disabled/loading buttons

---

# UI/UX Design System

Lumina Library uses a warm, library-oriented visual system.

### Primary

```text
#5d737e
```

Used for:

- Primary actions
- Navigation
- Progress bars
- Active filters

### Secondary

```text
#f4f1ea
```

Used primarily for:

- Backgrounds
- Navigation
- Modal surfaces

### Tertiary

```text
#d4a373
```

Used for:

- Accent elements
- Status indicators
- Icons
- Highlights

### Neutral

```text
#333333
```

Used for:

- Main text
- Titles
- Content

### Section background

```text
#f6f6f6
```

Used for:

- Secondary surfaces
- Progress backgrounds
- Information boxes

---

# Responsive Design

The application uses Bootstrap's responsive grid together with custom CSS media queries.

Examples:

```text
Desktop
→ Multi-column book grid
→ Horizontal reading cards

Tablet
→ Reduced grid columns
→ Adjusted spacing

Mobile
→ Single-column cards
→ Vertical reading cards
→ Full-width controls
```

---

# Performance Considerations

Several client-side optimizations are already implemented.

## Debounced search

Search requests are delayed until the user pauses typing.

This reduces unnecessary iTunes API requests.

## Client-side pagination

The application retrieves up to 40 results and paginates them locally.

## Saved-book Set

A JavaScript `Set` provides efficient membership checking:

```javascript
savedBooks.has(bookId)
```

## Local library filtering

After the library is loaded, status filtering and text search are performed locally instead of repeatedly querying Firestore.

## Search restoration

`sessionStorage` avoids re-fetching search results when navigating away and returning during the same browser session.

---

# Important Implementation Notes

## Book IDs

External books use the iTunes `trackId`.

Manual books use:

```text
manual_<timestamp>
```

This distinction allows the application to determine where book metadata should be retrieved.

---

## Firestore document ID vs book ID

These are different concepts.

### `bookId`

Identifies the book itself.

Example:

```text
123456789
```

### Firestore document ID

Identifies the stored library document.

Example:

```text
xYzAbC123...
```

The application stores the Firestore document ID locally when loading the library so that it can later perform:

```javascript
updateDoc()
deleteDoc()
```

on the correct document.

---

# Known Technical Considerations

The current implementation has several areas worth improving before treating the project as a hardened production application.

### 1. Firestore Security Rules

Security Rules should be reviewed and configured to enforce user ownership for both:

```text
library
library/{bookId}/journal
```

### 2. Frontend API configuration

The Firebase web configuration is present in client-side JavaScript. This is normal for Firebase web applications, but access control must be enforced through Firebase configuration, Authentication, and Security Rules.

### 3. HTML escaping

Several dynamically generated HTML strings insert API/database values directly into template literals.

For production hardening, user-controlled or external text should be escaped before insertion into HTML, or inserted using DOM APIs such as `.text()` where HTML markup is not required.

This is particularly relevant to:

- Book titles
- Author names
- Descriptions
- Journal entries

### 4. Data consistency

The project uses both Firestore Timestamp objects and JavaScript `Date` objects depending on where data originated. The application already contains conversion logic, but a consistent timestamp strategy would simplify the data layer.

### 5. External API dependency

Book discovery and details depend on the availability and behavior of the iTunes Search API.

A production architecture could introduce a backend/API proxy if additional control, caching, normalization, or server-side validation becomes necessary.

### 6. Dependency management

The current application uses CDN dependencies rather than an npm-based build system.

For a larger production project, dependencies could be managed through:

```text
package.json
npm
Vite
ESLint
Prettier
```

---

# Suggested Future Improvements

Potential next-stage improvements include:

- Firestore Security Rules
- Firebase App Check
- User profile/settings page
- Reading statistics dashboard
- Bookshelves/categories
- Favorite books
- Rating system
- Notes separate from journal entries
- Reading goals
- Monthly/yearly reading statistics
- Search sorting
- Advanced filtering
- Better empty states
- Loading skeletons
- Offline support
- Progressive Web App support
- Service worker caching
- Accessibility audit
- HTML escaping/sanitization layer
- Centralized error-handling utilities
- Centralized date utilities
- TypeScript migration
- npm/Vite-based development workflow
- Automated linting and formatting
- Unit and integration tests
- Backend/API proxy for external book services

---

# Code Formatting

The repository includes:

```text
.prettierrc
```

Current formatting preferences:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

These settings provide consistent JavaScript formatting.

---

# Deployment

Lumina Library is compatible with static hosting platforms because it does not require a custom backend.

Suitable platforms include:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Firebase Hosting

For Netlify-style deployment:

```text
Git repository
      │
      ▼
Netlify
      │
      ▼
Static files
      │
      ├── HTML
      ├── CSS
      ├── JavaScript
      └── Assets
```

Firebase remains responsible for:

```text
Authentication
Firestore
```

while the hosting platform serves the frontend files.

---

# Recommended Deployment Checklist

Before deploying a production version:

- [ ] Enable Firebase Email/Password Authentication
- [ ] Configure Firestore
- [ ] Write restrictive Firestore Security Rules
- [ ] Test unauthenticated access to protected pages
- [ ] Test user A cannot read user B's library
- [ ] Test user A cannot modify user B's journal
- [ ] Test manual-book editing
- [ ] Test completed-book validation
- [ ] Test mobile layouts
- [ ] Test API failure states
- [ ] Test Firebase authentication errors
- [ ] Verify all CDN resources load over HTTPS
- [ ] Verify favicon and image paths
- [ ] Configure the deployed domain in Firebase Authentication if required
- [ ] Remove unnecessary development/debug code
- [ ] Audit dynamically injected HTML for XSS risks

---

# End-to-End Example

A typical user journey looks like this:

```text
                    ┌──────────────┐
                    │  index.html  │
                    └──────┬───────┘
                           │
                    Sign Up / Login
                           │
                           ▼
                ┌─────────────────────┐
                │ Discover Books Page │
                └──────────┬──────────┘
                           │
                    Search iTunes API
                           │
                           ▼
                    Search Results
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
          Book Details          Save Directly
                 │                   │
                 └─────────┬─────────┘
                           ▼
                      Firestore
                           │
                           ▼
                    My Library Page
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Filter         Edit         Journal
             │             │             │
             │             ▼             ▼
             │        Progress       Journal Entries
             │        + Dates       + Edit + Delete
             │             │             │
             └─────────────┴─────────────┘
                           │
                           ▼
                         Logout
                           │
                           ▼
                      index.html
```

---

# Module Dependency Map

```text
index.html
 ├── scripts/index.js
 └── scripts/validation.js
          │
          └── scripts/index.js

discoverBooksPage.html
 ├── scripts/discoverBooksPage.js
 │      ├── scripts/searchFunction.js
 │      │      └── scripts/discoverBooksPage.js
 │      └── scripts/index.js
 │
 └── scripts/manualAddBook.js
        └── scripts/index.js

aboutBookPage.html
 └── scripts/aboutBookPage.js
        └── scripts/index.js

myLibraryPage.html
 ├── scripts/myLibraryPage.js
 │      └── scripts/index.js
 │
 └── scripts/manualAddBook.js
        └── scripts/index.js

journalPage.html
 └── scripts/journalPage.js
        └── scripts/index.js
```

### Important dependency relationship

There is a circular-looking module relationship between:

```text
discoverBooksPage.js
        ↕
searchFunction.js
```

`searchFunction.js` imports `savedBooks` from `discoverBooksPage.js`, while `discoverBooksPage.js` imports search functions from `searchFunction.js`.

The current browser-module implementation works in the existing application flow, but this is an architectural area that could be refactored in the future by moving shared state into a dedicated module such as:

```text
scripts/state.js
```

That would produce a cleaner dependency graph.

---

# Project Summary

Lumina Library is a **Firebase-backed, frontend-only reading management application** that combines external book discovery with personal reading data.

Its core architecture is:

```text
HTML/CSS
   +
JavaScript Modules
   +
jQuery / Bootstrap
   +
iTunes Search API
   +
Firebase Authentication
   +
Cloud Firestore
```

The application separates responsibilities reasonably well:

```text
Authentication       → validation.js
Firebase services    → index.js
Book discovery       → searchFunction.js
Discovery page       → discoverBooksPage.js
Book details         → aboutBookPage.js
Library management   → myLibraryPage.js
Manual books         → manualAddBook.js
Book journals        → journalPage.js
Global styling       → index.css
Page styling         → individual CSS files
```

This separation makes the project suitable as a portfolio project and provides a clear foundation for later migration to a more structured frontend architecture or a full-stack application.

---

## Author

**Vishal Manivannan**

Lumina Library — Personal Book Tracking and Reading Journal Application.
