# LawyerPortal

Website for SMS Law Associates, Salem, with a consultation booking form and an
admin screen at `/admin`.

## Running locally

There are two parts:

| Part | Folder | Port | Does |
|---|---|---|---|
| Angular site + Node SSR server | `/` | 4200 | Website and admin screen; forwards `/api/*` to Spring Boot |
| Spring Boot bookings API | `lawyer/lawyer` | 8080 | Saves and lists bookings in PostgreSQL |

1. **Database:** create the `lawyer-portal` database in your local PostgreSQL.
   The `bookings` table is created automatically on first start (`schema.sql`).
2. **Spring Boot config:** copy `lawyer/lawyer/.env.example` to `lawyer/lawyer/.env`
   and fill in `DB_PASSWORD` and `ADMIN_PASSWORD`. (`.env` is git-ignored.)
3. **Start the API** (from `lawyer/lawyer`):
   ```bash
   mvn spring-boot:run
   ```
4. **Start the website** (from this folder):
   ```bash
   npm start
   ```
5. Open `http://localhost:4200`, book a consultation, then open
   `http://localhost:4200/admin` and log in with `ADMIN_PASSWORD`.

For production, set `NG_ALLOWED_HOSTS` (your domain) and `API_URL` in the root `.env`
(see `.env.example`), and `COOKIE_SECURE=true` in `lawyer/lawyer/.env` once the site
is on HTTPS.

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
