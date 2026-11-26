# ZENTRO

A responsive multilingual workspace with 18 browser-based utilities and optional AI tools.

## Included
- 18 tools: AI prompt maker, caption generator, word counter, text case converter, duplicate-line remover, color palette, CSS gradient, image resizer, password generator, JSON formatter, URL encoder/decoder, Base64 converter, percentage calculator, unit converter, date difference, random number, emoji mixer, quick web search.
- 13 language choices in the language selector. The interface translations are fully supplied for English, Persian, Spanish and French; other language choices currently keep English interface text while setting the selected language direction/metadata.
- Optional server-side AI endpoints for prompt generation, captions, summarization, translation and rewriting.
- API status endpoint at `/api/status`.

## Run locally
1. Install Node.js 18 or newer.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` if you want AI features.
4. Add your API key to `OPENAI_API_KEY` in `.env`.
5. Run `npm start` and open `http://localhost:3000`.

## Deploy on Render
1. Push this project to the GitHub repository named `ZENTRO`.
2. In Render create **New → Web Service**, connect the repository.
3. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables in Render: `OPENAI_API_KEY`, optionally `OPENAI_BASE_URL` and `OPENAI_MODEL`.
5. Deploy. Open `/api/status` on the deployed site to check the API.

## Security
Never put a private API key in `public/` or commit a real `.env` file. Configure secrets in Render's Environment settings.
