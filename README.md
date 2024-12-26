# skyzoo.blue & jyc.dev

👋 Thank you for passing by !

## 📣 Special Shoutout

<a href="https://github.com/bluesky-social/atproto">
	<img alt="github" src="https://img.shields.io/github/stars/bluesky-social/atproto?logo=github&label=atproto&color=#4ACC31" />
</a>

[At Protocol](https://atproto.com) - Decentralized network for building social applications.

<a href="https://github.com/remult/remult">
	<img alt="github" src="https://img.shields.io/github/stars/remult/remult?logo=github&label=remult&color=#4ACC31" />
</a>

[Remult](https://remult.dev/) - THE fastest way to build full-stack apps handling data.

<a href="https://github.com/techniq/layerchart">
	<img alt="github" src="https://img.shields.io/github/stars/techniq/layerchart?logo=github&label=layerchart&color=#4ACC31" />
</a>

[LayerCharts](https://layerchart.com/) - Beautiful charts for Svelte

👉 Go and give them some love ! ✨

## 🧑‍💻 Try it locally

```bash
git clone git@github.com:jycouet/jyc.dev.git
pnpm i
pnpm dev
```

Note that you don't need a local Postgres database to run the app, by default it will fallback to
JSON files. Once you want to switch to postgress, add the following environment variables:

```bash
# something like this:
DATABASE_URL=postgres://postgres:postgres@localhost:5432/jyc.dev
```

### Devbox alternative

[![Built with Devbox](https://www.jetify.com/img/devbox/shield_galaxy.svg)](https://www.jetify.com/devbox/docs/contributor-quickstart/)

1. Install [Devbox](https://github.com/jetpack-io/devbox)
   ```bash
   curl -fsSL https://get.jetify.com/devbox | bash
   ```
1. Clone project & start services
   ```bash
   git clone git@github.com:jycouet/jyc.dev.git
   cd jyc.dev
   devbox run start
   ```
