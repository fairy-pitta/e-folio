---
title: "Learning Singapore’s Birds by Ear: A Look at the SingBirds Call Quiz"
description: "An interactive quiz web app to test out your bird call knowledge"
date: "Oct 15, 2024"
coverImage: "/projects/callquiz/CallQuiz_main.png"
tags: ["React", "Django", "Birds"]
liveUrl: "https://quiz.singbirds.net/"
githubUrl: "https://github.com/fairy-pitta/Singbirds-frontend"
gallery: [
  "/projects/callquiz/CallQuiz_correct.png",
  "/projects/callquiz/CallQuiz_home.png",
  "/projects/callquiz/CallQuiz_result.png",
  "/projects/callquiz/CallQuiz_top.png"
]
---

# Learning Singapore’s Birds by Ear: A Look at the SingBirds Call Quiz

## Overview

SingBirds Call Quiz is an interactive web application that challenges players to identify bird species by their songs. The game is centered around birds found in **Singapore**, making it both a fun and educational experience.

Players view a **spectrogram** of a bird call and listen to the audio recording before choosing the correct bird species from multiple-choice options. After submitting an answer, they can view detailed information and a photo of the bird.

---

## Features

- 🎧 **Bird Call Audio**: Listen to real bird recordings.
- 📈 **Spectrogram Display**: Visualize bird calls using spectrograms.
- ❓ **Multiple-Choice Questions**: Pick the correct species from a list of options.
- 📝 **Detailed Feedback**:
  - See which birds you identified correctly or incorrectly.
  - Access bird information via Wikipedia API after answering.
  - View bird images dynamically pulled from Wikipedia.
- 🌎 **Hotspot and Country Selection**: Select specific countries (currently only Singapore) and birding hotspots.
- 🎚️ **Adjustable Quiz Settings**: Set the number of questions.
- 📊 **Quiz Result Summary**: Review your score, accuracy, and species performance.

---

## Tech Stack

### Frontend
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for styling

### Backend
- [Django](https://www.djangoproject.com/) with Django REST Framework
- Custom APIs serving species lists, hotspot data, and bird observation records

### Audio Processing
- [Librosa](https://librosa.org/) for audio analysis
- [Matplotlib](https://matplotlib.org/) for spectrogram generation

---

## Data Sources

- **eBird API**:
  - Retrieves Singapore hotspots
  - Gets bird species observed at hotspots over the past 30 days (snapshot taken in October)

- **Xeno-Canto API**:
  - Provides bird song recordings
  - Filters recordings with **Quality A** and durations between **0–30 seconds**

- **Wikipedia API**:
  - Fetches species descriptions and images dynamically

---

## App Flow

1. Player selects a country (currently only Singapore) and a hotspot.
2. App retrieves a list of birds based on recent observations (snapshot taken in Oct 2024).
3. Spectrogram and audio are displayed.
4. Player submits an answer.
5. App shows feedback, Wikipedia information, and bird photo.
6. After the quiz, a final score and breakdown are shown.



Made with ❤️ for bird lovers around the world.


