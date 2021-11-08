# ShoeFy Finance website
This project contains the website of ShoeFy Finance.

## How to edit
Install Node.js, then run:

    npm install

You can run a development server using:

    npm start

Which will then open a server listening to http://localhost:3000.
While you change files in `src/` or `public/`, the dev server keeps updating your browser.
This way you can conveniently edit the website with any editor.

When you're done, please follow the deployment routine.

## How to deploy
Make your changes first. Then run:

    npm run build

Take the contents of the `dist/` folder and put them online via FTP.
Make sure the `.htaccess` is also deployed because the React router will break without.

## Coding guidelines

### DO

* maintain the structural integrity of the project
* use existing components, if possible - for example `StaticHtml` for a new static page
* use NPM to add external dependencies (like Web3, JQuery, ...)
* stick to React.js best practices

### DON'T

* add external libraries by committing `.js` files directly into the repo (always use NPM)
* add static content anywhere else than `/src/content`
* commit directly on `main` without consent of lead developer

