# Live Tournament Bracket (Vercel)

One page, two roles:

| Who | URL | Can do |
|---|---|---|
| **Admin (you)** | `https://YOUR-SITE.vercel.app/?admin` | Build the bracket, drag teams, enter scores, set dates. Every change goes live. |
| **Everyone else** | `https://YOUR-SITE.vercel.app/` | Watch only. The page refreshes itself every 5 seconds. |

The admin password is checked **on the server**, so viewers can't edit even if they open `?admin`.

## Files

```
index.html      the bracket page
api/state.js    GET = read the published bracket, PUT = publish (admin only)
api/login.js    checks the admin password
api/_lib.js     database + password helpers (not an endpoint)
```

No `npm install` is needed.

## Deploy (one time, about 10 minutes)

### 1. Put the project on Vercel
Pick one:
- **GitHub:** push this folder to a new GitHub repo. In Vercel, click **Add New → Project**, import the repo, keep every setting at its default and click **Deploy**.
- **CLI:** open a terminal in this folder and run `npx vercel`, then `npx vercel --prod`.

### 2. Connect a free database
In your Vercel project, go to **Storage → Create Database → Upstash (Redis)**. Pick the free plan and **Connect** it to this project. This adds the database keys to the project for you.

### 3. Set your admin password
Go to **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | a long password only you know |

### 4. Redeploy
Go to **Deployments**, open the **⋯** menu on the latest deployment and click **Redeploy**. New settings only apply after a redeploy.

## Using it on tournament day
1. Open `https://YOUR-SITE.vercel.app/?admin` and log in. Your phone or laptop stays logged in. **Log out** is in the toolbar.
2. Build the bracket. The badge under the title says **Published** after each change.
3. Click **Share QR**, then **Download QR**. Print it or put it on screen. It opens the watch-only page.

## Good to know
- If you edit from two devices at the same time, the last change wins. Edit from one device at a time.
- Opening `index.html` straight from your computer (not through Vercel) still works offline, like the single-file version, but nothing goes live.
- Viewers' pages pick up changes within about 5–8 seconds.
- The badge says **Not published — retrying** if your internet drops. Your changes are kept and are sent when you're back online.
