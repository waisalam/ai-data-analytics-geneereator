from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from clean import clean_dataframe, detect_columns, generate_charts, explain_chart, generate_dataset_summary
import pandas as pd 
import io

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-data-analytics-geneereator.vercel.app"
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

@app.get("/")

def root():
    return {"status": "AI Analytics API is running"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))


    df, cleaning_report = clean_dataframe(df)
    date_cols, number_cols, text_cols = detect_columns(df)
    charts = generate_charts(df, date_cols, number_cols, text_cols)
    dataset_summary = generate_dataset_summary(df)

    for chart in charts:
        chart["explanation"] = explain_chart(chart)

    return {
        "cleaning_report": cleaning_report,
        "charts": charts,
        "columns": {
            "date": date_cols,
            "number": number_cols,
            "text": text_cols
        },
        "dataset_summary": dataset_summary
    }






