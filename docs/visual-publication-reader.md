# Visual publication reader integration

The public zine page remains the Biblioteca host boundary. It reads the catalogue record and passes only the publication title, relevant description/creator metadata, the existing external PDF URL, and the existing standard-viewer URL to the standalone reader.

The standalone reader does not access Supabase, catalogue services, or Biblioteca storage. It receives a `pdf` representation and uses PDF.js to create reading derivatives for the visual reader. The standard viewer remains an explicit user action and is rendered automatically when the custom reader reports a source or page failure, so an external source failure does not remove access to the publication.

## External PDF limitations

The custom reader can load an externally hosted PDF only when that source is browser-readable from the Biblioteca origin. The source must return a valid PDF, permit the Biblioteca origin with CORS (including redirects), and expose the headers/range responses PDF.js needs for incremental loading. A source that blocks CORS, redirects without CORS, rejects range requests, or serves a viewer page instead of PDF bytes may fail in the custom reader. The standard viewer URL is therefore kept separate and is not silently substituted into the custom reader.
