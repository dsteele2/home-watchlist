# CT/MA Home Search — Field Ledger

A static site tracking the home search watchlist. No backend, no build step —
just HTML/CSS/JS reading from `data.js`. Deployed on Vercel, auto-updates on
every push to `main`.

## Files

- `index.html` — page structure
- `style.css` — all styling
- `app.js` — filtering, sorting, save/dismiss logic (rarely needs edits)
- `data.js` — **the file you edit**. One object per property.

## Ongoing workflow

1. Evaluate a property in the research chat.
2. Bring the finalized listing back to this chat (the widget-maintenance one).
3. Claude gives you a ready-to-paste object for `LISTINGS` in `data.js`.
4. Paste it in, save, then in the terminal:
   ```
   git add data.js
   git commit -m "Add 34 Blue Ridge Mountain Dr"
   git push
   ```
5. Vercel redeploys automatically within ~30 seconds.

To remove a property, delete its object from the array (or just mark
`dismissed: true` if you want to keep the history).

## Local preview

Before pushing, you can preview changes locally. From this folder:

```
npx serve .
```

Then open the URL it prints (usually http://localhost:3000).
