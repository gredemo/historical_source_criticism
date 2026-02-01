# Källanalys-träning

En interaktiv webbapp för gymnasieelever att träna källkritiska färdigheter.

## Installation

1. Skapa en ny mapp och packa upp alla filer
2. Öppna terminalen i projektmappen
3. Kör: `npm install`
4. Kör: `npm run dev`
5. Öppna webbläsaren på http://localhost:5173

## Struktur

- `/public/sources/` - JSON-filer med källmaterial
- `/src/components/` - React-komponenter
- `/src/App.jsx` - Huvudkomponent
- `/src/main.jsx` - Entry point

## Lägg till nya källor

1. Skapa en ny JSON-fil i `/public/sources/`
2. Följ strukturen i `himmler-posen.json`
3. Uppdatera `App.jsx` för att ladda den nya källan

## Anpassa feedback

Redigera JSON-filen och ändra:
- `keywords` - Lägg till synonymer
- `feedback` - Ändra feedback-texter
- `feedback_levels` - Justera bedömningskriterier# historical_source_criticism
