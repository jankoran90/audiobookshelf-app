# Changelog — audiobookshelf-app (JK fork)

Toto je soukromý fork aplikace [Audiobookshelf](https://github.com/advplyr/audiobookshelf-app) s vlastními úpravami.

---

## v2.0.0 — Skin systém + Kids mode (2026-06-02)

### Nové funkce

#### Skin systém (UI profile swap)
Celá vrstva UI lze přepnout na jiný "skin" bez restartu serveru. Každý skin nahrazuje: Appbar, SideDrawer, AudioPlayer a Bookshelf za vlastní komponenty.

- **Settings → Profil UI** — výběr aktivního skinu
- Výběr se uloží lokálně (Capacitor Preferences), stav přetrvá i po restartu
- Middleware `skin-guard` blokuje v kids módu přístup na zakázané routy (YouTube, Stats, Logs…)

#### Kids mode 🧸
Zjednodušené UI pro děti — aktivuj v Nastavení → Profil UI → Dětský režim.

- **Appbar**: velké jméno knihovny, jen back arrow — žádný search, cast, hamburger
- **SideDrawer**: jen Domů + Stažené — žádný YouTube, Stats, Account, Settings, Logs
- **Bookshelf**: velká karta (min 160px), cover art s progress barem, bez sort/filter
- **AudioPlayer**: giant play/pause (96px), seek ±30s, velký cover art, progress bar, čas zbývající — žádný sleep timer, chapters, queue, speed

#### YouTube streaming (snoopy)
- Přehrávání YouTube videí přes InnerTube API (přímé stream URL z telefonu)
- ExoPlayer TextureView overlay (nativní přehrávač, plné media notifications)
- Download videa přes Android DownloadManager
- Browse YouTube kanálů přímo v app

#### Remote UI (Varianta B)
- Settings → Remote UI: zapni a zadej URL externího frontendu
- Komunikace přes postMessage s ABS SDK (`/static/abs-sdk.js`)
- Whitelist Capacitor metod pro bezpečné volání z remote frontendu

### Architektura skin systému

```
composables/useSkin.js          SKINS definice (default + kids)
store/index.js                  activeSkinId state + activeSkin getter
plugins/localStore.js           getSkinId/setSkinId (Capacitor Preferences)
plugins/init.client.js          inicializace skinu při startu app
middleware/skin-guard.js        redirect na /bookshelf pro zakázané routy
layouts/default.vue             <component :is="skin.appbar|sideDrawer">
AudioPlayerContainer.vue        v-if kids player / v-show original
pages/bookshelf/index.vue       <skins-kids-bookshelf v-if="isKidsSkin">
pages/settings.vue              Profil UI dropdown
components/skins/kids/          Appbar, SideDrawer, AudioPlayer, Bookshelf
```

**Přidat nový skin:** přidat klíč do `SKINS` v `useSkin.js` + vytvořit komponenty v `components/skins/<id>/`.

### Předchozí verze (0.x)

| Verze | Datum | Co přibylo |
|-------|-------|-----------|
| 0.13.0-jk.7 | 2026-06-02 | Remote theme loader, Kids theme v settings |
| 0.13.0-jk.6 | 2026-06-02 | Design tokens, usePlayer/useQueue/useTheme composables |
| 0.13.0-jk.5 | 2026-06-02 | Spinner fix (timeout na loadInProgressEpisodes) |
| 0.13.0-jk.4 | 2026-06-02 | Remote UI iframe + postMessage + abs-sdk.js; ExoPlayer + DownloadManager |
| 0.13.0-jk.3 | 2026-05-29 | Queue fix (duplicita, progress, z-index) |
| 0.13.0-jk.2 | 2026-05-29 | Fronta přehrávání, Play All, playlist picker, Pocket Casts redesign |
| 0.13.0-jk.1 | 2026-05-29 | Fork, in-progress homepage, základní queue, signed APK |

---

## Jak nainstalovat APK

1. Jdi na [Releases](https://github.com/jankoran90/audiobookshelf-app/releases)
2. Stáhni nejnovější `audiobookshelf-*.apk`
3. Na telefonu: Nastavení → Bezpečnost → Neznámé zdroje → Povolit
4. Otevři APK soubor → Nainstalovat

**Aktualizace přes Obtainium:** Přidej repo `jankoran90/audiobookshelf-app`, typ: GitHub Releases.

---

## Návod k použití

### Kids mode — nastavení

1. Otevři app → menu (hamburger) → **Nastavení**
2. Sekce "Profil UI" → klikni na dropdown → vyber **Dětský režim 🧸**
3. App se restartuje a zobrazí zjednodušené UI

**Zpět na výchozí UI:** Nastavení jsou dostupná i v kids módu přes SideDrawer → Nastavení ne — musíš přejít přes URL nebo dočasně změnit skin jinak... _Poznámka: settings jsou v kids módu blokovány skin-guardem. Viz sekci níže._

> **Tip:** Pokud se chceš dostat zpět ze kids módu, přepni skin zpět přes ADB nebo přidej `/settings` do `allowedRoutes` v `useSkin.js`.

### Přehrávač

- **Klik na epizodu** → spustí přehrávání
- **+/- 30 sekund** — tlačítka kolem play/pause
- **Progress bar** — zobrazuje průběh
- **Mini přehrávač** — spodní lišta; klik → rozbalí plný přehrávač

### Fronta přehrávání (výchozí skin)

- Tlačítko `add_to_queue` na každé epizodě přidá do fronty
- Fronta se zobrazí v přehrávači (ikona `queue_music`)
- Play All → přidá všechny filtrované epizody do fronty
- Šipkami v queue panelu lze měnit pořadí

### YouTube (výchozí skin)

- Menu → **YouTube**
- Přidej URL YouTube kanálu → Uložit
- Browse videí → klik → přehraje přes ExoPlayer
- Tlačítko stáhnout → uloží video do Downloads

---

## Vývoj

```bash
# Lokální build (ověření Vue/Nuxt kompilace)
cd /root/projects/audiobookshelf-app
npm run generate

# Push → automatický APK build přes GitHub Actions
git push origin master

# Přidat nový skin:
# 1. Přidat do SKINS v composables/useSkin.js
# 2. Vytvořit komponenty: components/skins/<id>/Appbar.vue, SideDrawer.vue, AudioPlayer.vue, Bookshelf.vue
```
