import csv
import json
import os
import random

from dotenv import load_dotenv
import numpy as np
from openai import APIConnectionError, AuthenticationError, OpenAI, RateLimitError
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE

client = None


def get_embedding(client: OpenAI, text: str, use_mocks: bool) -> list[float]:
    if use_mocks:
        seed = abs(hash(text)) % (2**32)
        rng = random.Random(seed)
        return [rng.uniform(-1.0, 1.0) for _ in range(32)]

    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding
    except RateLimitError as exc:
        raise RuntimeError(
            "OpenAI API quota exceeded. Check your billing/plan and try again."
        ) from exc
    except AuthenticationError as exc:
        raise RuntimeError(
            "OpenAI API key is invalid or missing. Check OPENAI_API_KEY in .env."
        ) from exc
    except APIConnectionError as exc:
        raise RuntimeError(
            "Network error connecting to OpenAI. Check your internet and try again."
        ) from exc


def analyze_cluster(
    cluster_of_texts: list[str],
    use_mocks: bool,
    model: str,
) -> str:
    if use_mocks:
        joined = " ".join(cluster_of_texts).lower()
        if "login" in joined or "password" in joined or "sign in" in joined:
            return "Fix Login Issues"
        if "dark" in joined or "bright" in joined or "theme" in joined:
            return "Add Dark Mode"
        return "Improve User Experience"

    prompt = (
        "Here is a list of user feedback. Summarize what these users want in 3 "
        "words (e.g., 'Fix Login Bug').\n\n"
        + "\n".join(f"- {text}" for text in cluster_of_texts)
    )
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()


def main() -> None:
    load_dotenv()
    use_mocks = os.getenv("USE_MOCKS", "false").lower() == "true"
    global client
    if use_mocks:
        client = None
    else:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY not set. Add it to your .env file.")
        client = OpenAI(api_key=api_key)

    feedback_df = pd.read_csv("spotify.csv")
    user_feedback = (
        feedback_df["Review"].dropna().astype(str).head(150).tolist()
    )

    matrix = []
    for text in user_feedback:
        embedding = get_embedding(client, text, use_mocks)
        matrix.append(embedding)

    matrix = np.array(matrix)

    kmeans = KMeans(n_clusters=5, random_state=42, n_init="auto")
    kmeans.fit(matrix)
    labels = kmeans.labels_

    tsne = TSNE(n_components=2, perplexity=5, random_state=42)
    coords = tsne.fit_transform(matrix)

    df = pd.DataFrame(
        {
            "Feedback_Text": user_feedback,
            "Cluster_ID": labels,
            "x": coords[:, 0],
            "y": coords[:, 1],
        }
    )

    df_sorted = df.sort_values(by="Cluster_ID").reset_index(drop=True)
    print(df_sorted)

    topic_names = {}
    for cluster_id in sorted(df["Cluster_ID"].unique()):
        cluster_texts = df.loc[
            df["Cluster_ID"] == cluster_id,
            "Feedback_Text",
        ].tolist()
        sample_texts = cluster_texts[:5]
        title = analyze_cluster(sample_texts, use_mocks, model="gpt-4o-mini")
        topic_names[cluster_id] = title
        print(f"Cluster {cluster_id} Title: {title}\n")
        for text in cluster_texts:
            print(text)
        print()

    output_data = []
    for _, row in df.iterrows():
        output_data.append(
            {
                "text": row["Feedback_Text"],
                "cluster_id": int(row["Cluster_ID"]),
                "topic_name": topic_names[int(row["Cluster_ID"])],
                "coords": [float(row["x"]), float(row["y"])],
            }
        )

    output_dir = os.path.join("frontend", "src")
    if not os.path.isdir(output_dir):
        raise RuntimeError("frontend/src directory not found.")

    output_path = os.path.join(output_dir, "cluster_data.json")
    with open(output_path, "w", encoding="utf-8") as file_handle:
        json.dump(output_data, file_handle, ensure_ascii=False, indent=2)

    print(f"Successfully created embeddings for {len(matrix)} items.")
    print(f"Done! Saved {len(output_data)} items to {output_path}")


if __name__ == "__main__":
    main()
