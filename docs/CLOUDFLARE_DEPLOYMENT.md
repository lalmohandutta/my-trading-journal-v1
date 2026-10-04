# Cloudflare Pages deployment

## 1. Push repository to GitHub

- Create a repository on GitHub.
- Commit the project.
- Push the repository.

## 2. Create Cloudflare Pages project

- Go to Cloudflare Pages.
- Create a project.
- Connect the GitHub repository.

## 3. Configure project settings

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## 4. Add environment variables

Add the following in Cloudflare Pages settings:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## 5. Deploy

Trigger the first deployment.

## 6. Verify authentication

- Open the deployed site.
- Register a user.
- Log in successfully.

## 7. Verify database access

- Create and view trades.
- Verify metadata and rows are stored correctly.

## 8. Verify screenshot uploads

- Upload a screenshot to a trade.
- Confirm it is stored in the private bucket and displayed correctly.

## 9. Verify SPA routes

- Ensure `public/_redirects` contains:

```text
/* /index.html 200
```

This allows React Router routes to work after deployment.
