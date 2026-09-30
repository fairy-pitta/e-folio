---
title: "Testing BirdNET In-Built model with Singapore Birds"
date: May 18, 2025
excerpt: "Evaluating BirdNET’s accuracy on common Singaporean birds reveals strengths and weaknesses"
coverImage: "/blogs/hornbill_call.webp"
readTime: "10 min read"
tags: ["BirdNET", "bioacoustics"]
draft: true
---

<!--
SKELETON — rewrite in your own words before publishing (then delete `draft: true` and this comment).
Facts below come from an earlier AI-written draft; check each one.

Removed claims to verify (unsourced or not from my own experience):
- Explanations for why species did well/badly (clear calls cut through noise; overlapping vocal traits; under-represented in training data; woodpecker trill blends with insect/leaf sounds)
- Exact recall for Eurasian Tree Sparrow and Olive-backed Sunbird (draft only says "solid but imperfect"; numbers are in the plot)
- Overall conclusion "highly reliable for distinctive, well-represented calls; drops for subtler/noisier/rarer birds"
- Planned next step: fine-tune BirdNET for Singaporean birds
- "30 most familiar residents" framing
-->

## Question
- How accurate is the default BirdNET model on real Southeast Asian recordings of common Singapore birds?

## Setup
- Cloned [BirdNET-Analyzer](https://github.com/birdnet-team/BirdNET-Analyzer), built a Docker image locally
- Dockerfile needed path fixes (details: check)

```Dockerfile
FROM python:3.11

# Install FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy BirdNET code
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip \
 && pip install .

# Set entrypoint
ENTRYPOINT ["python3", "-m", "birdnet_analyzer.analyze"]
```

- Location set to Singapore: lat 1.35, lon 103.8
- Each file scored on its dominant call; detections filtered to confidence > 85%
- Analysis in R:

```r
df |>
  filter(Confidence > 0.85) |>
  mutate(duration = `End Time (s)` - `Begin Time (s)`) |>
  group_by(File, detected_com_name, original_com_name) |>
  summarise(total_duration = sum(duration)) |>
  slice_max(total_duration, n = 1) |>
  ungroup() |>
  mutate(isCorrect = if_else(detected_com_name == original_com_name, 1, 0)) |>
  group_by(original_com_name) |>
  summarise(
    numOfRecordings = n(),
    CorrectId = sum(isCorrect),
    recall = round(CorrectId / numOfRecordings * 100, 0)
  )
```

## Species tested
- The 30 species of NParks [Garden Bird Watch](http://nparks.gov.sg/nature/community-in-nature/garden-bird-watch)
- 10 recordings each for 27 species (source: Xeno-Canto)

1. Common Myna (*Acridotheres tristis*)
2. Large-billed Crow (*Corvus macrorhynchos*)
3. Yellow-vented Bulbul (*Pycnonotus goiavier*)
4. Asian Koel (*Eudynamys scolopaceus*)
5. White-breasted Waterhen (*Amaurornis phoenicurus*)
6. Asian Glossy Starling (*Aplonis panayensis*)
7. Scarlet-backed Flowerpecker (*Dicaeum cruentatum*)
8. Common Iora (*Aegithina tiphia*)
9. Swinhoe's White-eye (*Zosterops simplex*)
10. Collared Kingfisher (*Todiramphus chloris*)
11. Red Junglefowl (*Gallus gallus*)
12. Eurasian Tree Sparrow (*Passer montanus*)
13. White-throated Kingfisher (*Halcyon smyrnensis*)
14. Common Tailorbird (*Orthotomus sutorius*)
15. Rock Pigeon (*Columba livia*)
16. Olive-backed Sunbird (*Cinnyris jugularis*)
17. Spotted Dove (*Spilopelia chinensis*)
18. Brown-throated Sunbird (*Anthreptes malacensis*)
19. Blue-tailed Bee-eater (*Merops philippinus*)
20. Blue-throated Bee-eater (*Merops viridis*)
21. Pink-necked Green Pigeon (*Treron vernans*)
22. Sunda Pygmy Woodpecker (*Yungipicus moluccensis*)
23. Oriental Pied Hornbill (*Anthracoceros albirostris*)
24. Common Flameback (*Dinopium javanense*)
25. Scaly-breasted Munia (*Lonchura punctulata*)
26. Zebra Dove (*Geopelia striata*)
27. House Crow (*Corvus splendens*)

- Not used (could not be retrieved from Xeno-Canto; restricted recordings, see [xeno-canto FAQ](https://xeno-canto.org/help/FAQ#restricted)):
  - Javan Myna (*Acridotheres javanicus*)
  - Oriental Magpie-Robin (*Copsychus saularis*)
  - Black-naped Oriole (*Oriolus chinensis*)

## Results
- Metric: recall per species (share of recordings whose dominant detection was the right species)

![Precision by Bird Species](/blogs/birdnet_default_model_plot.webp)

- Spotted Dove: 100%
- White-breasted Waterhen: 100%
- Eurasian Tree Sparrow, Olive-backed Sunbird: middle, solid but imperfect (exact values: read from plot)
- Sunda Pygmy Woodpecker: 0%

## Limitations
- Recordings from Xeno-Canto, 10 per species; 3 of 30 species missing
- Only the dominant call per file counted; confidence threshold 85% (both affect recall)
- Plot title says "Precision" but the metric is recall (check)

## Takeaway
- Default model works for some species and fails completely for others; species-level results are in the plot
- Next step (planned): fine-tune for Singapore birds (check)

## Links
- [BirdNET-Analyzer](https://github.com/birdnet-team/BirdNET-Analyzer)
- [NParks Garden Bird Watch](http://nparks.gov.sg/nature/community-in-nature/garden-bird-watch)
- [xeno-canto FAQ on restricted recordings](https://xeno-canto.org/help/FAQ#restricted)
