---
title: BAETEE memory vault
type: map-of-content
tags: [meta, index]
updated: 2026-10-12
---

# BAETEE project vault

Open this `docs/` folder as an Obsidian vault. This is the memory layer for humans and AI agents working on the project: scan the code first, keep these notes true, and record every decision here.

## Start here

- Root `deploy.md` — current Vercel + Oracle + Supabase deployment runbook
- Root `deployment-needed.md` — current access, secrets and store decisions needed from the owner

- [[Backend-Implementation]] — backend code, runbook and launch gates
- [[Database-and-Storefront]] — database connection, Admin product editing, visibility and integration checks
- [[Keys-and-Access-Needed]] — exact accounts, settings and store decisions needed from the owner
- [[Backend-Plan]] — original plan and phase acceptance checks; its hosting and email sections are historical
- [[Project-Overview]] — what this repo is, stack, history, current status
- [[Agent-Playbook]] — how an AI agent should work in this repo (read before changing code)
- [[Codebase-Map]] — every directory and file, and which are live vs orphaned
- [[Routes-and-API]] — pages, endpoints, what actually renders
- [[Catalog-Data]] — the 15/15/15 product data model and pricing source of truth
- [[Client-State]] — local and Medusa cart behaviour, plus rotation keys
- [[Design-System]] — colours, type, frames, breakpoints, motion rules
- [[Brand-and-Copy]] — voice, dedication, names, hard "do not invent" rules
- [[Known-Drift]] — docs vs code mismatches and dead code (read before trusting docs)
- [[Pending-Work]] — what is deliberately disabled and what unblocks it

## Project records (maintained by hand)

- [[constitution]] — behavioural rules the user requires
- [[Architecture]] — current structure and editing guide
- [[Changes]] — approved changes and what shipped, chronological
- [[Pricing]] — fixed T-shirt prices in INR
- [[Security]] — security boundaries and pre-launch checklist
- [[Size-Guide]] — loose-fit guide, numeric chart pending supplier data
- [[Artwork-Stories]] — story copy for the 15 artworks
- [[Weekly-Updates]] — Monday design-set process
- [[Vercel-Export]] — export provenance and stack pins
- [[Export-Validation]] — last verified build/test evidence

## Conventions

- One note per concept. Wikilink with double brackets, never hardcode paths between notes.
- Frontmatter on every note: `title`, `type`, `tags`, `updated`.
- When code changes: update [[Known-Drift]] first (close an entry or move it), then the affected note, then append to [[Changes]].
- Never put credentials, tokens, or personal data in this vault.
