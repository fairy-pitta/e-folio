---
title: "Printable Spectrogram"
description: "Turns a recording into a configurable, annotated spectrogram you can export for a paper, without installing Python."
date: "31 Jan, 2026"
coverImage: "/projects/printable-spectrogram/spectrogram_main.webp"
tags: ["Web App", "TypeScript", "React", "Rust", "WASM", "Audio Processing", "DSP"]
stack: "Browser · Rust/WASM"
highlight: "The STFT is written in Rust and compiled to WebAssembly"
liveUrl: "https://spectrogram.fairy-pitta.net/"
githubUrl: "https://github.com/fairy-pitta/printable_spectrogram"
gallery: []
---

## Background

To make a spectrogram for a paper I used to install Python with librosa and matplotlib, write a script to set the STFT parameters, then add labels in another program. It took several rounds before a figure was ready.

Printable Spectrogram does this in the browser. You upload a recording, adjust the settings while watching the preview, add labels and export the figure.

## What it does

- Upload WAV, MP3, OGG or M4A
- STFT settings: `n_fft` from 512 to 4096, `hop_length`, Hann, Hamming or Blackman window, magnitude or power, dB range, reference dB and top dB
- Linear or log frequency axis, and adjustable time and frequency ranges
- Colour maps (viridis, magma, greyscale), brightness, contrast, gamma and smoothing
- Axes and a colour bar in dB
- Text, arrow and rectangle annotations
- Export as SVG, or as PNG at 150, 300 or 600 dpi

## Design

The STFT is the slowest part, so it is written in Rust (rustfft) and compiled to WebAssembly. The tool still runs without a server.

Annotations are drawn in a separate SVG layer. In an SVG export they stay as vector graphics.

The code is split into domain, use-case, infrastructure and presentation layers. The DSP code and the UI are tested separately, with Cargo for Rust and Vitest for TypeScript.

```
┌─────────────────────────────────────────┐
│     Presentation Layer (React UI)       │
├─────────────────────────────────────────┤
│     Use Case Layer (Application)        │
├─────────────────────────────────────────┤
│     Domain Layer (Business Logic)       │
├─────────────────────────────────────────┤
│  Infrastructure Layer (WASM, Audio I/O) │
└─────────────────────────────────────────┘
```

## Stack

React, TypeScript and Vite, with Rust and wasm-pack for the DSP code.
