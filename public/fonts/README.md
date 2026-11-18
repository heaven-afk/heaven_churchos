# Presentation fonts

Inter, Outfit and Lora are distributed by Google Fonts under the SIL Open Font
License. Full license notices are in `licenses/` beside this document.

The application uses Next.js `next/font/google` to download font files at build
time and serve them from its own static assets. Display windows make no runtime
requests to Google Fonts. An initial build needs network access; locally served
fonts work with the running local server without an internet connection.

Sources:
- https://github.com/google/fonts/tree/main/ofl/inter
- https://github.com/google/fonts/tree/main/ofl/outfit
- https://github.com/google/fonts/tree/main/ofl/lora

Geist remains the default application typeface. The additional fonts are offered
for presentation content and preserve Latin Extended coverage for Yoruba text.
