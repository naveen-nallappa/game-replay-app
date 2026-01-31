# ⚾ Spoiler-Free Game Replay

A React single-page application that lets baseball fans experience game boxscores progressively without spoilers.

## Features

- **Spoiler-Free Experience** - No final score revealed upfront
- **Three Viewing Modes**:
  - **Half-Inning Mode** - Progress through the game half-inning by half-inning
  - **Play-by-Play Mode** - See every play as it happened
  - **Pitch-by-Pitch Mode** - Experience key at-bats pitch by pitch
- **Retro Scoreboard Design** - Classic flip-digit animations
- **TV-Style Score Bug** - Visual diamond showing baserunners, outs, and count
- **Adjustable Playback Speed** - Slow, Normal, Fast, or Rapid
- **Home Run Celebrations** - Fireworks and dancing score bug animations
- **MLB Stats API Integration** - Load real games from any date

## Usage

Simply open `game-replay.html` in a web browser. No build step required!

1. Select a date to browse available games
2. Choose a game to replay
3. Select your preferred viewing mode
4. Press play and enjoy the spoiler-free experience!

## Demo

The app includes a sample Red Sox vs Yankees game with full pitch-by-pitch data for dramatic moments.

## Tech Stack

- React 18 with Hooks
- Tailwind CSS
- Babel (in-browser transpilation)
- MLB Stats API

## Files

- `game-replay.html` - Complete single-file application (recommended)
- `GameReplay.jsx` - Static data version (development)
- `GameReplayWithAPI.jsx` - API integration version (development)

## License

MIT
