---
kind: personal
title: "SingBirds Call Quiz"
summary: "A quiz that plays a real recording and its spectrogram, and asks which Singapore bird it is."
date: "Oct 15, 2024"
highlight: "Recordings from Xeno-canto, with spectrograms made by librosa"
stack: "Browser · React, Django"
tags: ["React", "Django", "Birds"]
earlier: true
media:
  cover: "/projects/callquiz/CallQuiz_main.webp"
  gallery:
    - "/projects/callquiz/CallQuiz_correct.webp"
    - "/projects/callquiz/CallQuiz_home.webp"
    - "/projects/callquiz/CallQuiz_result.webp"
    - "/projects/callquiz/CallQuiz_top.webp"
---

## About

A quiz for learning Singapore's birds by their calls. Each question plays a recording and shows its spectrogram, and you pick the species from a list. After answering you see a description and a photo of the bird, and at the end a summary of your score.

You can choose a birding hotspot and the number of questions.

## Data

- eBird API: the hotspots in Singapore, and the species seen at each one in the previous 30 days. The species list is a snapshot from October 2024.
- Xeno-canto API: the recordings, limited to quality A and 30 seconds or less.
- Wikipedia API: the descriptions and photos.

## Stack

React and Tailwind CSS on the front end, Django REST Framework on the back end. Spectrograms are made with librosa and Matplotlib.

The quiz is no longer online.
