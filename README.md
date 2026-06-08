# Recipe Book — Frontend

A simple recipe browser for your Spring Boot Recipe API.  
**This is not a frontend course** — you don’t need to understand the JavaScript.

This repo deploys to **Azure Static Web Apps** through your CI/CD pipeline.

---

## Deploying (Azure Static Web Apps)

Push your code — the pipeline deploys this site for you.

To point the app at your Spring Boot API, set the **environment variable** for the API URL.  
**Follow the workbook** for the exact variable name and where to set it in Azure.

You do **not** need to worry about CORS — that’s already handled.

---

## Run locally (optional)

1. Start your Spring Boot API (usually port **8080**)
2. Open **`js/config.js`** — `API_BASE` should already be `http://localhost:8080`
3. Serve this folder (don’t double-click `index.html`):

   ```bash
   npx serve .
   ```

4. Open the URL in the terminal (often `http://localhost:3000`)

---

## How this app works (30 seconds)

1. The page calls **`GET {API_BASE}/api/recipes`**
2. Recipes show in a list with images from the **`images/`** folder
3. The search box filters recipes
4. **Click a recipe image** to see ingredients and instructions

The API returns recipe data and an image **path** (e.g. `/images/recipe-1.jpg`). This site serves the actual photos from its own `images/` folder.

---

## Project layout

```
index.html      ← main page
css/style.css   ← styles
js/config.js    ← API URL for local dev (deploy uses env var — see workbook)
js/app.js       ← app logic
images/         ← recipe photos (recipe-1.jpg … recipe-18.jpg)
openapi.json    ← API reference (optional)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Could not reach the API” (local) | Is Spring Boot running? Is `js/config.js` set to `http://localhost:8080`? |
| “Could not reach the API” (deployed) | Check the API URL environment variable — see **workbook** |
| Images missing | Are `images/recipe-1.jpg` etc. included in the deployed site? |

---

## Questions?

- **Deploy / API URL / pipeline** → workbook or instructor  
- **How the UI works** → optional; not required for the assignment
