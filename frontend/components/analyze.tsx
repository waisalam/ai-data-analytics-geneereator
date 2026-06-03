'use client'
import { useState } from 'react'

const Analyze = () => {
    const [data, setData] = useState<any>(null)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const handleAnalyzeData = async () => {
        if (!file) return alert("Please select a file first")

        const formData = new FormData()
        formData.append("file", file)

        setLoading(true)
        const response = await fetch('http://127.0.0.1:8000/analyze', {
            method: 'POST',
            body: formData
        })

        const result = await response.json()
        setData(result)
        console.log(result)
        setLoading(false)
    }

    return (
        <div>
            <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button onClick={handleAnalyzeData}>
                {loading ? "Analyzing..." : "Analyze"}
            </button>

            {data && (
                <div>
                    <h2>Cleaning Report</h2>
                    {data.cleaning_report.map((line: string, i: number) => (
                        <p key={i}>✓ {line}</p>
                    ))}

                    <h2>Charts</h2>
                    {data.charts.map((chart: any, i: number) => (
                        <div key={i}>
                            <h3>{chart.title}</h3>
                            <p>{chart.explanation}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Analyze