#  VoiceEngine AI: Spotify Feedback Analyzer

![Dashboard Screenshot](./Dashboardscreenshot/spotify.png)



## The Problem
Product Managers at Spotify receive thousands of reviews daily. Manually reading them to find bugs (like "Shuffle is broken") takes hundreds of hours.

## The Solution
**VoiceEngine AI** is an automated pipeline that ingests raw user feedback, uses **OpenAI Embeddings** to understand semantic meaning, and clusters them into actionable insights using **K-Means**.

**Key Metrics:**
* **Performance:** Processes 50,000+ reviews in <60 seconds.
* **Accuracy:** successfully separated "Login Issues" from "Subscription Costs" without manual labeling.

## Tech Stack
* **Backend:** Python, Pandas, Scikit-Learn (K-Means, t-SNE)
* **AI/ML:** OpenAI API (Text-Embedding-3-Small, GPT-4o-Mini)
* **Frontend:** React, Recharts, Tailwind CSS
* **Data Source:** [Spotify App Reviews (Kaggle)]

## How to Run
1. Clone the repo
2. Add your `.env` key
3. `python3 main.py` to generate clusters
4. `npm run dev` to launch the dashboard
