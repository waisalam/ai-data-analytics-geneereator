# clean.py
import pandas as pd
from dotenv import load_dotenv
import os
import google.generativeai as genai
from transformers import pipeline

load_dotenv()

def get_pipe():
    global _pipe
    if _pipe is None:
        print("Loading phi-2 for first time...")
        _pipe = pipeline(
            "text-generation",
            model="microsoft/phi-2",
            trust_remote_code=True,
        )
    return _pipe

# pipe = pipeline(
#     "text-generation",
#      model="microsoft/phi-2",
#     trust_remote_code=True,
    
# )
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini = genai.GenerativeModel("gemini-2.0-flash-lite")

def clean_dataframe(df):
    cleaning_report = []
    original_rows = len(df)

    for col in df.columns:
        as_numbers = pd.to_numeric(df[col], errors="coerce")
        is_number_col = as_numbers.notna().sum() >= len(df) * 0.5

        if is_number_col:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            missing_count = df[col].isna().sum()
            if missing_count > 0:
                average = df[col].mean().round(2)
                df[col] = df[col].fillna(average)
                cleaning_report.append(
                    f"'{col}' filled {missing_count} missing values with average ({average})"
                )
        else:
            missing_count = df[col].isna().sum()
            if missing_count > 0:
                most_common = df[col].mode()[0]
                df[col] = df[col].fillna(most_common)
                cleaning_report.append(
                    f"'{col}' filled {missing_count} missing values with most common ('{most_common}')"
                )

    # always add summary even if data was clean
    cleaning_report.insert(0, f"Loaded {original_rows} rows and {len(df.columns)} columns")

    if len(cleaning_report) == 1:
        cleaning_report.append("Data is already clean — no missing values found")

    return df, cleaning_report


def detect_columns(df):
    date_cols, number_cols, text_cols = [], [], []
    
    for col in df.columns:
        # try number first
        as_numbers = pd.to_numeric(df[col], errors="coerce")
        success_rate = as_numbers.notna().sum() / len(df)
        
        if success_rate >= 0.7:  # 70% are numbers = number column
            number_cols.append(col)
            continue

        # try date
        sample = df[col].dropna().astype(str).iloc[0]
        if "-" in sample or "/" in sample:
            try:
                pd.to_datetime(df[col])
                date_cols.append(col)
                continue
            except:
                pass

        # everything else is text/category
        text_cols.append(col)

    return date_cols, number_cols, text_cols


def generate_charts(df, date_cols, number_cols, text_cols):
    charts = []

    # line charts: number columns over time/date
    if date_cols and number_cols:
        date_col = date_cols[0]
        for num_col in number_cols:
            charts.append({
                "title": f"{num_col} over time",
                "type": "line",
                "x": df[date_col].astype(str).tolist(),
                "y": pd.to_numeric(df[num_col], errors="coerce").fillna(0).tolist(),
                "x_label": date_col,
                "y_label": num_col,
                "explanation": ""
            })

    # bar charts: number columns grouped by text columns
    if text_cols and number_cols:
        for text_col in text_cols[:3]:  # max 3 text columns
            for num_col in number_cols[:3]:  # max 3 number columns
                try:
                    grouped = df.groupby(text_col)[num_col].sum().reset_index()
                    grouped = grouped.sort_values(num_col, ascending=False).head(20)
                    
                    charts.append({
                        "title": f"{num_col} by {text_col}",
                        "type": "bar",
                        "x": grouped[text_col].astype(str).tolist(),
                        "y": pd.to_numeric(grouped[num_col], errors="coerce").fillna(0).tolist(),
                        "x_label": text_col,
                        "y_label": num_col,
                        "explanation": ""
                    })
                except:
                    continue

    return charts

def explain_chart(chart):
    x = chart["x"]
    y = chart["y"]
    title = chart["title"]

    # try Gemini first
    try:
        data_summary = ""
        for xi, yi in zip(x[:10], y[:10]):
            data_summary += f"{xi}: {yi}\n"

        prompt = f"""You are a business analyst. Analyze this chart in 2 sentences.
Chart: {title}
Data:
{data_summary}
Give a short business insight. No technical jargon."""

        response = gemini.generate_content(prompt)
        return response.text.strip()

    except Exception:
        # Gemini failed → try phi-2
        try:
            data_summary = ""
            for xi, yi in zip(x[:5], y[:5]):
                data_summary += f"{xi}: {yi}\n"

            prompt = f"Chart: {title}\nData:\n{data_summary}\nBusiness insight:"

            result = get_pipe()(   # ← loads only when Gemini fails
            prompt,
            max_new_tokens=50,
            temperature=0.3,
            do_sample=True,
            return_full_text=False
            )

            response = result[0]["generated_text"].strip()
            sentences = response.split(".")
            clean = ". ".join(sentences[:2]).strip()
            if clean and not clean.endswith("."):
                clean += "."
            return clean

        except Exception:
            # both failed → pure Python fallback
            print('gemini got failed trying with phi-2')
            if not y:
                return "No data available."

            max_val = max(y)
            min_val = min(y)
            max_point = x[y.index(max_val)]
            min_point = x[y.index(min_val)]

            if chart["type"] == "line":
                first, last = y[0], y[-1]
                change = ((last - first) / first * 100) if first != 0 else 0
                trend = "increased" if change > 0 else "decreased"
                return (
                    f"{title} {trend} by {abs(change):.1f}% overall. "
                    f"Highest was {max_val} at {max_point}, lowest was {min_val} at {min_point}."
                )
            else:
                top = x[y.index(max_val)]
                bottom = x[y.index(min_val)]
                return (
                    f"{top} leads with {max_val}. "
                    f"{bottom} is lowest with {min_val}."
                )