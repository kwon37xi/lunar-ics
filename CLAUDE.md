# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lunar-ics** is a TypeScript/React frontend application that converts Korean lunar (음력) calendar dates to ICS format, allowing users to import lunar calendar events into standard calendar applications (Google Calendar, Apple Calendar, etc.).

## Tech Stack

- **Language:** TypeScript
- **Framework:** React
- **Build Tool:** Vite
- **Package Manager:** pnpm
- **Lunar Conversion:** `korean-lunar-calendar` npm package

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm lint             # Run linter
pnpm test             # Run tests
pnpm test -- --run <file>  # Run a single test file
```

## Architecture

The app takes lunar calendar dates as user input, converts them to Gregorian (양력) dates using `korean-lunar-calendar`, then generates downloadable `.ics` files following the iCalendar (RFC 5545) specification.

Key flow: **User Input (음력 dates) → Lunar-to-Gregorian conversion → ICS generation → File download**
