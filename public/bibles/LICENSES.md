# Bible library sources and permissions

All seven translations include the 66-book Protestant canon (1,189 chapters each).
Text is served from this installation, one book per request. There are no runtime
Bible API calls, invented verses, or substitutions between translations.

| Version | Source | Distribution terms |
| --- | --- | --- |
| KJV (1769) | https://ebible.org/Scriptures/eng-kjv_vpl.zip | Public domain outside UK; UK Crown printing rights may apply. See sources/KJV-copyright.htm. |
| WEB | https://api.getbible.net/v2/web.json | Public domain. World English Bible text from eBible.org. |
| ASV | https://api.getbible.net/v2/asv.json | Public domain. American Standard Version (1901). |
| BBE | https://api.getbible.net/v2/basicenglish.json | Public domain according to the supplied source metadata. |
| YLT | https://api.getbible.net/v2/ylt.json | Public domain. Young's Literal Translation. |
| WBS | https://api.getbible.net/v2/wb.json | Public domain. Webster's Bible (1833). |
| OYCB | https://ebible.org/Scriptures/yor_vpl.zip | CC BY-SA 4.0. Full upstream notice: sources/OYCB-copyright.htm. |

## Yoruba attribution

Biblica® Open Yoruba Contemporary Bible™

Copyright © 2009, 2017 by Biblica, Inc.

The original work is available at https://www.biblica.com and https://open.bible.
License: https://creativecommons.org/licenses/by-sa/4.0/
Publisher source: https://ebible.org/yor/copyright.htm

The distributed Yoruba JSON corpus and contributions to that corpus are available
under CC BY-SA 4.0. Conversion changes the container format, normalizes book IDs,
and trims whitespace around verse text. It omits non-verse material from the VPL
export. It does not translate or paraphrase verse text. Keep source, attribution,
and license notices when redistributing. No publisher endorsement is implied.
The upstream trademark notice is retained in sources/OYCB-copyright.htm.

## Reproducibility

`manifest.json` records source URLs, SHA-256 hashes of input text/JSON, chapter
counts, and verse counts. `sources/` retains English metadata and eBible notices.
Verse counts vary with source versification. Unavailable verse ranges produce an
error rather than fabricated text.

To rebuild, download and extract the two eBible VPL archives into
`scratch/bible-sources/kjv` and `scratch/bible-sources/yor`. Run
`npm run bibles:prepare`; the script also downloads the five getBible sources if
not present. Building/running the app uses the committed assets and does not need
the preparation script or internet access. This app uses the canonical 66 books
from the larger KJV source archive.

## Versions awaiting licensing

NIV, Amplified (AMP/AMPC), and The Message (MSG) are not bundled or selectable.
Reading a version free on a website does not grant a software redistribution
license for its complete text. Publisher permission and a licensed data source
must be established before adding those versions.

- NIV: https://www.biblica.com/permissions/
- Amplified: https://www.lockman.org/permission-to-quote-copyright-trademark-information/
- The Message: https://www.navpress.com/permissions

The open Yoruba license does not grant rights to NIV.
